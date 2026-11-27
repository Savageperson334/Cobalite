/* 0.9 extensions: capture, non-destructive motion, clock and voice modulation. */
(function(root){"use strict";
const I=root.CobaliteInstrument,P=root.CobalitePhrase,clamp=I.clamp,mod=(x,n)=>((x%n)+n)%n,copy=x=>JSON.parse(JSON.stringify(x));
const oldInit=I.init,oldValidate=I.validate,oldAllowed=I.routeAllowed;
for(const [id,label,value,scope] of [["mattack","Mod attack",.08,"voice"],["mdecay","Mod decay",.35,"voice"],["msustain","Mod sustain",.35,"voice"],["mrelease","Mod release",.3,"voice"],["roamSpeed1","Journey 1 speed",.5,"global"],["roamSpeed2","Journey 2 speed",.5,"global"]]){
 I.registry[id]={id,label,value,scope,page:"motion",roam:id.startsWith("m")};I.ids.push(id);
}
Object.assign(I.sources,{menv:"Mod envelope",poly1:"Voice LFO 1",poly2:"Voice LFO 2"});
const poly=new Set(["menv","poly1","poly2"]);
I.routeAllowed=(s,d)=>oldAllowed(s,d)&&!(poly.has(s)&&I.registry[d]?.scope==="global");
I.setRoute=(p,s,d,v)=>{if(!I.routeAllowed(s,d)||!Number.isFinite(v))return false;const old=p.routes.find(r=>r.src===s&&r.dest===d);if(!old&&v!==0&&p.routes.length>=64)return false;p.routes=p.routes.filter(r=>r.src!==s||r.dest!==d);if(v!==0)p.routes.push({src:s,dest:d,depth:clamp(v,-1,1)});return true;};
const divisions=[0,.25,.5,1,2,4,8,16,32];
function settings(raw={}){
 const p={close:"smart",sync:[0,0,0],arpSteps:8,arpPulses:8,arpRotate:0,arpDivision:.5,arpGate:.65,gesture:null};
 if(["smart","bar","free"].includes(raw.close))p.close=raw.close;
 if(Array.isArray(raw.sync))p.sync=p.sync.map((_,i)=>divisions.includes(raw.sync[i])?raw.sync[i]:0);
 for(const [k,lo,hi] of [["arpSteps",1,16],["arpPulses",0,16],["arpRotate",0,15]])if(Number.isFinite(raw[k]))p[k]=clamp(Math.round(raw[k]),lo,hi);
 p.arpPulses=Math.min(p.arpPulses,p.arpSteps);if([.125,.25,1/3,.5,1,2].includes(raw.arpDivision))p.arpDivision=raw.arpDivision;if(Number.isFinite(raw.arpGate))p.arpGate=clamp(raw.arpGate,.05,.98);
 p.gesture=validateGesture(raw.gesture);return p;
}
I.init=()=>{const p=oldInit();p.performance=settings();return p;};
I.validate=raw=>{const p=oldValidate(raw);p.routes=p.routes.filter(r=>I.routeAllowed(r.src,r.dest));p.performance=settings(raw.performance||{});return p;};
function finishCapture(cap,beat,mode="smart"){
 if(!cap.armed||cap.origin===null){cap.reset();return null;}
 const elapsed=clamp(beat-cap.origin,.25,128);
 for(const id of [...cap.held.keys()])cap.off(id,beat);
 const last=Math.max(0,...cap.notes.map(n=>n.start+n.duration));
 let length=Math.ceil((Math.max(elapsed,last)-1e-7)/4)*4;
 if(mode==="free")length=Math.max(elapsed,last);
 if(mode==="smart"){const nearest=Math.round(elapsed/4)*4;if(nearest>=4&&elapsed>=nearest&&elapsed-nearest<=.3&&last<=nearest+1e-7)length=nearest;}
 const phrase=P.validate({length:clamp(length,.25,128),notes:cap.notes});cap.reset();return phrase;
}
class Overdub{
 constructor(){this.cancel();}
 cancel(){this.active=false;this.notes=[];this.held=new Map();}
 arm(phrase,origin){this.cancel();if(!phrase?.notes.length)return false;this.active=true;this.length=phrase.length;this.origin=origin;this.capacity=512-phrase.notes.length;return true;}
 on(id,pitch,velocity,beat){if(!this.active)return;if(this.held.has(id))this.off(id,beat);if(this.notes.length+this.held.size>=this.capacity)return;this.held.set(id,{beat,start:mod(beat-this.origin,this.length),pitch,velocity});}
 off(id,beat){if(!this.active||!this.held.has(id))return;const n=this.held.get(id);this.held.delete(id);this.notes.push({start:n.start,pitch:n.pitch,velocity:n.velocity,duration:clamp(beat-n.beat,.01,this.length)});}
 finish(phrase,beat){if(!this.active)return null;for(const id of [...this.held.keys()])this.off(id,beat);const result=this.notes.length?P.validate({length:phrase.length,notes:[...phrase.notes,...this.notes]}):null;this.cancel();return result;}
}
function validateGesture(g){if(!g||!Number.isFinite(g.length)||g.length<.25||g.length>128||!Array.isArray(g.lanes))return null;const lanes=[];for(const lane of g.lanes.slice(0,4)){if(!lane||!I.registry[lane.id]?.roam||!Array.isArray(lane.points)||lanes.some(l=>l.id===lane.id))continue;const points=lane.points.filter(p=>p&&Number.isFinite(p.t)&&Number.isFinite(p.v)).slice(0,256).map(p=>({t:clamp(p.t,0,g.length),v:clamp(p.v,-1,1)})).sort((a,b)=>a.t-b.t);if(points.length)lanes.push({id:lane.id,points});}return lanes.length?{length:g.length,lanes}:null;}
class Gesture{
 constructor(){this.cancel();this.data=null;this.origin=0;this.playing=false;this.offsets=Object.fromEntries(I.ids.map(k=>[k,0]));}
 cancel(){this.recording=false;this.lanes=[];this.start=null;}
 arm(length,beat){this.cancel();this.recording=true;this.length=clamp(length,.25,128);this.start=beat;this.playing=false;}
 touch(id,delta,beat){if(!this.recording||!I.registry[id]?.roam||!Number.isFinite(delta))return false;let l=this.lanes.find(x=>x.id===id);if(!l){if(this.lanes.length>=4)return false;l={id,points:[{t:0,v:0}],value:0};this.lanes.push(l);}l.value=clamp(l.value+delta,-1,1);const t=clamp(beat-this.start,0,this.length);const last=l.points.at(-1);if(l.points.length>1&&t-last.t<1/64){last.t=t;last.v=l.value;}else if(l.points.length<254)l.points.push({t,v:l.value});else{last.t=t;last.v=l.value;}return true;}
 finish(beat){if(!this.recording)return null;const g={length:this.length,lanes:this.lanes.map(l=>{const end=clamp(beat-this.start,0,this.length),points=l.points.slice();const fade=Math.min(.25,this.length*.1);const tail=Math.min(end,this.length-fade);while(points.length>1&&points.at(-1).t>tail)points.pop();points.push({t:tail,v:l.value},{t:this.length,v:0});return {id:l.id,points};})};const data=validateGesture(g);this.cancel();if(data){this.data=data;this.origin=beat;this.playing=true;}return data;}
 sample(beat,dt){for(const k of I.ids){let target=0;if(this.recording){target=this.lanes.find(l=>l.id===k)?.value||0;}else if(this.playing&&this.data){const l=this.data.lanes.find(l=>l.id===k);if(l){const t=mod(beat-this.origin,this.data.length),a=l.points;let j=0;while(j+1<a.length&&a[j+1].t<=t)j++;const next=a[j+1];target=next?a[j].v+(next.v-a[j].v)*clamp((t-a[j].t)/Math.max(1e-9,next.t-a[j].t)):a[j].v;}}this.offsets[k]+=(target-this.offsets[k])*(1-Math.exp(-dt/.035));}return this.offsets;}
}
function hit(step,steps,pulses,rotation=0){return pulses>0&&mod((step-rotation)*pulses,steps)<pulses;}
function clockRate(bpm,division,free){return division?bpm/60/division:free;}
class MidiTempo{
 constructor(){this.reset();}
 reset(){this.last=null;this.period=null;this.count=0;}
 tick(ms){if(!Number.isFinite(ms))return null;if(this.last===null){this.last=ms;return null;}const d=ms-this.last;this.last=ms;if(d<8||d>90){this.period=null;this.count=0;return null;}this.period=this.period===null?d:this.period*.9+d*.1;return ++this.count>=12?clamp(60000/(24*this.period),35,240):null;}
}
root.CobalitePerformance09={settings,finishCapture,Overdub,Gesture,validateGesture,hit,clockRate,MidiTempo,divisions};
})(globalThis);
