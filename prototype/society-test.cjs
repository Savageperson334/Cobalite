const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {VoicePool,ChordMemory,modes,arpIndex}=require("./society-core.js");
const p=new VoicePool();
for(const mode of Object.keys(modes)){p.setMode(mode);p.on("a",60,.8);assert.equal(p.slots.filter(s=>s.state==="active").length,modes[mode].count);p.off("a");assert(p.slots.every(s=>s.state!=="active"));p.panic();}
p.setMode("mono");p.on("a",60);p.on("b",64);p.off("b");assert(p.slots.some(s=>s.group==="a"&&s.state==="active"));p.panic();
p.setMode("unison4");p.on("a",60);p.on("b",64);p.on("c",67);assert.equal(p.slots.filter(s=>s.state==="active").length,8);assert(!p.slots.some(s=>s.group==="a"&&s.state==="active"));
const c=new ChordMemory();c.begin();[64,60,71,67].forEach(x=>c.touch(x));assert(c.end());assert.deepEqual(c.notes,[0,4,7,11]);assert.deepEqual(c.voicing(62),[62,66,69,73]);
for(let i=-3;i<=3;i++)for(let s=0;s<=2;s++)assert(c.voicing(60,i,s).every(n=>c.notes.some(x=>((n-60-x)%12+12)%12===0)));
assert([0,1,2,3,2,1,0].every((n,i)=>arpIndex(i,4,"pendulum")===n));
const work=fs.readFileSync(path.join(__dirname,"society-worklet.js"),"utf8");
for(const sr of [44100,48000]){
 let Synth;new Function("globalThis","AudioWorkletProcessor","registerProcessor","sampleRate",work)({CobaliteSociety:require("./society-core.js")},class{constructor(){this.port={postMessage(){}};}},(_,c)=>Synth=c,sr);
 const s=new Synth(),msg=d=>s.port.onmessage({data:d});let peak=0;
 function run(n){for(let i=0;i<n;i++){let o=[new Float32Array(128),new Float32Array(128)];s.process([], [o]);for(const ch of o)for(const x of ch){assert(Number.isFinite(x)&&Math.abs(x)<=1);peak=Math.max(peak,Math.abs(x));}}}
 msg({type:"mode",mode:"unison8"});msg({type:"on",id:"a",pitch:60,velocity:.8});run(100);assert(s.pool.slots.every(x=>x.state==="active"));msg({type:"off",id:"a"});run(500);assert(s.pool.slots.every(x=>x.state==="free"));
 msg({type:"mode",mode:"poly"});msg({type:"settings",settings:{chordMode:"chord"}});msg({type:"on",id:"b",pitch:60,velocity:.8});run(40);assert.equal(s.pool.slots.filter(x=>x.state==="active").length,3);msg({type:"off",id:"b"});
 msg({type:"settings",settings:{chordMode:"arp",bpm:120,division:.25}});msg({type:"on",id:"c",pitch:62,velocity:.8});run(250);assert(s.arpStep>=3);msg({type:"off",id:"c"});assert.equal(s.arpIds.length,0);
 const old=s.slots[0].history;msg({type:"panic"});run(100);assert(s.pool.slots.every(x=>x.state==="free"));assert(s.slots[0].history<=old);assert(peak>0);
 console.log(sr+" Hz: allocation, mono fallback, chord/arp, pitch classes, voice release and panic passed; peak="+peak.toFixed(3));
}
