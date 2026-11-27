const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8"),root={};
for(const n of ["phrase-core.js","society-core.js","fx-core.js","instrument-core.js","performance-09.js","panel-core.js","panel-adapter-09.js","roam-08.js"])new Function("globalThis",read(n))(root);
const I=root.CobaliteInstrument,E=root.CobalitePerformance09,P=root.CobalitePhrase;
new Function(read("performance-09.html").match(/<script>([\s\S]*)<\/script>/)[1]);
let cap=new P.Capture();cap.arm();cap.on("a",60,.8,0);cap.off("a",3.8);assert.equal(E.finishCapture(cap,4.2).length,4);
cap.arm();cap.on("a",60,.8,0);cap.off("a",4.1);assert.equal(E.finishCapture(cap,4.2).length,8);
cap.arm();cap.on("a",60,.8,0);cap.off("a",1.2);assert.equal(E.finishCapture(cap,1.5,"free").length,1.5);
for(let steps=1;steps<=16;steps++)for(let pulses=0;pulses<=steps;pulses++)assert.equal(Array.from({length:steps},(_,i)=>E.hit(i,steps,pulses,3)).filter(Boolean).length,pulses);
assert(!I.routeAllowed("poly1","fxWet"));assert(!I.routeAllowed("menv","rate"));
let patch=I.init();assert(I.setRoute(patch,"menv","cutoff",.4));assert.equal(I.validate(patch).routes.length,1);
const t=new E.MidiTempo();let bpm=null;for(let i=0;i<40;i++)bpm=t.tick(i*60000/(24*120));assert(Math.abs(bpm-120)<.001);
const events=[],panel=new root.CobalitePanel09.Panel09(d=>events.push(d)),base=panel.patch.cutoff;
panel.gestureRecording=true;panel.turn("cutoff",-.2);assert.equal(panel.patch.cutoff,base);assert.equal(events.at(-1).type,"gestureDelta");
panel.gestureRecording=false;panel.down("sustain");panel.turn("cutoff",.2);panel.up("sustain");assert(panel.patch.routes.some(r=>r.src==="menv"&&r.dest==="cutoff"));
panel.down("sustain");panel.up("sustain");assert.equal(panel.resolve("attack"),"mattack");
for(const sr of [44100,48000]){
 let Synth;new Function("globalThis","AudioWorkletProcessor","registerProcessor","sampleRate",read("performance-worklet-09.js"))(root,class{constructor(){this.port={postMessage(){}};}},(_,c)=>Synth=c,sr);
 const x=new Synth(),msg=data=>x.port.onmessage({data});const p=I.init();p.bpm=120;p.performance.sync=[2,0,0];p.phrase=P.validate({length:1,notes:[{start:0,duration:.25,pitch:60,velocity:.8}]});
 I.setRoute(p,"menv","cutoff",.3);I.setRoute(p,"poly1","balance",.2);I.setRoute(p,"lfo2","roamSpeed1",.3);
 msg({type:"patch",patch:p});msg({type:"play"});let peak=0;
 function run(n){for(let i=0;i<n;i++){const o=[new Float32Array(128),new Float32Array(128)];x.process([], [o]);for(const c of o)for(const v of c){assert(Number.isFinite(v));peak=Math.max(peak,Math.abs(v));}}}
 run(20);assert(Math.abs(x.lfoHz[0]-1)<.00001);msg({type:"overdub"});msg({type:"on",id:"d",note:64,vel:.8});run(40);msg({type:"off",id:"d"});msg({type:"overdub"});assert(x.patch.phrase.notes.length===2&&x.playing);
 msg({type:"undoLayer"});assert(x.patch.phrase.notes.length===1&&x.playing);
 msg({type:"gesture"});msg({type:"gestureDelta",id:"cutoff",delta:-.3});run(50);msg({type:"gestureDelta",id:"balance",delta:.2});msg({type:"gesture"});assert(x.patch.performance.gesture.lanes.length===2&&x.gesture.playing);run(80);assert(x.gestureOffsets.cutoff<0);assert.equal(x.patch.cutoff,p.cutoff);
 msg({type:"clockTempo",bpm:90});run(3);assert(Math.abs(x.lfoHz[0]-.75)<.00001);
 msg({type:"overdub"});msg({type:"play"});assert(!x.overdub.active&&!x.playing);
 msg({type:"panic"});assert(x.pool.slots.every(s=>s.state==="free")&&!x.gesture.playing);
 assert(peak>0);console.log(sr+" Hz: integrated overdub/undo, motion, poly/mod-envelope routes, clock and panic passed; peak "+peak.toFixed(3));
}
console.log("Smart/free closure, all Euclidean pulse counts, MIDI tempo estimator, scope and physical gesture adapter passed.");
