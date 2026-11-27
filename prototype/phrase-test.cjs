const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const P=require("./phrase-core.js"),FX=require("./fx-core.js");
const cap=new P.Capture();cap.arm();cap.on("a",60,.8,10);cap.on("b",64,.6,10);cap.off("a",11.5);cap.off("b",11.75);cap.on("c",67,.7,13.25);
const phrase=cap.finish(13.8);
assert.equal(phrase.length,4);assert.equal(phrase.notes.length,3);assert.equal(phrase.notes[0].start,0);
assert.deepEqual(P.transform(phrase),phrase.notes.map(({id,...n})=>n));
const original=JSON.stringify(phrase),settings={density:1,harmony:1,rotate:.3,variation:.8};
const a=P.transform(phrase,settings,2),b=P.transform(phrase,settings,2);
assert.deepEqual(a,b);assert.equal(JSON.stringify(phrase),original);
assert(a.every(n=>n.start>=0&&n.start<phrase.length&&phrase.notes.some(p=>p.pitch===n.pitch)));
assert.equal(P.cycleEvents(phrase,{},0,0,1337).length,6);
const empty=new P.Capture();empty.arm();assert.equal(empty.finish(100),null);
const crossing=P.validate({length:4,notes:[{start:3.8,duration:1,pitch:60,velocity:.8}]});
assert(P.cycleEvents(crossing,{},0,0,1337)[1].beat>4);
const code=fs.readFileSync(path.join(__dirname,"phrase-worklet.js"),"utf8");
for(const sr of [44100,48000]){
 let Synth;new Function("globalThis","AudioWorkletProcessor","registerProcessor","sampleRate",code)({CobalitePhrase:P,CobaliteFX:FX},class{constructor(){this.port={postMessage(){}};}},(_,c)=>Synth=c,sr);
 const s=new Synth(),msg=data=>s.port.onmessage({data});
 let peak=0;function render(blocks){for(let i=0;i<blocks;i++){const out=[new Float32Array(128),new Float32Array(128)];s.process([], [out]);for(const c of out)for(const x of c){assert(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));}}}
 msg({type:"tempo",bpm:120});msg({type:"capture"});msg({type:"on",id:"a",pitch:60,velocity:.8});render(100);msg({type:"off",id:"a"});render(40);msg({type:"capture"});assert(s.playing&&s.phrase.notes.length===1);render(800);assert(s.nextCycle>=2&&peak>0);
 msg({type:"stop"});assert(!s.playing&&s.queue.length===0&&s.voices.every(v=>!v.seq||v.off));msg({type:"panic"});assert.equal(s.voices.length,0);
 console.log(sr+" Hz: capture, original identity, deterministic variation, boundary note-off, sample-clocked playback and stop passed; peak="+peak.toFixed(3));
}
