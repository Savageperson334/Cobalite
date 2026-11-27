const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8"),root={};
for(const f of ["phrase-core.js","society-core.js","fx-core.js","instrument-core.js"])new Function("globalThis",read(f))(root);
const I=root.CobaliteInstrument;
new Function(read("instrument.html").match(/<script>([\s\S]*)<\/script>/)[1]);
const base=I.init(),panel=new I.Panel(base);
assert(!I.setRoute(base,"velocity","rate",.3));assert(I.setRoute(base,"tail","rate2",-.65));assert(I.setRoute(base,"lfo2","balance",.4));
panel.startRoam();const before=base.cutoff;panel.turn("cutoff",.1);panel.select("fx0C");panel.endRoam();assert.equal(base.cutoff,before);assert.equal(base.roam.path.length,2);
assert.equal(I.headroom(.5,0),.5);assert(I.headroom(.98,5)<=1);assert(I.headroom(.02,-5)>=0);
for(const sr of [44100,48000]){
 let Synth;const messages=[];new Function("globalThis","AudioWorkletProcessor","registerProcessor","sampleRate",read("instrument-worklet.js"))(root,class{constructor(){this.port={postMessage(d){messages.push(JSON.parse(JSON.stringify(d)));}};}},(_,c)=>Synth=c,sr);
 const x=new Synth(),msg=data=>x.port.onmessage({data}),patch=I.validate(base);
 Object.assign(patch,{fxTypes:["decay","parallax","bypass"],fx0A:.2,fx0B:.7,fx0C:.3,fx0Mix:.6,fxWet:.9,bpm:120});
 msg({type:"patch",patch});let peak=0,tail=0,min=100,max=0;
 function render(n){for(let i=0;i<n;i++){const o=[new Float32Array(128),new Float32Array(128)];x.process([], [o]);for(const ch of o)for(const v of ch){assert(Number.isFinite(v));peak=Math.max(peak,Math.abs(v));}tail=Math.max(tail,x.sensors.tail);min=Math.min(min,x.lfoHz[1]);max=Math.max(max,x.lfoHz[1]);}}
 msg({type:"capture"});msg({type:"on",id:"a",note:60,vel:.8});render(100);msg({type:"off",id:"a"});render(50);msg({type:"capture"});assert(x.playing&&x.patch.phrase.notes.length===1);render(850);assert(x.nextCycle>=2&&tail>0&&min<max&&peak>0);
 msg({type:"roam",running:true,restart:true});render(20);assert(x.roamOffsets.cutoff!==0);
 const saved=I.validate(JSON.parse(JSON.stringify(x.patch)));msg({type:"panic"});msg({type:"patch",patch:saved,announce:true});assert.equal(x.patch.phrase.notes.length,1);assert.equal(messages.at(-1).reason,"patch");
 msg({type:"chordCapture"});for(const n of [60,64,67]){msg({type:"on",id:n,note:n,vel:.8});msg({type:"off",id:n});}msg({type:"chordCapture"});assert.deepEqual(x.patch.chord,[0,4,7]);assert.equal(messages.at(-1).reason,"chordFinished");
 saved.chordMode="chord";msg({type:"patch",patch:saved});msg({type:"on",id:"root",note:62});render(40);assert.equal(x.pool.slots.filter(s=>s.state==="active").length,3);msg({type:"off",id:"root"});msg({type:"panic"});render(1);assert(x.pool.slots.every(v=>v.state==="free"));
 console.log(sr+" Hz: unified capture, phrase playback, FX tail -> LFO, Roam, chord and recall passed; peak="+peak.toFixed(3)+"; LFO2="+min.toFixed(4)+"–"+max.toFixed(4)+" Hz");
}