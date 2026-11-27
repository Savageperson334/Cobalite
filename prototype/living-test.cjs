// node prototype/living-test.cjs
const fs=require("node:fs"),assert=require("node:assert/strict"),path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"living.html"),"utf8");
const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(script);
const worklet=script.match(/const processorCode=`([\s\S]*?)`;/)[1];
const initial=new Function("return "+script.match(/const initial=(\{[^\n]+\});/)[1])();
const presets=new Function("return "+script.match(/const presets=(\{[\s\S]*?\n\});/)[1])();
const INIT_PRE_LIMIT_MAX=1,PRESET_PRE_LIMIT_MAX=1; // measured <=0.35 over 48 blocks at 0.4
for(const sr of [44100,48000]){
 let Synth;
 new Function("AudioWorkletProcessor","registerProcessor","sampleRate",worklet)(class{constructor(){this.port={postMessage(){}};}},(_,c)=>Synth=c,sr);
 const msg=(p,data)=>p.port.onmessage({data});
 function render(patch,blocks=48){
  const p=new Synth();msg(p,{type:"patch",patch});
  for(let i=0;i<8;i++)msg(p,{type:"on",id:i,note:48+4*i,vel:.8});
  let peak=0,energy=0,difference=0,buf=[];
  for(let j=0;j<blocks;j++){const out=[new Float32Array(128),new Float32Array(128)];assert.equal(p.process([], [out]),true);for(let i=0;i<128;i++){const a=out[0][i],b=out[1][i];assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.max(Math.abs(a),Math.abs(b))<=1);peak=Math.max(peak,Math.abs(a),Math.abs(b));energy+=a*a+b*b;difference+=Math.abs(a-b);buf.push(a,b);}}
  assert.equal(p.voices.length,8);assert(energy>0);return {peak,energy,difference,buf,p};
 }
 // Output passes through tanh, so |out|<=1 always holds; measure the level before the limiter instead.
 for(const [name,v] of Object.entries(presets)){const q=render({...initial,...v});console.log(sr+" "+name+" peak "+q.peak.toFixed(3)+" pre-limit "+q.p.preLimitPeak.toFixed(3));assert(Number.isFinite(q.p.preLimitPeak)&&q.p.preLimitPeak<PRESET_PRE_LIMIT_MAX,name+" drives the output limiter too hard");}
 assert(render(initial).p.preLimitPeak<INIT_PRE_LIMIT_MAX,"Init chord should not reach the output limiter");
 for(const balance of [0,1]){const a=render({...initial,balance,interaction:0,relation:0}),b=render({...initial,balance,interaction:1,relation:1});assert(a.buf.every((x,i)=>x===b.buf[i]));}
 // Sample reduction: a near-zero setting is the clean signal, and a small setting stays close to it (no jump to half rate).
 {const clean=render(initial),tiny=render({...initial,hold:.001}),small=render({...initial,hold:.02});assert(tiny.buf.every((x,i)=>x===clean.buf[i]));let held=0;for(let i=2;i<small.buf.length;i+=2)if(small.buf[i]===small.buf[i-2])held++;assert(held/(small.buf.length/2)<.1,"hold .02 repeats "+held+" samples");}
 // Retrigger: re-striking a note keeps the old voice releasing instead of cutting it.
 {const p=new Synth();msg(p,{type:"patch",patch:initial});msg(p,{type:"on",id:5,note:60,vel:.8});for(let j=0;j<20;j++)p.process([],[[new Float32Array(128),new Float32Array(128)]]);msg(p,{type:"off",id:5});msg(p,{type:"on",id:5,note:60,vel:.8});assert.equal(p.voices.length,2);assert(p.voices[0].off&&p.voices[0].id===null&&!p.voices[1].off);msg(p,{type:"off",id:5});assert(p.voices.every(v=>v.off));}
 const p=new Synth(),links=[];
 for(let from=0;from<3;from++)for(let to=0;to<3;to++)if(from!==to)links.push({from,to,kind:["rate","shape","depth"][to],amount:from%2?-1:1});
 const patch={...initial,rate:.7,rate2:.9,rate3:.5,lshape3:1,links};
 const seeds=p.seed.slice();
 for(let j=0;j<20000;j++){p.networkStep(patch,128);p.netOut=p.netTarget.slice();assert(p.netOut.every(x=>Number.isFinite(x)&&Math.abs(x)<=1.000001));assert(p.netRate.every(x=>x>=.005&&x<=16.000001));}
 assert(p.seed.some((x,i)=>x!==seeds[i]));
 const z=render({...initial,spread:1});assert(z.difference>0);
 const q=z.p;
 msg(q,{type:"perf",key:"wheel",value:.8});msg(q,{type:"perf",key:"pressure",value:.6});for(let j=0;j<50;j++)q.process([], [[new Float32Array(128),new Float32Array(128)]]);assert(Math.abs(q.perf.wheel-.8)<.001&&Math.abs(q.perf.pressure-.6)<.001);
 msg(q,{type:"roamStart",path:[{id:"cutoff",sign:1,limit:.48},{id:"relation",sign:1,limit:.45},{id:"spread",sign:1,limit:.55}],duration:180,depth:.5,contour:"wander"});q.roamStep(sr*61);assert.equal(Math.floor(q.roam.phase*3),1);msg(q,{type:"roamFreeze",frozen:true});const ph=q.roam.phase;q.roamStep(sr);assert.equal(q.roam.phase,ph);msg(q,{type:"roamStop"});q.roamStep(sr*6);assert(Object.values(q.roamOffsets).every(x=>Math.abs(x)<.001));
 msg(q,{type:"on",id:99,note:72,vel:.8});assert.equal(q.voices.length,8);msg(q,{type:"panic"});assert.equal(q.voices.length,0);
 console.log(sr+" Hz: endpoint invariance, bounded network, random state, stereo, performance controls, Roam and voice handling passed.");
}
