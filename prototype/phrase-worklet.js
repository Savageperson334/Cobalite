/* Audio-clocked phrase transport and independent audition synth. */
const {Capture,validate,cycleEvents,defaults}=globalThis.CobalitePhrase;
class PhraseLab extends AudioWorkletProcessor{
 constructor(){super();this.beat=0;this.tempo=110;this.cap=new Capture();this.phrase=null;this.previous=null;this.playing=false;this.origin=0;this.nextCycle=0;this.queue=[];this.settings={...defaults};this.voices=[];this.tick=0;this.source="soft";this.rack=new globalThis.CobaliteFX.Rack(sampleRate);this.rack.configure(0,"decay",.35,.55,.3,.3);this.rack.setWet(0);this.port.onmessage=({data:d})=>this.receive(d);}
 emit(){this.port.postMessage({type:"state",armed:this.cap.armed,started:this.cap.origin!==null,playing:this.playing,phrase:this.phrase,canUndo:!!this.previous});}
 stop(){this.playing=false;this.queue.length=0;for(const v of this.voices)if(v.seq)v.off=true;}
 play(){if(!this.phrase||!this.phrase.notes.length)return;this.stop();this.origin=this.beat;this.nextCycle=0;this.playing=true;}
 setPhrase(p){this.previous=this.phrase;this.phrase=validate(p);}
 receive(d){
  if(d.type==="tempo"&&Number.isFinite(d.bpm))this.tempo=Math.max(35,Math.min(240,d.bpm));
  if(d.type==="settings")this.settings={...defaults,...d.settings};
  if(d.type==="sound")this.source=d.source;
  if(d.type==="fx")this.rack.setWet(d.enabled?1:0);
  if(d.type==="capture"){
   if(this.cap.armed){const phrase=this.cap.finish(this.beat);if(phrase&&phrase.notes.length){this.setPhrase(phrase);this.settings={...defaults};this.play();}this.emit();}
   else{this.stop();this.cap.arm();this.emit();}
  }
  if(d.type==="cancel"){this.cap.reset();this.emit();}
  if(d.type==="play"){if(!this.cap.armed){if(this.playing)this.stop();else this.play();}this.emit();}
  if(d.type==="stop"){this.stop();this.cap.reset();this.emit();}
  if(d.type==="load"){try{this.stop();this.cap.reset();this.setPhrase(d.phrase);this.settings={...defaults};this.emit();}catch(e){this.port.postMessage({type:"error",message:e.message});}}
  if(d.type==="undoCapture"&&this.previous){this.stop();const a=this.phrase;this.phrase=this.previous;this.previous=a;this.cap.reset();this.emit();}
  if(d.type==="on"){const id="live:"+d.id;this.cap.on(id,d.pitch,d.velocity,this.beat);this.on(id,d.pitch,d.velocity,false);}
  if(d.type==="off"){const id="live:"+d.id;this.cap.off(id,this.beat);this.off(id);}
  if(d.type==="panic"){this.stop();this.cap.reset();this.voices.length=0;this.rack.clear();this.emit();}
 }
 on(id,pitch,vel,seq){for(const v of this.voices)if(v.id===id){v.off=true;v.id=null;}if(this.voices.length>=16){let i=this.voices.findIndex(v=>v.off);this.voices.splice(i<0?0:i,1);}this.voices.push({id,seq,inc:440*Math.pow(2,(pitch-69)/12)/sampleRate,phase:0,env:0,vel,off:false,age:0,pan:((pitch%5)-2)*.16});}
 off(id){for(const v of this.voices)if(v.id===id)v.off=true;}
 process(inputs,outputs){
  const out=outputs[0],n=out[0].length,step=this.tempo/60/sampleRate,atk=1-Math.exp(-1/(sampleRate*.007)),rel=1-Math.exp(-1/(sampleRate*.075));
  for(let i=0;i<n;i++){
   if(this.cap.armed&&this.cap.origin!==null&&this.beat-this.cap.origin>=128){const phrase=this.cap.finish(this.beat);if(phrase&&phrase.notes.length){this.setPhrase(phrase);this.settings={...defaults};this.play();}this.emit();}
   if(this.playing&&this.phrase){
    if(this.beat+1e-9>=this.origin+this.nextCycle*this.phrase.length){this.queue.push(...cycleEvents(this.phrase,this.settings,this.nextCycle,this.origin,1337));this.queue.sort((a,b)=>a.beat-b.beat||(a.type==="off"?-1:1));this.nextCycle++;}
    while(this.queue.length&&this.queue[0].beat<=this.beat+1e-9){const e=this.queue.shift();if(e.type==="on")this.on(e.id,e.pitch,e.velocity,true);else this.off(e.id);}
   }
   let l=0,r=0;for(const v of this.voices){v.phase=(v.phase+v.inc)%1;v.age+=1/sampleRate;v.env+=((v.off?0:1)-v.env)*(v.off?rel:atk);const t=v.phase*6.283185307,s=this.source==="bright"?.68*Math.sin(t)+.22*Math.sin(t*2)+.1*Math.sin(t*3):this.source==="pluck"?(.72*Math.sin(t)+.28*Math.sin(t*3))*Math.exp(-v.age*3.5):.85*Math.sin(t)+.15*Math.sin(t*2);const x=s*v.env*v.vel*.075;l+=x*(1-v.pan);r+=x*(1+v.pan);}
   this.rack.process(l,r);out[0][i]=Math.tanh(this.rack.outL);if(out[1])out[1][i]=Math.tanh(this.rack.outR);this.beat+=step;
  }
  for(let i=this.voices.length-1;i>=0;i--)if(this.voices[i].off&&this.voices[i].env<.0001)this.voices.splice(i,1);
  if(++this.tick>=16){this.tick=0;this.port.postMessage({type:"position",beat:this.beat,recording:this.cap.armed&&this.cap.origin!==null?this.beat-this.cap.origin:0,phase:this.playing&&this.phrase?((this.beat-this.origin)%this.phrase.length)/this.phrase.length:0,cycle:Math.max(0,this.nextCycle-1),voices:this.voices.length});}
  return true;
 }
}
registerProcessor("phrase-lab",PhraseLab);
