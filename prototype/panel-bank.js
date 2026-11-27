/* First audition bank — hand-authored parameter candidates, not listening-certified presets. */
(function(root){"use strict";
const I=root.CobaliteInstrument;
const recipes=[
 ["Still water","Keys",{engineA:"classic",engineB:"ensemble",shapeA:.15,charA:.06,shapeB:.18,charB:.45,balance:.35,cutoff:.52,attack:.12,release:.28,spread:.65},[],["parallax",.24,.2,.6,.18]],
 ["Paper piano","Keys",{engineA:"phase",engineB:"classic",shapeA:.17,charA:.21,shapeB:.02,balance:.28,attack:.01,decay:.3,sustain:.12,release:.25,cutoff:.67,filterEnv:.22},[["velocity","cutoff",.22]],["bloom",.24,.3,.55,.17]],
 ["Soft machinery","Keys",{engineA:"field",engineB:"ensemble",shapeA:.22,charA:.22,shapeB:.28,charB:.27,balance:.4,cutoff:.56,decay:.38,sustain:.45,interaction:.16,relation:.12},[["lfo","shapeA",.12],["lfo2","charB",.08]],["decay",.32,.35,.18,.2]],
 ["Low tide","Bass",{engineA:"classic",engineB:"classic",shapeA:.54,shapeB:.03,tuneB:.25,balance:.3,cutoff:.36,filterEnv:.38,attack:.01,decay:.22,sustain:.72,release:.09,resonance:.25,drive:.12,mode:"mono",glide:.1},[["velocity","filterEnv",.15]]],
 ["Rubber circuit","Bass",{engineA:"fold",engineB:"classic",shapeA:.4,charA:.3,shapeB:.1,tuneB:.25,balance:.42,cutoff:.48,attack:.015,decay:.28,sustain:.4,release:.1,interaction:.25,relation:.4,mode:"mono"},[["wheel","interaction",.4]]],
 ["Glass reed","Lead",{engineA:"phase",engineB:"field",shapeA:.29,charA:.33,shapeB:.3,charB:.15,balance:.3,cutoff:.66,attack:.04,release:.25,mode:"unison2",detune:.22},[["pressure","charA",.32],["wheel","cutoff",.25]],["refraction",.38,.32,.35,.2]],
 ["Warm current","Pad",{engineA:"ensemble",engineB:"field",shapeA:.34,charA:.55,shapeB:.16,charB:.28,balance:.4,cutoff:.48,attack:.45,release:.62,spread:.8,drift:.4},[["lfo","balance",.12],["lfo2","shapeB",.15]],["bloom",.53,.65,.5,.35]],
 ["Breathing cathedral","Pad",{engineA:"field",engineB:"ensemble",shapeA:.4,charA:.35,shapeB:.12,charB:.45,balance:.48,cutoff:.54,attack:.33,release:.7,spread:.65,rate2:.43},[["tail","rate2",-.7],["lfo2","balance",.32],["lfo3","cutoff",.18]],["bloom",.66,.76,.48,.42]],
 ["Porcelain rain","Texture",{engineA:"fold",engineB:"classic",shapeA:.3,charA:.27,shapeB:.02,balance:.5,interaction:.28,relation:.95,cutoff:.59,crush:.18,attack:.08,release:.4},[["transient","interaction",.26],["lfo2","crush",.18]],["decay",.42,.55,.55,.35]],
 ["Broken velvet","Texture",{engineA:"ensemble",engineB:"classic",shapeA:.46,charA:.35,shapeB:.18,balance:.4,cutoff:.44,crush:.55,hold:.16,drive:.08,attack:.16,release:.45},[["lfo","hold",.11],["brightness","interaction",-.2]],["patina",.25,.27,.15,.35]],
 ["Quiet orbit","Motion",{engineA:"field",engineB:"phase",shapeA:.2,charA:.3,shapeB:.13,charB:.18,balance:.4,interaction:.22,relation:.16,cutoff:.57,attack:.25,release:.5,rate:.27,rate2:.43,rate3:.2},[["lfo","rate2",.33],["lfo2","lshape3",.44],["lfo3","ldepth1",-.42],["lfo","balance",.18],["lfo2","relation",.24],["lfo3","cutoff",.16]],["parallax",.31,.42,.72,.35]],
 ["Afterthought","Motion",{engineA:"classic",engineB:"field",shapeA:.3,charA:.12,shapeB:.3,charB:.28,balance:.35,cutoff:.5,attack:.14,release:.36,rate2:.45,history:.55,drift:.38},[["tail","rate2",-.6],["lfo2","balance",.3],["memory","charB",.22],["energyIn","fx0C",.25]],["decay",.35,.64,.38,.4]]
];
function make(index){const r=recipes[index];if(!r)throw Error("Unknown preset");const p=I.init();Object.assign(p,r[2]);for(const [s,d,a] of r[3])I.setRoute(p,s,d,a);if(r[4]){const [type,a,b,c,mix]=r[4];p.fxTypes[0]=type;Object.assign(p,{fx0A:a,fx0B:b,fx0C:c,fx0Mix:mix,fxWet:.75});}return p;}
root.CobaliteBank08={names:recipes.map(([name,group])=>({name,group})),make};
})(globalThis);
