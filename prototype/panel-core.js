/* Cobalite panel and performance model, candidate 0.8. No hardware IDs assumed. */
(function(root){"use strict";
const I=root.CobaliteInstrument,clamp=I.clamp,copy=x=>JSON.parse(JSON.stringify(x));
const layout=[
 [{id:"mode",label:"Mode",button:true},{id:"tuneA",label:"Tune1"},{id:"algorithm",label:"Algorithm",push:true},{id:"tuneB",label:"Tune2"},{id:"cutoff",label:"Cutoff",large:true},{id:"fxWet",label:"FX Level"},{id:"fxA",label:"A",push:true},{id:"fxB",label:"B",push:true},{id:"fxC",label:"C",push:true},{id:"volume",label:"Volume"}],
 [{id:"rate",label:"Rate",push:true},{id:"depth",label:"Depth",push:true},{id:"oscA",label:"A1 / B1"},{id:"balance",label:"Mix"},{id:"oscB",label:"A2 / B2"},{id:"resonance",label:"Reso"},{id:"filterMode",label:"Morph"},{id:"attack",label:"Attack",push:true},{id:"decay",label:"Decay",push:true},{id:"sustain",label:"Sustain",push:true},{id:"release",label:"Release"},{id:"envDepth",label:"Depth",push:true}],
 [{id:"joystick",label:"Joystick",xy:true},{id:"drift",label:"Drift"},{id:"velocity",label:"Velo",button:true},{id:"pressure",label:"AftT",button:true},{id:"note",label:"Note",button:true},{id:"expr",label:"Expr",button:true},{id:"page",label:"Page / Param",push:true},{id:"screen",label:"OLED",display:true},{id:"edit",label:"Preset / Edit",push:true},{id:"shift",label:"Shift",button:true},{id:"save",label:"Save",button:true},{id:"patch",label:"Patch / Seq",button:true},{id:"init",label:"Init / Rand",button:true},{id:"arp",label:"Arp / Division",push:true},{id:"tempo",label:"Tempo / Length"}]
];
const screens=["sound","motion","fx","voice","phrase","terrain","roam","utility"];
const extras={sound:["charA","charB","interaction","relation","crush","hold","drive"],motion:["lshape1","lshape2","lshape3","motion"],fx:["fx0Mix","fx1Mix","fx2Mix"],voice:["cohesion","history","spread","detune","glide","energy"],phrase:[],terrain:[],roam:[],utility:[]};
const labels={sound:"Sound",motion:"Motion",fx:"Effects",voice:"Voice",phrase:"Phrase",terrain:"Terrain",roam:"Roam",utility:"Utility"};
function compatible(a,b){return a.engineA===b.engineA&&a.engineB===b.engineB&&a.mode===b.mode&&a.fxTypes.every((x,i)=>x===b.fxTypes[i]);}
function snapshot(p){const v={engineA:p.engineA,engineB:p.engineB,mode:p.mode,fxTypes:p.fxTypes.slice(),routes:copy(p.routes)};for(const k of I.ids)v[k]=p[k];return v;}
function blend(p,corners,x,y){const first=corners.find(Boolean);if(!first)return copy(p);if(!compatible(first,p)||corners.some(c=>c&&!compatible(first,c)))throw Error("Terrain needs matching engines, voice mode and FX types");const a=corners.map(c=>c||first),w=[(1-x)*(1-y),x*(1-y),(1-x)*y,x*y],next=copy(p);for(const k of I.ids)next[k]=a.reduce((sum,c,i)=>sum+c[k]*w[i],0);const routes=new Map();for(let i=0;i<4;i++)for(const r of a[i].routes){const key=r.src+":"+r.dest,v=routes.get(key)||{src:r.src,dest:r.dest,depth:0};v.depth+=r.depth*w[i];routes.set(key,v);}next.routes=[...routes.values()].filter(r=>Math.abs(r.depth)>1e-6).sort((a,b)=>Math.abs(b.depth)-Math.abs(a.depth)).slice(0,64);return next;}
class Panel08 {
 constructor(emit=()=>{}){this.emit=emit;this.patch=I.init();this.page="sound";this.param=0;this.focus="cutoff";this.lfo=0;this.fx=0;this.env="amp";this.osc=0;this.source=null;this.held=new Set();this.used=new Set();this.roamCapture=false;this.path=[];this.roamRunning=false;this.volume=.5;this.corners=[null,null,null,null];this.terrainBase=null;this.xy=[0,0];this.msg="Ready";this.undo=[];this.lastGesture=null;}
 changed(){this.emit({type:"patch",patch:copy(this.patch)});}
 remember(){this.undo.push(copy(this.patch));if(this.undo.length>32)this.undo.shift();}
 route(src,dest,delta){if(!I.routeAllowed(src,dest)){this.msg="Route unavailable";return;}const old=this.patch.routes.find(r=>r.src===src&&r.dest===dest)?.depth||0;I.setRoute(this.patch,src,dest,clamp(old+delta,-1,1));this.msg=I.sources[src]+" > "+I.registry[dest].label;this.changed();}
 resolve(id){if(id==="oscA")return this.held.has("patch")?"charA":"shapeA";if(id==="oscB")return this.held.has("patch")?"charB":"shapeB";if(id==="rate")return ["rate","rate2","rate3"][this.lfo];if(id==="depth")return ["ldepth1","ldepth2","ldepth3"][this.lfo];if(id==="envDepth")return this.env==="filter"?"filterEnv":null;if(["attack","decay","sustain","release"].includes(id))return this.env==="filter"?"f"+id:id;if(/^fx[ABC]$/.test(id))return "fx"+this.fx+id.at(-1);return I.registry[id]?id:null;}
 cycle(list,v,delta){return list[((list.indexOf(v)+Math.sign(delta))%list.length+list.length)%list.length];}
 turn(id,delta){if(!Number.isFinite(delta)||delta===0)return;for(const h of this.held)this.used.add(h);
 if(id==="volume"){this.volume=clamp(this.volume+delta);this.emit({type:"volume",value:this.volume});return;}
 if(id==="page"){this.page=this.cycle(screens,this.page,delta);this.param=0;this.msg=labels[this.page];return;}
 if(id==="algorithm"){const k=this.osc?"engineB":"engineA";this.patch[k]=this.cycle(I.engines,this.patch[k],delta);this.changed();return;}
 if(id==="tempo"){this.patch.bpm=clamp(this.patch.bpm+Math.round(delta*100),35,240);this.changed();return;}
 if(id==="arp"){this.patch.arpOrder=this.cycle(["up","down","pendulum","outside"],this.patch.arpOrder,delta);this.changed();return;}
 if(id==="edit"&&this.page==="fx"&&!this.held.has("shift")&&!this.source){this.patch.fxTypes[this.fx]=this.cycle(I.effects,this.patch.fxTypes[this.fx],delta);this.changed();return;}
 let dest=id==="edit"?(extras[this.page][this.param]||this.focus):this.resolve(id);if(!dest||!I.registry[dest])return;this.focus=dest;
 if(this.roamCapture){if(I.registry[dest].roam&&this.path.at(-1)?.id!==dest&&this.path.length<24)this.path.push({id:dest,sign:Math.sign(delta)});this.msg="Roam "+this.path.length;return;}
 if(this.source){this.route(this.source,dest,delta);return;}
 this.patch[dest]=clamp(this.patch[dest]+delta);this.msg=I.registry[dest].label;this.changed();}
 down(id){if(this.held.has(id))return;this.held.add(id);this.used.delete(id);if(id==="shift"){this.roamCapture=true;this.path=[];this.msg="Hold + turn destinations";}if(id==="rate")this.source=["lfo","lfo2","lfo3"][this.lfo];if(id==="velocity"||id==="pressure")this.source=id==="velocity"?"velocity":"pressure";}
 up(id,cancel=false){if(!this.held.delete(id))return;const used=this.used.has(id);this.used.delete(id);
 if(id==="shift"){this.roamCapture=false;if(!cancel&&this.path.length){this.remember();this.patch.roam.path=copy(this.path);this.changed();this.roamRunning=true;this.emit({type:"roam",running:true,restart:true});this.msg="Roam running";}else if(!cancel){this.roamRunning=false;this.emit({type:"roam",running:false});this.msg="Roam stopped";}return;}
 if(["rate","velocity","pressure"].includes(id))this.source=null;
 if(cancel||used)return;
 if(id==="algorithm")this.osc=1-this.osc;
 else if(id==="rate"){this.lfo=(this.lfo+1)%3;this.page="motion";}
 else if(id==="depth"){this.page="motion";this.param=this.lfo;}
 else if(id==="attack"||id==="decay"){this.env=id==="attack"?"filter":"amp";}
 else if(id==="fxA"||id==="fxB"||id==="fxC"){this.fx="ABC".indexOf(id.at(-1));this.page="fx";}
 else if(id==="page")this.param=(this.param+1)%Math.max(1,extras[this.page].length);
 else if(id==="mode"){this.patch.mode=this.cycle(I.modes,this.patch.mode,1);this.changed();}
 else if(id==="patch"){this.page=this.page==="phrase"?"sound":"phrase";}
 else if(id==="arp"){this.patch.chordMode=this.cycle(["off","chord","arp"],this.patch.chordMode,1);this.changed();}
 else if(id==="tempo")this.emit({type:"capture"});
 else if(id==="save")this.emit({type:"save"});
 else if(id==="init")this.msg="Init requires explicit confirmation";
 else if(id==="note"){this.page="voice";this.emit({type:"chordCapture"});}
 else if(id==="expr"){this.page="terrain";}
 else if(id==="edit"&&this.page==="phrase")this.emit({type:"play"});
 }
 captureCorner(i){if(this.terrainBase)throw Error("Return or keep before capturing");if(this.corners.some(c=>c&&!compatible(c,this.patch)))throw Error("Use matching engines and FX");this.corners[i]=snapshot(this.patch);this.msg="Captured corner "+(i+1);}
 enterTerrain(){if(!this.corners.some(Boolean))return false;this.terrainBase=copy(this.patch);this.move(...this.xy);return true;}
 move(x,y){this.xy=[clamp(x),clamp(y)];if(this.terrainBase){this.patch=blend(this.terrainBase,this.corners,...this.xy);this.changed();}}
 returnTerrain(keep=false){if(!this.terrainBase)return;if(!keep){this.patch=this.terrainBase;this.changed();}this.terrainBase=null;}
 reset(){this.remember();this.patch=I.init();this.corners=[null,null,null,null];this.terrainBase=null;this.roamRunning=false;this.emit({type:"panic"});this.emit({type:"roam",running:false});this.changed();}
}
root.CobalitePanel08={Panel08,layout,labels,extras,compatible,snapshot,blend};
})(globalThis);
