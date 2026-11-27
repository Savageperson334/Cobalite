/* Physical gesture adapter; retains 0.8 geometry and encoder semantics. */
(function(root){"use strict";
const I=root.CobaliteInstrument,E=root.CobalitePerformance09,C=root.CobalitePanel08,clamp=I.clamp;
const fields={phrase:["capture","overdub","undo layer","play","stop","close","density","variation","rotate","quantize","swing","gate","harmony","original","gesture","gesture play","gesture undo"],motion:["sync division","lfo shape","motion","mod attack","mod decay","mod sustain","mod release","journey speed 1","journey speed 2"],voice:["arp steps","arp pulses","arp rotation","arp division","arp gate","cohesion","history","spread","detune","glide","energy"]};
const ids={"mod attack":"mattack","mod decay":"mdecay","mod sustain":"msustain","mod release":"mrelease","journey speed 1":"roamSpeed1","journey speed 2":"roamSpeed2"};
class Panel09 extends C.Panel08{
 constructor(emit){super(emit);this.gestureRecording=false;}
 fields(){return fields[this.page]||super.fields();}
 resolve(id){if(this.env==="mod"&&["attack","decay","sustain","release"].includes(id))return "m"+id;return super.resolve(id);}
 down(id){super.down(id);if(id==="sustain")this.source="menv";}
 up(id,cancel=false){if(id==="sustain"){const used=this.used.has(id);super.up(id,cancel);this.source=null;if(!used&&!cancel)this.env="mod";return;}super.up(id,cancel);}
 currentDest(){const k=this.current();if(this.page==="motion"){if(k==="lfo shape")return ["lshape1","lshape2","lshape3"][this.lfo];if(k==="motion")return "motion";if(ids[k])return ids[k];}if(this.page==="voice"&&I.registry[k])return k;return null;}
 turn(id,delta){if(!Number.isFinite(delta)||!delta)return;const dest=id==="edit"?(this.currentDest()||(fields[this.page]?null:(C.extras[this.page][this.param]||this.focus))):this.resolve(id);
  if(this.gestureRecording&&dest&&I.registry[dest]?.roam&&!this.source&&!this.roamCapture){for(const h of this.held)this.used.add(h);this.focus=dest;this.emit({type:"gestureDelta",id:dest,delta});this.msg="Gesture: "+I.registry[dest].label;return;}
  if(id==="edit"&&fields[this.page]){
   const k=this.current(),p=this.patch.performance;
   if(dest){for(const h of this.held)this.used.add(h);this.focus=dest;if(this.roamCapture){if(I.registry[dest].roam&&this.path.at(-1)?.id!==dest&&this.path.length<24)this.path.push({id:dest,sign:Math.sign(delta)});this.msg="Roam "+this.path.length;return;}if(this.source){this.route(this.source,dest,delta);return;}this.patch[dest]=clamp(this.patch[dest]+delta);this.changed();return;}
   if(this.roamCapture||this.source)return;
   if(k==="sync division")p.sync[this.lfo]=this.cycle(E.divisions,p.sync[this.lfo],delta);
   else if(k==="close")p.close=this.cycle(["smart","bar","free"],p.close,delta);
   else if(k==="arp steps")p.arpSteps=clamp(p.arpSteps+Math.sign(delta),1,16);
   else if(k==="arp pulses")p.arpPulses=clamp(p.arpPulses+Math.sign(delta),0,p.arpSteps);
   else if(k==="arp rotation")p.arpRotate=clamp(p.arpRotate+Math.sign(delta),0,15);
   else if(k==="arp division")p.arpDivision=this.cycle([.125,.25,1/3,.5,1,2],p.arpDivision,delta);
   else if(k==="arp gate")p.arpGate=clamp(p.arpGate+delta,.05,.98);
   else if(this.page==="phrase"){super.turn(id,delta);return;}else return;
   p.arpPulses=Math.min(p.arpPulses,p.arpSteps);this.msg=k+" updated";this.changed();return;
  }
  super.turn(id,delta);
 }
 activateLocal(){const k=this.current(),actions={"overdub":"overdub","undo layer":"undoLayer","gesture":"gesture","gesture play":"gesturePlay","gesture undo":"gestureUndo"};if(this.page==="phrase"&&actions[k]){this.emit({type:actions[k]});return;}super.activateLocal();}
}
root.CobalitePanel09={...C,Panel09};
})(globalThis);
