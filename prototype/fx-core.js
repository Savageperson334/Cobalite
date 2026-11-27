/* Cobalite FX research core. Independent original JS; no vendor code.
 * Three serial stereo slots; sample processing is allocation-free.
 * Public API: new Rack(sampleRate), configure(slot,type,a,b,c,mix), setWet,
 * process(l,r), endBlock(), clear(). Read outL/outR and sensors.
 * Control and audio thread integration intentionally separate from Living Circuits.
 */
(function(root){
"use strict";
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const types={
 bypass:{name:"Bypass",labels:["—","—","—"],defaults:[0,0,0]},
 decay:{name:"Decay",labels:["Time","Repeats","Erosion"],defaults:[.42,.55,.28]},
 refraction:{name:"Refraction",labels:["Time","Repeats","Skew"],defaults:[.38,.48,.35]},
 patina:{name:"Patina",labels:["Age","Grain","Instability"],defaults:[.23,.22,.15]},
 parallax:{name:"Parallax",labels:["Rate","Depth","Spread"],defaults:[.32,.35,.65]},
 bloom:{name:"Bloom",labels:["Size","Persistence","Colour"],defaults:[.46,.55,.53]},
};
class Slot {
 constructor(sr){this.sr=sr;this.n=Math.ceil(sr*2.1)+8;this.L=new Float32Array(this.n);this.R=new Float32Array(this.n);this.i=0;this.type="bypass";this.pending="bypass";this.a=0;this.b=0;this.c=0;this.ta=0;this.tb=0;this.tc=0;this.mix=0;this.tm=0;this.phase=0;this.loL=0;this.loR=0;this.holdL=0;this.holdR=0;this.hp=1;this.timeL=.25*sr;this.timeR=.25*sr;this.outL=0;this.outR=0;this.wetL=0;this.wetR=0;this.alpha=1-Math.exp(-1/(sr*.035));this.switchAlpha=1-Math.exp(-1/(sr*.02));}
 configure(type,a,b,c,mix){if(!(type in types))throw Error("unknown effect");this.pending=type;this.ta=clamp(a);this.tb=clamp(b);this.tc=clamp(c);this.tm=clamp(mix);}
 clear(){this.L.fill(0);this.R.fill(0);this.i=0;this.loL=this.loR=this.holdL=this.holdR=0;this.hp=1;this.wetL=this.wetR=this.outL=this.outR=0;}
 read(buf,delay){const t=(this.i-clamp(delay,1,this.n-2)+this.n)%this.n,k=Math.floor(t),f=t-k;return buf[k]+(buf[(k+1)%this.n]-buf[k])*f;}
 process(l,r){
  // Fade down before changing algorithms. Clear old memory only at the switch.
  const changing=this.pending!==this.type;this.mix+=((changing?0:this.tm)-this.mix)*this.switchAlpha;
  if(changing&&this.mix<.0001){this.clear();this.type=this.pending;this.a=this.ta;this.b=this.tb;this.c=this.tc;this.mix=0;this.timeL=this.timeR=.25*this.sr;}
  this.a+=(this.ta-this.a)*this.alpha;this.b+=(this.tb-this.b)*this.alpha;this.c+=(this.tc-this.c)*this.alpha;
  const a=this.a,b=this.b,c=this.c,sr=this.sr;let wl=l,wr=r,writeL=l,writeR=r;
  if(this.type==="decay"||this.type==="refraction"){
   const time=sr*(.025+1.55*a*a),skew=this.type==="refraction"?c:0;
   this.timeL+=(time*(1-.22*skew)-this.timeL)*this.alpha;this.timeR+=(time*(1+.29*skew)-this.timeR)*this.alpha;
   wl=this.read(this.L,this.timeL);wr=this.read(this.R,this.timeR);
   const colour=this.type==="decay"?c:.25,coef=.04+.72*(1-colour);
   this.loL+=(wl-this.loL)*coef;this.loR+=(wr-this.loR)*coef;
   const g=.92*b,levels=Math.pow(2,15-11*colour);
   // Erosion occurs on the recirculating copy, not on the original note.
   const dl=this.loL+(Math.round(this.loL*levels)/levels-this.loL)*colour,dr=this.loR+(Math.round(this.loR*levels)/levels-this.loR)*colour;
   // A silence floor prevents quantization feedback from hanging on a nonzero code.
   const fl=Math.abs(dl)<2/levels?this.loL:dl,fr=Math.abs(dr)<2/levels?this.loR:dr;
   writeL=l+g*Math.tanh(fl*(1-skew)+fr*skew);writeR=r+g*Math.tanh(fr*(1-skew)+fl*skew);
  }else if(this.type==="patina"){
   this.phase=(this.phase+(.3+2*c)/sr)%1;
   const ratio=1/(1+45*b*b),levels=Math.pow(2,15-12*b);
   this.hp+=ratio*(1+.16*c*Math.sin(6.283185307*this.phase));
   if(this.hp>=1||b<.001){this.hp%=1;this.holdL=Math.round(l*levels)/levels;this.holdR=Math.round(r*levels)/levels;}
   const k=.025+.94*(1-a)*(1-a);this.loL+=(this.holdL-this.loL)*k;this.loR+=(this.holdR-this.loR)*k;
   wl=Math.tanh(this.loL*(1+2*a))/(1+2*a*.35);wr=Math.tanh(this.loR*(1+2*a))/(1+2*a*.35);
   const texture=Math.max(a,b,c);wl=l+(wl-l)*texture;wr=r+(wr-r)*texture;
  }else if(this.type==="parallax"){
   this.phase=(this.phase+(.045+3.3*a*a)/sr)%1;
   const t=6.283185307*this.phase,base=.012*sr,d=.010*sr*b;
   wl=.7*this.read(this.L,base+d*Math.sin(t))+.3*this.read(this.R,base*1.35+d*Math.sin(t+2.1));
   wr=.7*this.read(this.R,base+d*Math.sin(t+c*Math.PI))+.3*this.read(this.L,base*1.35+d*Math.sin(t+2.1+c*Math.PI));
   wl=l+(wl-l)*b;wr=r+(wr-r)*b;
  }else if(this.type==="bloom"){
   // Compact four-tap stereo diffusion-like echo network, not a full reverb.
   const size=.025+.15*a*a;this.timeL+=(size*sr-this.timeL)*this.alpha;this.timeR+=(size*1.17*sr-this.timeR)*this.alpha;
   const x=this.read(this.L,this.timeL),y=this.read(this.R,this.timeR),u=this.read(this.L,this.timeL*.63),v=this.read(this.R,this.timeR*.71);
   wl=.52*x+.28*v+.20*u;wr=.52*y+.28*u+.20*v;
   const k=.045+.8*c;this.loL+=(wl-this.loL)*k;this.loR+=(wr-this.loR)*k;
   const g=.88*b;writeL=l+g*Math.tanh(.66*this.loL+.34*this.loR);writeR=r+g*Math.tanh(.66*this.loR-.34*this.loL);
  }
  if(this.type!=="bypass"){this.L[this.i]=writeL;this.R[this.i]=writeR;this.i=(this.i+1)%this.n;}
  this.wetL=wl;this.wetR=wr;const m=this.type==="bypass"?0:this.mix;
  this.outL=l+(wl-l)*m;this.outR=r+(wr-r)*m;
 }
}
class Rack{
 constructor(sr){if(!Number.isFinite(sr)||sr<8000||sr>192000)throw Error("unsupported sample rate");this.sr=sr;this.slots=[new Slot(sr),new Slot(sr),new Slot(sr)];this.wet=1;this.targetWet=1;this.outL=this.outR=0;this.prePeak=0;this.inputEnergy=0;this.fast=0;this.slow=0;this.lowL=0;this.lowR=0;this.highEnergy=0;this.sideEnergy=0;this.tailEnergy=0;this.sensors={energy:0,brightness:0,transient:0,width:0,tail:0};this.alpha=1-Math.exp(-1/(sr*.06));this.attack=1-Math.exp(-1/(sr*.006));this.release=1-Math.exp(-1/(sr*.22));}
 configure(i,type,a,b,c,mix=.4){if(!this.slots[i])throw Error("slot");if(![a,b,c,mix].every(Number.isFinite))throw Error("nonfinite settings");this.slots[i].configure(type,a,b,c,mix);}
 setWet(v){if(Number.isFinite(v))this.targetWet=clamp(v);}
 clear(){for(const s of this.slots)s.clear();this.outL=this.outR=this.prePeak=this.inputEnergy=this.fast=this.slow=this.lowL=this.lowR=this.highEnergy=this.sideEnergy=this.tailEnergy=0;for(const k in this.sensors)this.sensors[k]=0;}
 process(l,r){
  const dryL=l,dryR=r,amp=.5*(Math.abs(l)+Math.abs(r));this.inputEnergy+=(amp-this.inputEnergy)*this.alpha;
  this.fast+=(amp-this.fast)*(amp>this.fast?this.attack:this.release);this.slow+=(amp-this.slow)*this.alpha;
  this.lowL+=(l-this.lowL)*.12;this.lowR+=(r-this.lowR)*.12;
  const hi=.5*(Math.abs(l-this.lowL)+Math.abs(r-this.lowR));this.highEnergy+=(hi-this.highEnergy)*this.alpha;
  let tail=0;
  for(let i=0;i<3;i++){const s=this.slots[i];s.process(l,r);if(s.type==="decay"||s.type==="refraction"||s.type==="bloom")tail+=s.mix*.5*(Math.abs(s.wetL)+Math.abs(s.wetR));l=s.outL;r=s.outR;}
  this.tailEnergy+=(tail-this.tailEnergy)*this.alpha;this.sideEnergy+=(Math.abs(l-r)*.5-this.sideEnergy)*this.alpha;
  this.wet+=(this.targetWet-this.wet)*this.alpha;this.outL=dryL+(l-dryL)*this.wet;this.outR=dryR+(r-dryR)*this.wet;
  this.prePeak=Math.max(this.prePeak,Math.abs(this.outL),Math.abs(this.outR));
 }
 endBlock(){const s=this.sensors;s.energy=clamp(this.inputEnergy*3);s.brightness=clamp(this.highEnergy/(this.inputEnergy+.015));s.transient=clamp((this.fast-this.slow)*8);s.width=clamp(this.sideEnergy*4);s.tail=clamp(this.tailEnergy*3);return s;}
}
const api={Rack,types};if(typeof module==="object"&&module.exports)module.exports=api;else root.CobaliteFX=api;
})(globalThis);
