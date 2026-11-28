/* Hardware-facing panel controller. No DOM, storage or audio APIs.
 * IDs are logical, NOT Modal scan codes. The transport boundary is replaceable.
 */
(function(root){"use strict";
const I=root.CobaliteInstrument,C=root.CobalitePanel09,B=root.CobaliteBank08,copy=x=>JSON.parse(JSON.stringify(x)),clamp=I.clamp;
const rows=C.layout;
const positions=[
 [0,2,3,4,5.5,7,8,9,10,11],
 [0,1,2,3,4,5,6,7,8,9,10,11],
 [0,1,1.75,2.25,2.75,3.25,4,5.5,7,7.75,8.25,8.75,9.25,10,11]
];
const legends={mode:["Mode","Voice mode"],tuneA:["A1 / Tune1","Shape A"],algorithm:["Algorithm","Engine A/B"],tuneB:["A2 / Tune2","Character A"],oscA:["B1 / Fine1","Shape B"],oscB:["B2 / Fine2","Character B"],balance:["Mix / Glide","Balance"],rate:["Rate / Shape","LFO rate"],depth:["Depth / Mode","LFO depth"],cutoff:["Cutoff","Cutoff"],resonance:["Reso","Resonance"],filterMode:["Morph","Filter colour"],fxWet:["FX Level / Audio In","FX level"],fxA:["A / D","FX A"],fxB:["B / E","FX B"],fxC:["C / F","FX C"],attack:["Attack","Attack / Filter"],decay:["Decay","Decay / Amp"],sustain:["Sustain","Sustain / Mod"],release:["Release","Release"],envDepth:["Depth","Filter env"],drift:["Drift / Width","Individuality"],page:["Page / Param","Navigate"],edit:["Preset / Edit","Edit / Confirm"],shift:["Shift","Roam"],save:["Save","Save"],patch:["Patch / Seq","Patch / Phrase"],init:["Init / Rand","Hold: initialize"],velocity:["Velo","Velocity"],pressure:["AftT","Pressure"],note:["Note","Chord capture"],expr:["Expr","Terrain"],arp:["Arp / Division","Chord / Arp"],tempo:["Tempo / Length","Capture / Play"],volume:["Volume","Volume"],joystick:["X / Y","Terrain"]};
const controls=rows.flatMap((r,y)=>r.map((c,i)=>({...c,x:positions[y][i],y,stock:legends[c.id]?.[0]||c.label,alt:legends[c.id]?.[1]||c.label})));
const byId=Object.fromEntries(controls.map(c=>[c.id,c]));
const pages=["patches","sound","motion","fx","voice","phrase","terrain","roam","utility"];
const pageNames={...C.labels,patches:"Patches"};
const soundFields=["engine A","engine B","tuneA","tuneB","interaction","relation","crush","hold","drive"];
const voiceFields=["mode","chord mode","inversion","voicing","arp order","arp steps","arp pulses","arp rotation","arp division","arp gate","cohesion","history","spread","detune","glide","energy"];
const fxFields=["type","mix"];
const short=(s,n=21)=>String(s??"").slice(0,n);
class FrontPanel extends C.Panel09{
 constructor(output=()=>{},storage={}){super(d=>this.out(d));this.output=output;this.storage=storage;this.page="patches";this.nav="page";this.param=0;this.selectedPreset=0;this.presetName="Init";this.timestamps={};this.state={};this.telemetry={};this.dirty=false;this.pending=null;this.patch=I.init();this.source=null;this.roamRunning=false;this.bank=Array.from({length:16},()=>null);this.readBank();}
 out(d){if(d.type==="patch"){this.pending=d;this.dirty=true;}else if(d.type==="save"){this.saveSlot();}else if(d.type==="init"){this.initialize();}else{this.flush();this.output(d);}}
 flush(){if(this.pending){const d=this.pending;this.pending=null;this.output(d);}}
 fields(){if(this.page==="patches")return ["factory","user"];if(this.page==="sound")return soundFields;if(this.page==="voice")return voiceFields;if(this.page==="fx")return fxFields;return super.fields();}
 current(){return this.fields()[this.param]??this.fields()[0]??this.focus;}
 readBank(){try{const raw=this.storage.read?.();if(Array.isArray(raw))for(let i=0;i<16;i++)if(raw[i]?.patch)this.bank[i]={name:short(raw[i].name,18),patch:I.validate(raw[i].patch),corners:this.validCorners(raw[i].corners),journeys:this.validJourneys(raw[i].journeys)};}catch{this.msg="User bank unreadable";}}
 validCorners(c){return Array.from({length:4},(_,i)=>c?.[i]?C.snapshot(I.validate({...I.init(),...c[i]})):null);}
 validJourneys(j){return Array.from({length:2},(_,i)=>{const r=j?.[i],p=I.validate({...I.init(),roam:r}).roam;return {...p,trail:clamp(Number(r?.trail)||0),once:!!r?.once};});}
 saveSlot(){const i=clamp(this.selectedPreset,0,15);if(this.page!=="patches"||this.current()!=="user"){this.pageTo("patches");this.param=1;this.msg="Choose user slot then Save";return;}const item={name:this.presetName,patch:copy(this.patch),corners:copy(this.corners),journeys:copy(this.journeys)};const next=this.bank.slice();next[i]=item;try{this.storage.write?.(next);this.bank=next;this.msg="Saved user "+(i+1);this.dirty=false;}catch{this.msg="Save failed";}}
 load(p,name,corners,journeys){this.pending=null;this.output({type:"panic"});this.patch=I.validate(p);this.corners=this.validCorners(corners);this.journeys=this.validJourneys(journeys);this.terrainBase=null;this.frozen=[false,false];this.roamRunning=false;this.roamCapture=false;this.path=[];this.gestureRecording=false;this.state={};this.presetName=name;this.changed();if(this.pending)this.pending.announce=true;this.flush();this.dirty=false;this.msg="Loaded "+name;}
 initialize(){this.load(I.init(),"Init");}
 resolve(id){if(id==="tuneA")return this.held.has("patch")?"tuneA":"shapeA";if(id==="tuneB")return this.held.has("patch")?"tuneB":"charA";if(id==="oscA")return "shapeB";if(id==="oscB")return "charB";return super.resolve(id);}
 pageTo(p){this.page=p;this.param=0;this.nav="param";this.msg=pageNames[p];}
 pick(list,current,steps){return list[((list.indexOf(current)+steps)%list.length+list.length)%list.length];}
 dispatch(e){if(!e||typeof e.kind!=="string")return false;const id=e.id,c=byId[id],t=Number.isFinite(e.ms)?e.ms:0;
 if(e.kind==="cancel"){for(const h of [...this.held])this.up(h,true);this.timestamps={};this.source=null;return true;}
 if(e.kind==="xy"){if(!Number.isFinite(e.x)||!Number.isFinite(e.y))return false;this.move(e.x,e.y);return true;}
 if(!c)return false;
 if(e.kind==="down"){if(!(c.push||c.button)||this.held.has(id))return false;this.timestamps[id]=t;this.down(id);return true;}
 if(e.kind==="up"){if(!(c.push||c.button)||!this.held.has(id))return false;const held=t-(this.timestamps[id]??t);delete this.timestamps[id];this.release(id,held,!!e.cancel);return true;}
 if(e.kind==="turn"){if(c.button||c.xy||c.display||!Number.isInteger(e.steps)||!e.steps)return false;const steps=clamp(e.steps,-32,32);for(let i=0;i<Math.abs(steps);i++)this.detent(id,Math.sign(steps));return true;}return false;}
 release(id,ms,cancel){const used=this.used.has(id);if(cancel||used){this.up(id,true);return;}
 // Roam release commits even when its hold was used.
 if(id==="shift"){this.up(id,false);return;}
 if(id==="page"){this.up(id,true);this.nav=this.nav==="page"?"param":"page";return;}
 if(id==="tempo"){this.up(id,true);if(ms>=650)this.out({type:"stop"});else if(this.state.capturing)this.out({type:"capture"});else if(this.patch.phrase)this.out({type:"play"});else this.out({type:"capture"});return;}
 if(id==="init"){this.up(id,true);if(ms>=800)this.initialize();else this.msg="Hold Init 0.8s";return;}
 if(id==="patch"){this.up(id,true);this.pageTo(this.page==="phrase"?"patches":"phrase");return;}
 if(id==="edit"){this.up(id,true);this.activate();return;}
 if(id==="save"){this.up(id,true);this.saveSlot();return;}
 super.up(id,false);if(["rate","depth","fxA","fxB","fxC","note","expr"].includes(id)){this.param=0;this.nav="param";}
 }
 detent(id,step){const d=step/100;for(const h of this.held)this.used.add(h);
 if(id==="page"){if(this.nav==="page"){this.page=this.pick(pages,this.page,step);this.param=0;}else this.param=(this.param+step+this.fields().length)%Math.max(1,this.fields().length);this.msg=this.current();return;}
 if(id==="edit"&&!this.source&&!this.roamCapture&&!this.gestureRecording){
 const k=this.current();
 if(this.page==="patches"){const n=k==="user"?16:B.names.length;this.selectedPreset=((this.selectedPreset+step)%n+n)%n;return;}
 if(this.page==="fx"){if(k==="type"){this.returnTerrain(true);this.patch.fxTypes[this.fx]=this.pick(I.effects,this.patch.fxTypes[this.fx],step);const a=root.CobaliteFX.types[this.patch.fxTypes[this.fx]].defaults;for(let j=0;j<3;j++)this.patch["fx"+this.fx+"ABC"[j]]=a[j];this.changed();}else{const key="fx"+this.fx+"Mix";this.patch[key]=clamp(this.patch[key]+d);this.changed();}return;}
 if(k==="engine A"||k==="engine B"){this.returnTerrain(true);const key=k==="engine A"?"engineA":"engineB";this.patch[key]=this.pick(I.engines,this.patch[key],step);this.changed();return;}
 if(k==="mode"||k==="chord mode"||k==="arp order"){if(k==="mode")this.returnTerrain(true);const key=k==="mode"?"mode":k==="chord mode"?"chordMode":"arpOrder",list=k==="mode"?I.modes:k==="chord mode"?["off","chord","arp"]:["up","down","pendulum","outside"];this.patch[key]=this.pick(list,this.patch[key],step);this.changed();return;}
 if(k==="inversion"||k==="voicing"){this.patch[k]=clamp(this.patch[k]+step,k==="inversion"?-3:0,k==="inversion"?3:2);this.changed();return;}
 }
 
 if(id==="edit"&&this.page==="sound"&&I.registry[this.current()]){const dest=this.current();this.focus=dest;if(this.roamCapture){if(I.registry[dest].roam&&this.path.at(-1)?.id!==dest&&this.path.length<24)this.path.push({id:dest,sign:step});}else if(this.source)this.route(this.source,dest,d);else if(this.gestureRecording&&I.registry[dest].roam)this.out({type:"gestureDelta",id:dest,delta:d});else{this.patch[dest]=clamp(this.patch[dest]+d);this.changed();}return;}
 super.turn(id,d);
 }
 activate(){if(this.page==="patches"){if(this.current()==="user"){const b=this.bank[this.selectedPreset];if(b)this.load(b.patch,b.name,b.corners,b.journeys);else this.msg="Empty user slot";}else{const i=this.selectedPreset%B.names.length;this.load(B.make(i),B.names[i].name);}return;}super.activateLocal();}
 feedback(d){if(d.type==="state"){this.state=d;this.gestureRecording=!!d.gestureRecording;if(d.reason!=="panic"){this.patch.phrase=d.phrase;this.patch.chord=d.chord;if(d.reason==="gestureFinished"||d.reason==="patch")this.patch.performance.gesture=d.gesture;if(d.reason==="phraseFinished")this.patch.transforms={};if(d.reason==="chordFinished"){this.patch.chordMode="chord";this.changed();}if(this.pending)this.pending.patch=copy(this.patch);}}else if(d.type==="telemetry"){this.telemetry=d;if(d.journeys)this.frozen=d.journeys.map(j=>j.frozen);}}
 screen(){const k=this.current(),p=this.patch;let value="",dest=null;if(this.page==="patches"){value=k==="user"?(this.bank[this.selectedPreset]?.name||"Empty slot"):B.names[this.selectedPreset%B.names.length].name;value=(this.selectedPreset+1)+" "+value;}else if(this.page==="fx"){value=k==="type"?p.fxTypes[this.fx]:Math.round(p["fx"+this.fx+"Mix"]*100)+"%";}else if(k==="engine A"||k==="engine B")value=p[k==="engine A"?"engineA":"engineB"];else if(k==="mode"||k==="chord mode"||k==="arp order")value=p[k==="mode"?"mode":k==="chord mode"?"chordMode":"arpOrder"];else if(k==="inversion"||k==="voicing")value=p[k];else if(this.page==="phrase"&&k in root.CobalitePhrase.defaults)value=(p.transforms[k]??root.CobalitePhrase.defaults[k]).toFixed(2);else if(k==="close")value=p.performance.close;else if(k==="sync division")value=p.performance.sync[this.lfo]||"Free";else if(this.page==="voice"&&k.startsWith("arp ")){const m={"arp steps":"arpSteps","arp pulses":"arpPulses","arp rotation":"arpRotate","arp division":"arpDivision","arp gate":"arpGate"};value=p.performance[m[k]]??"";}else if(this.page==="roam"){const j=this.journeys[this.roamSlot];value=k==="journey"?this.roamSlot+1:k==="mode"?(j.once?"Once":"Loop"):j[k]??"";}else if(this.page==="utility"&&k==="source")value=I.sources[this.inspectSource];else{dest=this.currentDest()||(I.registry[k]?k:null);if(dest)value=Math.round(p[dest]*100)+"%";}
 const status=this.roamCapture?"ROAM "+this.path.length:this.source?"ASSIGN "+I.sources[this.source]:this.state.capturing?"REC PHRASE":this.state.overdubbing?"OVERDUB":this.gestureRecording?"REC MOTION":this.state.playing?"PLAY":this.dirty?"EDITED":"READY";
 const focused=this.focus,route=p.routes.find(r=>r.dest===focused&&r.src===(this.source||this.inspectSource));return {lines:[short((this.nav==="page"?"> ":"")+pageNames[this.page]+" "+status),short((this.nav==="param"?"> ":"")+k+" "+value),short(this.msg),short((I.registry[focused]?.label||focused)+" "+(route?(route.depth*100).toFixed(0)+"%":Math.round(p[focused]*100)+"%"))],leds:{mode:p.mode,lfo:this.lfo,fx:this.fx,env:this.env,held:[...this.held],play:!!this.state.playing,record:!!(this.state.capturing||this.state.overdubbing||this.gestureRecording),arp:p.chordMode==="arp",roam:this.roamCapture||!!this.telemetry.journeys?.some(j=>j.running),terrain:!!this.terrainBase}};}
}
// Fix release ordering for the momentary capture gesture.
const release=FrontPanel.prototype.release;
FrontPanel.prototype.release=function(id,ms,cancel){if(id==="shift"){this.up(id,cancel);return;}if(id==="tempo"&&this.held.has("patch")&&!cancel){this.up(id,true);this.used.add("patch");this.out({type:"capture"});return;}return release.call(this,id,ms,cancel);};
root.CobaliteFront={FrontPanel,controls,pages,byId};
})(globalThis);
