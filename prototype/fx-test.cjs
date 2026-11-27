const assert=require("node:assert/strict"),{Rack,types}=require("./fx-core.js");
for(const sr of [44100,48000]){
 const dry=new Rack(sr);
 for(let i=0;i<1000;i++){let x=Math.sin(i*.07)*.2,y=Math.cos(i*.09)*.2;dry.process(x,y);assert.equal(dry.outL,x);assert.equal(dry.outR,y);}
 for(const type of Object.keys(types).filter(x=>x!=="bypass")){
  const rack=new Rack(sr);rack.configure(0,type,...types[type].defaults,.65);
  let early=0,late=0,changed=0,width=0,tail=0;for(let i=0;i<sr*3;i++){const x=i<sr*.35?.2*Math.sin(i*2*Math.PI*220/sr):0;rack.process(x,x);assert(Number.isFinite(rack.outL)&&Number.isFinite(rack.outR));if(i<sr)early+=rack.outL**2+rack.outR**2;if(i>sr)late+=rack.outL**2+rack.outR**2;changed+=Math.abs(rack.outL-x);if(i%128===0){const s=rack.endBlock();for(const v of Object.values(s))assert(v>=0&&v<=1&&Number.isFinite(v));width=Math.max(width,s.width);tail=Math.max(tail,s.tail);}}
  assert(changed>0&&early>0&&rack.prePeak<1);if(["decay","refraction","bloom"].includes(type))assert(tail>0);if(["refraction","parallax","bloom"].includes(type))assert(width>0);console.log(sr+" "+type+" peak="+rack.prePeak.toFixed(3)+" tail="+tail.toFixed(3)+" width="+width.toFixed(3));
  rack.clear();rack.setWet(0);for(let i=0;i<sr;i++)rack.process(0,0);assert(Math.abs(rack.outL)<1e-9&&Math.abs(rack.outR)<1e-9);
 }
 const stress=new Rack(sr);for(let i=0;i<3;i++)stress.configure(i,["decay","refraction","bloom"][i],.2,1,1,1);
 for(let i=0;i<sr*5;i++){let x=i<sr*.5?.35*Math.sin(i*.17):0;stress.process(x,-x);assert(Number.isFinite(stress.outL)&&Number.isFinite(stress.outR));}
 assert(stress.prePeak<2);console.log(sr+" Hz: exact bypass, all effects, sensor bounds, reset and max-feedback stress passed; peak="+stress.prePeak.toFixed(3));
}