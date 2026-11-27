/* Phrase Ecology: independent event model and deterministic musical transformations.
 * Times in beats, note gates in beats. No vendor code.
 */
(function(root){
"use strict";
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const mod=(x,n)=>((x%n)+n)%n;
const hash=(n)=>{n|=0;n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return ((n^(n>>>16))>>>0)/4294967296;};
const defaults={quantize:0,density:0,rotate:0,swing:0,variation:0,harmony:0,gate:1};
function validate(phrase){
 if(!phrase||!Number.isFinite(phrase.length)||phrase.length<.25||phrase.length>128||!Array.isArray(phrase.notes)||phrase.notes.length>512)throw Error("invalid phrase");
 const L=phrase.length;return {length:L,notes:phrase.notes.map((n,i)=>{if(!n||![n.start,n.duration,n.pitch,n.velocity].every(Number.isFinite))throw Error("invalid note");return {id:i,start:mod(n.start,L),duration:clamp(n.duration,.01,L),pitch:clamp(Math.round(n.pitch),0,127),velocity:clamp(n.velocity,.01,1)};}).sort((a,b)=>a.start-b.start||a.id-b.id)};
}
class Capture {
 constructor(){this.reset();}
 reset(){this.origin=null;this.notes=[];this.held=new Map();this.armed=false;}
 arm(){this.reset();this.armed=true;}
 on(id,pitch,velocity,beat){if(!this.armed)return;if(this.origin===null)this.origin=beat;if(this.held.has(id))this.off(id,beat);if(this.notes.length+this.held.size>=512)return;this.held.set(id,{start:Math.max(0,beat-this.origin),pitch,velocity});}
 off(id,beat){if(!this.armed||!this.held.has(id))return;const n=this.held.get(id);this.held.delete(id);this.notes.push({...n,duration:Math.max(.02,beat-this.origin-n.start)});}
 finish(beat,bar=4){if(!this.armed)return null;this.armed=false;if(this.origin===null)return null;this.armed=true;for(const id of [...this.held.keys()])this.off(id,beat);this.armed=false;const elapsed=Math.max(.25,beat-this.origin);const latest=Math.max(...this.notes.map(n=>n.start+n.duration),0);const length=clamp(Math.ceil((Math.max(elapsed,latest)-1e-7)/bar)*bar,bar,128);return validate({length,notes:this.notes});}
}
function transform(phrase,settings={},cycle=0,seed=1337){
 const p={...defaults,...settings},L=phrase.length,q=clamp(p.quantize,0,1),density=clamp(p.density,-1,1),variation=clamp(p.variation,0,1),grid=.25;
 const notes=[];const seen=new Set();const pitches=[...new Set(phrase.notes.map(n=>n.pitch))].sort((a,b)=>a-b);
 // A stable seed yields a recognizable phrase; variation gradually allows a cycle-specific seed.
 const rng=(id,salt)=>hash(seed+id*7919+salt*131+(hash(seed+id*73+salt)<variation?cycle*19937:0));
 function add(n,offset=0,pitch=n.pitch,vel=n.velocity,gate=n.duration){
  let t=n.start+(Math.round(n.start/grid)*grid-n.start)*q+offset+p.rotate*L;
  const g=Math.round(t/grid);if(g%2!==0)t+=clamp(p.swing,-.45,.45)*grid*q;
  t=mod(t,L);const key=Math.round(t*10000)+":"+pitch;if(seen.has(key)||notes.length>=1024)return;seen.add(key);
  notes.push({start:t,duration:clamp(gate*clamp(p.gate,.1,2),.01,L),pitch:clamp(pitch,0,127),velocity:clamp(vel,.01,1)});
 }
 for(const n of phrase.notes){
  // Preserve the earliest onset group as an anchor, even at sparse settings.
  if(density<0&&n.start>phrase.notes[0].start+1e-6&&rng(n.id,1)<-density*.86)continue;
  let pitch=n.pitch;
  // Variation is timing/dynamics of added material, not random changes to source pitches.
  add(n,0,pitch,n.velocity,n.duration);
  if(density>0&&rng(n.id,2)<density*.9){const delay=n.duration>.35?.25:.125;add(n,delay,pitch,n.velocity*(.48+.22*rng(n.id,3)),Math.min(n.duration,.18));}
  if(p.harmony>0&&pitches.length>1&&rng(n.id,4)<p.harmony){const idx=pitches.indexOf(pitch),other=pitches[(idx+1)%pitches.length];if(other!==pitch)add(n,0,other,n.velocity*.57,n.duration*.85);}
 }
 return notes.sort((a,b)=>a.start-b.start||a.pitch-b.pitch);
}
// Schedules a complete cycle once. Notes can cross the loop boundary.
// Returning event times in absolute beats avoids hanging notes when settings change.
function cycleEvents(phrase,settings,cycle,origin,seed){
 const notes=transform(phrase,settings,cycle,seed),base=origin+cycle*phrase.length,out=[];
 for(let i=0;i<notes.length;i++){const n=notes[i],id="seq:"+cycle+":"+i;out.push({beat:base+n.start,type:"on",id,pitch:n.pitch,velocity:n.velocity},{beat:base+n.start+n.duration,type:"off",id});}
 return out.sort((a,b)=>a.beat-b.beat||(a.type==="off"?-1:1));
}
const api={Capture,validate,transform,cycleEvents,defaults};if(typeof module==="object"&&module.exports)module.exports=api;else root.CobalitePhrase=api;
})(globalThis);
