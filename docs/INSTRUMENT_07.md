# Cobalite instrument 0.7 — consolidation review

## Decision
The experimental labs demonstrated interesting concepts but duplicated state, UI, oscillators, transport and voice allocation. Keep them as R&D references; develop the unified instrument as the primary audition target. Do not make further independent synth shells by default. The user wants one coherent, easily playable, adventurous instrument, not a desktop-sized parameter grid. PR #1 remains open and untouched; the unified renderer incorporates the corrected oscillator/sample-reduction approach from its head 89aa714.

## Unified slice
- instrument-core.js: versioned patch, stable parameter IDs, normalized ranges, source scope rules, a common signed route model and a small panel event model. Headroom shaping compresses summed modulation near boundaries rather than hard clipping; evaluate against musical expectations (large modulation depth no longer means exact full-range sweep). Local patch save/recall includes phrase, chord, FX, routes and ordered Roam path.
- instrument-worklet.js: one VoicePool from society-core, oscillator/relationship/filter DSP, independent amp and filter ADSRs, persistent voice traits, sample-clocked phrase and chord/arp playback, three global LFOs, Roam, Afterimage serial rack and audio-derived control signals. Raw live input is recorded; sequence playback does not re-expand chord memory. Routes can target LFO rate/shape/depth and FX controls; per-voice sources cannot directly target global parameters. Feedback uses previous block measurements; route removal/addition fades. Pitch bend is global ±2 semitones, no MPE. FX tails run during note release. Playback/transport and Roam running state are transient.
- instrument.html: stable primary sound controls, local Sound/Tone/Motion/FX/Play/Phrase views, one destination inspector, one capture grammar. LFO and FX views show one selected generator/slot. The browser is a focus-model experiment, NOT a physical Cobalt8M panel emulation. Direct absolute sliders and relative event-model delta() are distinct. No global shift.
- instrument-test.cjs: syntax, source-scope rejection, Roam capture without changing base, bounded headroom, real phrase-to-voice-to-FX-to-sensor-to-LFO loop, chord capture, recall and panic at 44.1/48 kHz.

## What to protect and what to refine
| System | Keep | Refine before declaring production-ready |
|---|---|---|
| Relationship | clean endpoints, interaction field | musical gain calibration, aliasing, true ensemble, source selection transitions |
| Living Circuits | 3 cross-modulating LFOs, one routing language | independent poly LFOs, tempo/audio-rate options, modulation-envelope source, efficient route evaluation |
| Roam | capture ordered destinations, smooth overlap, non-destructive base | freeze/resume, Trail/Confluence, timing and depth per visit, physical momentary hold |
| Terrain | four-corner coherent sound spaces | migrate into unified patch and route engine; no independent copy of DSP |
| Afterimage | fixed three-slot rack, sensors | retain conventional stock FX, improve reverbs/delays, shared memory pool, real-time measurements |
| Voice Society | eight persistent identities, chord/phrase share allocator | true legato, per-note MPE, better steal tails, persistent independent modulation |
| Phrase Ecology | capture-first, original immutable | smart close, overdub, phrase undo, gesture recording, clock sync, piano-roll feedback |
| Chord Memory | actual voicings, inversion, arp | chord latch, richer arp rhythm, avoid stealing held roots unexpectedly |
| Panel | stable controls, local focus, unified inspector | verify actual encoders and buttons; build physical event adapter, relative gestures, OLED-size rendering |
| Patch | schema, one local storage slot | banks, migrations, portable export, atomic recall, comparison and explicit undo semantics |

## Important limitations and next gate
This is a first integrated browser build, not a production release. Terrain is still only in living.html; modulation envelope, polyphonic/audio-rate LFOs, external clock, stock FX set and physical panel remain absent. Roam is simplified (no freeze in unified UI). The current implementation has block-level allocations and expensive per-sample modulation and oscillator math, and JS FX buffers exceed the documented master SDRAM budget. No real-time CPU or hardware validation. No browser audition. The UI has no full sequencer display yet; do not restore a dense step menu. Some sliders have base-only scope deliberately because their renderer path does not consume modulation. Discrete engine transitions and stolen-voice fades require audible checks. Unified tests do not prove no clipping across all settings or imply device feasibility.

Next: audition the unified instrument, improve the panel and preset experience, add Terrain and gesture capture to shared state, implement the actual hardware adapter and version-gated offline firmware backend. Continue creative exploration within these interfaces, not as another unrelated lab. Prioritize the feel of physical gestures and sound quality over feature count.
