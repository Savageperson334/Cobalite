/* Voice Society and Chord Memory — independent, bounded event model.
 * No vendor code. Eight persistent voice identities; renderer owns envelopes.
 */
(function(root){
"use strict";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const modes={poly:{name:"Poly",count:1},mono:{name:"Mono",count:1,mono:true},unison2:{name:"Unison 2",count:2},unison4:{name:"Unison 4",count:4},unison8:{name:"Unison 8",count:8},stack2:{name:"Stack 2",count:2,intervals:[0,12]},stack4:{name:"Stack 4",count:4,intervals:[0,7,12,19]},complement:{name:"Complement",count:2}};
function traits(i){const phase=i*Math.PI*(3-Math.sqrt(5));return {pan:Math.sin(phase),colour:Math.cos(phase),motion:((i*5)%8)/8,attack:Math.sin(phase+1.4),detune:Math.sin(phase+2.1),identity:i};}
class VoicePool{
 constructor(emit=()=>{}){this.emit=emit;this.slots=Array.from({length:8},(_,i)=>({index:i,trait:traits(i),state:"free",group:null,age:0}));this.held=new Map();this.mode="poly";this.counter=0;this.cursor=0;}
 setMode(mode){if(!Object.hasOwn(modes,mode))throw Error("invalid mode");if(mode!==this.mode){this.panic();this.mode=mode;}}
 releaseSlot(s){if(s.state==="active"){s.state="release";this.emit({type:"release",slot:s.index});}}
 releaseGroup(id){for(const s of this.slots)if(s.group===id)this.releaseSlot(s);}
 finish(index,age){const s=this.slots[index];if(s&&s.state==="release"&&s.age===age){s.state="free";s.group=null;}}
 panic(){this.held.clear();for(const s of this.slots){s.state="free";s.group=null;this.emit({type:"clear",slot:s.index});}}
 allocate(id,pitch,velocity,tag){
  const mode=modes[this.mode],count=mode.count,ordered=this.slots.slice().sort((a,b)=>{
   const rank=s=>s.state==="free"?0:s.state==="release"?1:2;
   return rank(a)-rank(b)||(rank(a)===0?((a.index-this.cursor+8)%8)-((b.index-this.cursor+8)%8):a.age-b.age);
  });
  // If an active group loses any voice, release its remaining voices together.
  const chosen=ordered.slice(0,count),victims=new Set(chosen.filter(s=>s.state==="active").map(s=>s.group));
  for(const group of victims)this.releaseGroup(group);
  for(let j=0;j<count;j++){const s=chosen[j],was=s.state!=="free";s.state="active";s.group=id;s.age=++this.counter;this.cursor=(s.index+1)%8;
   const offset=mode.intervals?mode.intervals[j]:0,spread=mode.intervals?0:count===1?0:(j/(count-1)*2-1);
   this.emit({type:"start",slot:s.index,age:s.age,id,pitch:clamp(pitch+offset,0,127),velocity,spread,role:this.mode==="complement"?(j===0?-1:1):0,tag,stolen:was,gain:1/Math.sqrt(count)});
  }
 }
 on(id,pitch,velocity=.8,tag="live"){
  if(!Number.isFinite(pitch)||!Number.isFinite(velocity))return;
  pitch=clamp(Math.round(pitch),0,127);velocity=clamp(velocity,.01,1);
  if(this.held.has(id)){this.held.delete(id);this.releaseGroup(id);}
  this.held.set(id,{pitch,velocity,tag});
  if(modes[this.mode].mono){for(const s of this.slots)this.releaseSlot(s);}
  this.allocate(id,pitch,velocity,tag);
 }
 off(id){
  const wasHeld=this.held.delete(id),wasActive=this.slots.some(s=>s.group===id&&s.state==="active");
  this.releaseGroup(id);
  if(wasHeld&&wasActive&&modes[this.mode].mono&&this.held.size){const [next,n]=Array.from(this.held.entries()).at(-1);this.allocate(next,n.pitch,n.velocity,n.tag);}
 }
}
class ChordMemory{
 constructor(){this.notes=[0,4,7];this.recorded=new Set();this.capturing=false;}
 begin(){this.capturing=true;this.recorded.clear();}
 touch(pitch){if(this.capturing&&Number.isFinite(pitch))this.recorded.add(clamp(Math.round(pitch),0,127));}
 end(){this.capturing=false;const a=[...this.recorded].sort((a,b)=>a-b);if(a.length){this.notes=a.slice(0,8).map(p=>p-a[0]);return true;}return false;}
 cancel(){this.capturing=false;this.recorded.clear();}
 voicing(root,inversion=0,spread=0){
  if(!Number.isFinite(root))return [];
  let a=this.notes.slice();if(!a.length)return [];
  let n=clamp(Math.round(inversion),-7,7);
  // Invert by lifting/lowering a single voice until it lies beyond the rest.
  while(n>0){let p=a.shift();while(a.length&&p<=a.at(-1))p+=12;if(!a.length)p+=12;a.push(p);n--;}
  while(n<0){let p=a.pop();while(a.length&&p>=a[0])p-=12;if(!a.length)p-=12;a.unshift(p);n++;}
  const width=clamp(Math.round(spread),0,2);
  if(width>=1&&a.length>2){const i=a.length-2;a[i]-=12;a.sort((x,y)=>x-y);}
  if(width>=2&&a.length>1){a[0]-=12;a[a.length-1]+=12;}
  // Omit unplayable notes rather than clamp them into duplicate pitches.
  return [...new Set(a.map(p=>p+Math.round(root)).filter(p=>p>=0&&p<=127))].sort((x,y)=>x-y);
 }
}
function arpIndex(step,length,order){
 if(length<=1)return 0;
 const s=Math.max(0,Math.floor(step));
 if(order==="down")return length-1-s%length;
 if(order==="pendulum"){const n=2*length-2,k=s%n;return k<length?k:n-k;}
 if(order==="outside"){const k=s%length;return k%2===0?k/2:length-1-(k-1)/2;}
 return s%length;
}
const api={VoicePool,ChordMemory,modes,traits,arpIndex};if(typeof module==="object"&&module.exports)module.exports=api;else root.CobaliteSociety=api;
})(globalThis);
