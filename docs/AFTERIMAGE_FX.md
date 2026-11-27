# Afterimage — Cobalite effects and listening circuits

Status: independent research prototype, not integrated into Living Circuits or hardware. Developed on main without modifying the files in PR #1.

## Instrument direction
Three stereo slots in a fixed serial chain, reorder later only if needed; no modular routing graph or arbitrary inter-effect feedback. Each algorithm owns any internal feedback. Preserve global FX Level and a reliable dry sound. Keep excellent stock conventional effects where licensing, version-gated patching and resource budgets permit. New algorithms should deliver musical variation rather than replace every useful stock processor.

## Effect families
| Name | A | B | C | Musical arc / status |
|---|---|---|---|---|
| Decay | Time | Repeats | Erosion | Clean first echo through darkening/quantization of successive repeats; prototype |
| Refraction | Time | Repeats | Skew | Stereo timing divergence and crossfeed, from conventional echo to rhythmic interplay; prototype |
| Patina | Age | Grain | Instability | Bandwidth loss, fractional sample reduction, quantization and clock variation; prototype |
| Parallax | Rate | Depth | Spread | Stereo chorus-like movement with decorrelated taps; prototype |
| Bloom | Size | Persistence | Colour | Compact four-tap diffuse echo network; prototype, not a production reverb |
| Resonance | Tuning | Decay | Material | Harmonically constrained resonator bank, optional note/chord tracking; proposed |
| Erosion | Band | Damage | Bias | Selectively degrade part of the spectrum while retaining a clean foundation; proposed |
| Dissolve | Time | Diffusion | Memory | Delay to spacious reverberation, ideally smooth transformation with bounded tails; proposed |
| Elastic | Time | Stretch | Drift | Tape-like time bending vs pitch-preserving dual-tap crossfade as an explicit choice; proposed |
| Mirror | Width | Rotation | Colour | Stereo mid/side transformations with mono compatibility; proposed |
| Orbit | Rate | Radius | Shape | Spatial movement using modulation trajectories, with a mono-safe mode; proposed |
| Fracture | Resolution | Pattern | Bias | Bit-plane manipulations with gain matching and zero clean endpoint; proposed |

Stock chorus, reverb, delay, phaser, flanger, tremolo, rotary, EQ, compressor, utility and drive should be retained or replaced by comparable quality, not abandoned merely because the new algorithms are novel. Actual stock catalog and cost restrictions need a version-specific inventory. Each effect should specify real units and useful taper. All types have independent mix internally; on physical panel use global FX Level plus local Edit for slot mix, subject to verification.

## UI: focus, not layers
Always show three slots, selected type, local A/B/C names and values, global FX wet. Selecting FX2 does not repurpose oscillator/filter encoders. Turn A/B/C normally; short source+turn gesture or destination inspector creates modulation. Hold Roam and touch an FX parameter to record its identity. The physical gestures must be grounded in the real panel event model. No global Shift toggle. In the audition lab the effect type dropdown, three direct sliders, local mix and global wet are explicit; the listening circuit is a single optional compact route. Bypass one slot without changing other slots; stop/clear tails is separately named and deliberate. A type change fades to dry then clears old state before switching; preserving old tails across changes is a later feature, not implemented.

## Listening circuits
Expose continuous [0,1] sources at control rate:
- Energy: smoothed dry input magnitude.
- Brightness: high-frequency proxy relative to input magnitude (not FFT spectral centroid).
- Transient: difference of fast/slow magnitude followers.
- Width: smoothed wet-chain side magnitude (not a normalized correlation coefficient).
- Tail: summed weighted wet output of echo-based slots, not pure isolated feedback energy.

Prototype one pinned sensor -> LFO rate -> FX A/B/C route. Rate is base * 2^(4*amount*sensor), limited 0.005–8 Hz; output depth limited to 0.5 normalized units, smoothed before being added to one FX parameter. The previous block's measurements are used, avoiding an instantaneous recursive feedback loop. These sensors are not random sources; playing and silence influence them.

Production integration should use the existing destination inspector and typed parameter registry for all LFO properties, FX parameters, Roam and Terrain. Route examples:
- Tail negatively modulates LFO2 rate; LFO2 modulates oscillator balance: as the space fills, the tone slows its movement.
- Transient positively modulates Erosion amount, with attack/release, so soft playing stays clean.
- Dry brightness reduces delay Colour or repeats to avoid harsh tails.
- Note density opens Bloom persistence; use MIDI note count, not audio magnitude, for this separate source.
- Width negatively modulates Orbit radius to self-regulate exaggerated stereo.
- LFO3 changes a delay's timing/colour, tail feedback changes LFO1 depth; routes are bounded and delayed.

Prevent sensor feedback from flattening useful movements. Per-destination normalized ranges, gentle headroom compression, source-specific smoothing, DC blocking, calibrated input gain, silence behavior, wet/dry level and pre-limiter meters. A sensor can be pinned to dry, slot wet or output only if the specific measurement is meaningful; expose no arbitrary audio graph. Keep source processing deterministic for identical input and patch. Route modulation at control rate; smooth delay time carefully to avoid pitch artifacts unless intended.

## Integration and hardware
All8 Carbon-based notes describe master-only FX and external SDRAM, but the stock Cobalt master FX dispatch, buffer use, processor budget, patch IDs and input routing need version-specific verification. See https://github.com/victorvillena/all8/blob/main/notes/multi.md and notes/platform.md. The JS core uses three preallocated stereo 2.1-second delay buffers (roughly 2.42 MB at 48 kHz), which is more than the 2 MB external SDRAM reported on the master before other allocations. Do NOT port these buffers literally. Use shared scratch pools, variable effect memory requirements, measured fixed-point or float choices, and preserve stock effects when practical. Do not change bootloader. Never infer target compatibility from browser execution.

## Testing
node prototype/fx-test.cjs: exact bypass, finite and nonzero effect output, positive tail and stereo measurements where applicable, sensor bounds, reset, max-feedback stress at 44.1 and 48 kHz. No browser audition, no real-time CPU benchmark, no long-run decay proof or measured loudness matching. The test source is independent, not the Living Circuits engine. Browser lab is fx.html. Low initial volume recommended. Future tests: DC and silence decay over long runs; impulse responses and spectral plots; clicks on type changes, delay sweeps, and route changes; input peak and per-slot internal peaks; stereo compatibility and time budget; real integration with Claude's bug fixes after merge.
