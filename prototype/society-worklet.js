/* Eight-voice audition renderer; persistent slot identity survives note release. */
const {VoicePool,ChordMemory,arpIndex}=globalThis.CobaliteSociety;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smoothKeys=["individuality","cohesion","history","tone","attack","release","detune","width","glide"];
class SocietyLab extends AudioWorkletProcessor{
 constructor(){super();this.pool=new VoicePool(e=>this.event(e));this.chord=new ChordMemory();this.slots=this.pool.slots.map(s=>({trait:s.trait,phase:s.trait.motion,phaseB:s.trait.motion,env:0,lastL:0,lastR:0,fadeL:0,fadeR:0,fade:0,history:0,active:false,off:false,age:0,pitch:60,velocity:0,gain:1,spread:0,role:0,filter:0,f:0}));this.held=new Map();this.groups=new Map();this.arpHeld=new Map();this.arpIds=[];this.arpStep=0;this.arpClock=0;this.arpGate=0;this.time=0;this.tick=0;this.p={individuality:.45,cohesion:.6,history:.15,tone:.36,attack:.08,release:.3,detune:.25,width:.65,chordMode:"off",inversion:0,spread:0,arpOrder:"up",bpm:110,division:.5,gate:.65,glide:0};this.target={...this.p};this.prevPitch=null;this.port.onmessage=({data:d})=>this.receive(d);}
 event(e){const v=this.slots[e.slot];if(e.type==="release"){v.off=true;return;}if(e.type==="clear"){v.active=false;v.env=0;v.fade=0;v.lastL=v.lastR=0;return;}if(e.type==="start"){v.fadeL=v.lastL;v.fadeR=v.lastR;v.fade=e.stolen?1:0;v.env=0;v.off=false;v.active=true;v.age=e.age;v.pitch=e.pitch;v.velocity=e.velocity;v.gain=e.gain;v.spread=e.spread;v.role=e.role;v.filter=0;v.f=440*Math.pow(2,(e.pitch-69)/12);v.fCurrent=this.pool.mode==="mono"&&this.prevPitch!==null&&this.target.glide>0?440*Math.pow(2,(this.prevPitch-69)/12):v.f;v.phase=v.trait.motion;v.phaseB=v.trait.motion+.13;v.history=clamp(v.history+.16,0,1);this.prevPitch=e.pitch;}}
 state(){this.port.postMessage({type:"state",mode:this.pool.mode,intervals:this.chord.notes,capturing:this.chord.capturing,captured:[...this.chord.recorded]});}
 releaseRoot(id){const ids=this.groups.get(id)||[];for(const key of ids)this.pool.off(key);this.groups.delete(id);this.arpHeld.delete(id);if(!this.arpHeld.size){for(const key of this.arpIds)this.pool.off(key);this.arpIds.length=0;this.arpGate=0;}}
 clearGenerated(){for(const key of this.arpIds)this.pool.off(key);this.arpIds.length=0;this.arpHeld.clear();for(const id of this.groups.keys())this.releaseRoot(id);}
 panic(){this.pool.panic();this.groups.clear();this.arpHeld.clear();this.arpIds.length=0;this.held.clear();this.prevPitch=null;}
 playRoot(id,pitch,velocity){
  const p=this.target;if(p.chordMode==="off"||this.chord.capturing){this.pool.on("note:"+id,pitch,velocity);this.groups.set(id,["note:"+id]);return;}
  const notes=this.chord.voicing(pitch,p.inversion,p.spread);
  if(p.chordMode==="arp"){if(!this.arpHeld.size){this.arpClock=0;this.arpStep=0;this.arpGate=0;}this.arpHeld.set(id,{notes,velocity});return;}
  const ids=[];for(let i=0;i<notes.length;i++){const key="chord:"+id+":"+i;ids.push(key);this.pool.on(key,notes[i],velocity);}this.groups.set(id,ids);
 }
 receive(d){
  if(d.type==="settings"){const next={...this.target};for(const k of Object.keys(next))if(typeof next[k]==="number"&&Number.isFinite(d.settings[k]))next[k]=d.settings[k];for(const k of ["chordMode","arpOrder"])if(typeof d.settings[k]==="string")next[k]=d.settings[k];if(next.chordMode!==this.target.chordMode){this.clearGenerated();this.held.clear();}this.target=next;}
  if(d.type==="mode"){this.panic();this.pool.setMode(d.mode);this.state();}
  if(d.type==="capture"){if(this.chord.capturing)this.chord.end();else{this.clearGenerated();this.chord.begin();}this.state();}
  if(d.type==="cancel"){this.chord.cancel();this.state();}
  if(d.type==="on"){this.releaseRoot(d.id);this.held.set(d.id,{pitch:d.pitch,velocity:d.velocity});if(this.chord.capturing){this.chord.touch(d.pitch);this.state();}this.playRoot(d.id,d.pitch,d.velocity);}
  if(d.type==="off"){this.held.delete(d.id);this.releaseRoot(d.id);}
  if(d.type==="panic"){this.panic();this.chord.cancel();this.state();}
 }
 process(inputs,outputs){const out=outputs[0],n=out[0].length,p=this.p,t=this.target,dt=1/sampleRate,smooth=1-Math.exp(-dt/.035);p.chordMode=t.chordMode;p.arpOrder=t.arpOrder;let peak=0;
  for(let i=0;i<n;i++){
   for(const k of smoothKeys)p[k]+=(t[k]-p[k])*smooth;
   if(p.chordMode==="arp"&&this.arpHeld.size){
    if(this.arpGate>0&&(this.arpGate-=dt)<=0){for(const id of this.arpIds)this.pool.off(id);this.arpIds.length=0;}
    this.arpClock-=dt;if(this.arpClock<=0){const dur=60/clamp(t.bpm,35,240)*clamp(t.division,.125,2);this.arpClock+=dur;for(const id of this.arpIds)this.pool.off(id);this.arpIds.length=0;const held=[...this.arpHeld.values()].at(-1);if(held&&held.notes.length){const idx=arpIndex(this.arpStep++,held.notes.length,t.arpOrder),id="arp:"+this.arpStep;this.pool.on(id,held.notes[idx],held.velocity,"arp");this.arpIds.push(id);this.arpGate=dur*clamp(t.gate,.05,.98);} }
   }
   let l=0,r=0;this.time+=dt;const common=Math.sin(this.time*.53);
   for(let j=0;j<8;j++){const v=this.slots[j];v.history*=Math.exp(-dt/25);if(!v.active&&v.fade<.0001)continue;
    if(v.active){const q=v.trait,local=Math.sin(this.time*(.43+q.motion*.18)+q.motion*6.283185307),motion=common*p.cohesion+local*(1-p.cohesion),colour=clamp(p.tone+p.individuality*(q.colour*.19+motion*.10)+v.role*.13+p.history*v.history*.17,0,1);const cents=p.detune*v.spread*22+p.individuality*q.detune*3;
     v.fCurrent+=(v.f-v.fCurrent)*(1-Math.exp(-dt/(.004+p.glide*p.glide*.5)));const inc=clamp(v.fCurrent*Math.pow(2,cents/1200)*dt,0,.43);v.phase=(v.phase+inc)%1;v.phaseB=(v.phaseB+inc*(1+.0015*p.individuality))%1;
     const angle=v.phase*6.283185307,b=v.phaseB*6.283185307;let sig=Math.sin(angle)*.8+Math.sin(b*2)*colour*.20+Math.sin(angle*3)*colour*.14+Math.sin(angle*4)*colour*.055;
     const cut=clamp(.025+colour*.5,.01,.65);v.filter+=(sig-v.filter)*cut;const a=.005+p.attack*p.attack*.8*(1+p.individuality*q.attack*.3),rel=.025+p.release*p.release*1.5;v.env+=((v.off?0:1)-v.env)*(1-Math.exp(-5.3*dt/(v.off?rel:a)));
     const x=v.filter*v.env*v.velocity*v.gain*.12,pan=clamp((q.pan*.45*p.individuality+v.spread*.48)*p.width,-.95,.95);v.lastL=x*Math.sqrt(1-pan);v.lastR=x*Math.sqrt(1+pan);l+=v.lastL;r+=v.lastR;
    }
    if(v.fade>.0001){l+=v.fadeL*v.fade;r+=v.fadeR*v.fade;v.fade*=Math.exp(-dt/.002);}
   }
   peak=Math.max(peak,Math.abs(l),Math.abs(r));out[0][i]=Math.tanh(l);if(out[1])out[1][i]=Math.tanh(r);
  }
  for(let j=0;j<8;j++){const v=this.slots[j];if(v.active&&v.off&&v.env<.0001){v.active=false;v.lastL=v.lastR=0;this.pool.finish(j,v.age);}}
  if(++this.tick>=16){this.tick=0;this.port.postMessage({type:"voices",peak,slots:this.slots.map((v,i)=>({index:i,pitch:v.pitch,level:v.env,state:this.pool.slots[i].state,history:v.history,colour:v.trait.colour}))});}return true;
 }
}
registerProcessor("society-lab",SocietyLab);
