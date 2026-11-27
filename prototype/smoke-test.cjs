// Run: node prototype/smoke-test.cjs
const fs=require("node:fs"),assert=require("node:assert/strict"),path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"performance.html"),"utf8");
const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(script);
const code=script.match(/const processorCode=`([\s\S]*?)`;/)[1];
const initial=new Function("return "+script.match(/const initial=(\{[^\n]+\});/)[1])();
for(const sr of [44100,48000]){
 let Synth;
 new Function("AudioWorkletProcessor","registerProcessor","sampleRate",code)(class{constructor(){this.port={};}},(_,c)=>Synth=c,sr);
 const p=new Synth();
 const msg=data=>p.port.onmessage({data});
 msg({type:"patch",patch:initial});
 for(let i=0;i<8;i++)msg({type:"on",id:i,note:48+i*4,vel:.8});
 let peak=0,energy=0;
 const render=n=>{for(let j=0;j<n;j++){const out=[new Float32Array(128),new Float32Array(128)];assert.equal(p.process([], [out]),true);for(const c of out)for(const x of c){assert(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));energy+=x*x;}}};
 render(100);assert.equal(p.voices.length,8);assert(energy>0);
 msg({type:"on",id:99,note:70,vel:1});assert.equal(p.voices.length,8);
 msg({type:"patch",patch:{...initial,engineA:"phase",charA:1,interaction:1,resonance:1,crush:1,hold:1,drive:1,routes:[{src:"lfo2",dest:"cutoff",depth:1}]}});
 render(100);assert(peak<=1);
 msg({type:"panic"});render(1);assert.equal(p.voices.length,0);
 console.log(sr+" Hz: finite bounded polyphonic output; voice limit and panic passed; peak="+peak.toFixed(4));
}
