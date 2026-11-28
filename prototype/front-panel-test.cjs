const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root={},read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
for(const n of ["phrase-core.js","society-core.js","fx-core.js","instrument-core.js","performance-09.js","panel-core.js","panel-adapter-09.js","panel-bank.js","front-controller.js"])new Function("globalThis",read(n))(root);
new Function(read("front-panel.js"));
const C=root.CobaliteFront,I=root.CobaliteInstrument,out=[];let stored;
const p=new C.FrontPanel(d=>out.push(d),{read:()=>stored,write:v=>stored=JSON.parse(JSON.stringify(v))});
let ms=0;
function turn(id,steps){assert(p.dispatch({kind:"turn",id,steps,ms:++ms}));}
function down(id){assert(p.dispatch({kind:"down",id,ms:++ms}));}
function up(id,duration=10){ms+=duration;assert(p.dispatch({kind:"up",id,ms}));}
function tap(id,duration){down(id);up(id,duration);}
assert.equal(C.controls.filter(x=>!x.display&&!x.xy&&!x.button).length,26);
assert.equal(C.controls.filter(x=>x.push).length,13);
assert.equal(C.controls.filter(x=>x.button).length,9);
assert(!p.dispatch({kind:"down",id:"cutoff"}));
const cutoff=p.patch.cutoff;
down("shift");turn("cutoff",-4);turn("balance",3);up("shift");assert.equal(p.patch.cutoff,cutoff);assert.equal(p.journeys[0].path.length,2);assert.equal(out.at(-1).type,"journey");
down("rate");turn("cutoff",5);up("rate");assert.equal(p.patch.cutoff,cutoff);assert(p.patch.routes.some(x=>x.src==="lfo"&&x.dest==="cutoff"));assert.equal(p.lfo,0);
down("shift");turn("cutoff",2);p.dispatch({kind:"cancel"});assert.equal(p.journeys[0].path.length,2);assert.equal(p.held.size,0);
tap("rate");assert.equal(p.lfo,1);assert.equal(p.page,"motion");tap("page");assert.equal(p.nav,"page");turn("page",2);assert.equal(p.page,"voice");tap("page");assert.equal(p.nav,"param");turn("page",2);assert.equal(p.current(),"inversion");turn("edit",2);assert.equal(p.patch.inversion,2);
tap("fxC");assert.equal(p.fx,2);turn("edit",1);assert.notEqual(p.patch.fxTypes[2],"bypass");turn("page",1);assert.equal(p.current(),"mix");down("rate");turn("edit",3);up("rate");assert(p.patch.routes.some(x=>x.dest==="fx2Mix"));
tap("tempo");assert.equal(out.at(-1).type,"capture");p.feedback({type:"state",reason:"phraseFinished",phrase:{length:4,notes:[{start:0,duration:1,pitch:60,velocity:.8}]},chord:[0,4,7],playing:true});tap("tempo",700);assert.equal(out.at(-1).type,"stop");down("patch");tap("tempo");up("patch");assert.equal(out.at(-1).type,"capture");
tap("save");assert.equal(p.page,"patches");assert.equal(p.current(),"user");tap("save");assert(stored[0]);p.patch.cutoff=.2;tap("edit");assert.equal(p.patch.cutoff,cutoff);assert(p.screen().lines.every(x=>x.length<=21));tap("init",100);assert(p.msg.includes("Hold"));tap("init",900);assert.equal(p.presetName,"Init");
const native=read("../firmware/panel/panel_input.h"),ids=native.match(/typedef enum \{ (P_MODE[\s\S]+?) \} PanelId/)[1].split(",").map(s=>s.trim().slice(2).toLowerCase()).slice(0,-1);
assert.deepEqual(ids,C.controls.map(c=>c.id.toLowerCase()));
console.log("H1: geometry budget, Roam, route assignment, cancel, navigation, selected FX mix, transport, preset bank, OLED bounds, native ID order and init passed.");
