/* Two bounded, sample-clocked travelling modulation paths. */
(function(root){"use strict";
const I=root.CobaliteInstrument,clamp=I.clamp;
class Journey {
 constructor(){this.path=[];this.phase=0;this.duration=180;this.depth=.5;this.trail=0;this.once=false;this.running=false;this.frozen=false;this.offsets=Object.fromEntries(I.ids.map(k=>[k,0]));}
 configure(c){if(!c)return;if(Array.isArray(c.path))this.path=c.path.filter(e=>e&&I.registry[e.id]?.roam&&(e.sign===1||e.sign===-1)).slice(0,24);if(Number.isFinite(c.duration))this.duration=clamp(c.duration,10,600);if(Number.isFinite(c.depth))this.depth=clamp(c.depth);if(Number.isFinite(c.trail))this.trail=clamp(c.trail);if(typeof c.once==="boolean")this.once=c.once;}
 step(dt){const targets={};if(this.running&&this.path.length){if(!this.frozen){this.phase+=dt/this.duration;if(this.phase>=1){if(this.once){this.phase=1;this.running=false;}else this.phase%=1;}}if(this.running){const x=this.phase*this.path.length,i=Math.min(this.path.length-1,Math.floor(x)),w=.5-.5*Math.cos(Math.PI*(x-i)),pulse=this.path.length===1?.5-.5*Math.cos(this.phase*Math.PI*2):this.once?Math.min(1,this.phase*12,(1-this.phase)*12):1;for(const [e,g] of [[this.path[i],1-w],[this.path[(i+1)%this.path.length],w]])targets[e.id]=(targets[e.id]||0)+e.sign*.5*this.depth*g*pulse;}}
 for(const k of I.ids){const t=targets[k]||0,prev=this.offsets[k],rising=Math.abs(t)>Math.abs(prev),seconds=!this.running?.45:rising?.35:.45+this.trail*Math.min(60,this.duration/Math.max(1,this.path.length));this.offsets[k]+=(t-prev)*(1-Math.exp(-dt/seconds));}return this.offsets;}
}
class Duo{constructor(){this.paths=[new Journey(),new Journey()];this.offsets=Object.fromEntries(I.ids.map(k=>[k,0]));}message(d){const p=this.paths[d.slot];if(!p)return;p.configure(d.config);if(d.restart)p.phase=0;if(typeof d.running==="boolean")p.running=d.running;if(typeof d.frozen==="boolean")p.frozen=d.frozen;}step(dt){for(const p of this.paths)p.step(dt);for(const k of I.ids)this.offsets[k]=clamp(this.paths[0].offsets[k]+this.paths[1].offsets[k],-.65,.65);return this.offsets;}}
root.CobaliteRoam08={Journey,Duo};
})(globalThis);
