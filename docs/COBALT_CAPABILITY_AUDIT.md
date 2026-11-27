# Stock Cobalt8M capability audit / Cobalite opportunities

Baseline: Modal official product page https://modalelectronics.com/cobalt8m/ (firmware 2.1 listed), current Cobalite main b64ab70 plus open PR #1 at 89aa714 before the FX research commits. Stock capabilities are documented, not verified on the user's hardware revision. Afterimage adds independent FX R&D, not integration.

| Stock system | Cobalite state | Proposed direction | Priority |
|---|---|---|---|
| Eight voices; mono/poly/unison 2/4/8; stack 2/4 | Eight poly voices only; rudimentary individuality | Voice Society: explicit poly/mono/unison/stack, voice identity, detune + timbre spread, optional chord-response; preserve voice budget | P0 |
| Glide/portamento, legato/staccato | Missing | Glide with exponential/linear response; stable pitch paths and note priority | P0 |
| Three independent envelopes (AMP/FILTER/MOD), curves and inverted versions | AMP ADSR reused as tone source | Three independent envelopes, signed depths, curvature, looping/mod retrigger options; local envelope select | P0 |
| Three audio-rate LFOs (two poly, one global), tempo sync | Three shared low-rate LFOs, cross-links | Scope per voice/global, phase/reset, tempo sync; separate audio-rate modulation from feedback network; bounded headroom | P0 |
| Eight assignable plus four fixed modulation routes | Flexible global and velocity/env routes, limited destinations | Parameter registry, source scope, smooth route changes, link multiple properties, base vs effective value; fixed performance routes | P0 |
| 40 oscillator algorithms / up to 8 oscillators per voice | Five experimental oscillator families | Add PWM, sync, sub, noise/excitation and a real ensemble; preserve clean classic sounds, tune range/gain rather than chase algorithm count | P1 |
| 31 filter types, ladder/SVF, tracking and drive | Morphing SVF, no stock ladder or tracking | Curated ladder, notch, peaking and formant families; key tracking, drive, flexible cutoff scaling | P1 |
| Three slots / 26 FX; independent FX presets | Afterimage isolated five-effect core | Keep stock useful algorithms, add listening circuits and experimental FX, patch/FX preset recall | P0 |
| Poly real-time sequencer (512 notes) + four animation lanes | Missing | Phrase Ecology: capture and overdub performances, independent parameter motion; retain faithful playback and undo before variation | P1 |
| 64-step poly sequencer, 8 notes/step, 4 parameter locks, gate/rest modes | Missing | One phrase model with event and step views; parameter locks coexist with Roam and terrain; no forced generative behavior | P1 |
| 32-step programmable arp, directions/rests | Missing | Arp as playable note transformation: rotate, density, direction, variation; latch/freeze/restore; clock sync | P1 |
| Chord hold, invert, transpose, sustain latch | Sustain only in Living Circuits | Chord memory with explicit inversion/voicing and harmony-preserving transformations; hold/toggle obvious | P1 |
| Joystick four axes, virtual lock | Browser XY Terrain | Physical joystick spring/lock, independent axes, choose Terrain vs normal modulation locally; smoothing and recenter | P0 |
| 500 patch slots, 100 sequence and 100 FX presets, 8 quick recall | One local browser slot, temporary snapshots | Versioned patch/phrase/FX banks; quick recall, compare, export/import; include Roam and Terrain opt-in; preserve original stock data | P0 |
| MPE, pitch bend, expression, sustain, DIN and USB MIDI | Notes/velocity/sustain/wheel/channel pressure only; PR #1 not pitch bend | Bend ranges, channel routing, per-note MPE expression, expression pedal, MIDI clock and transport, CC/NRPN | P0 |
| Analog sync in/out, internal/external clock | Missing | Shared clock service, subdivision, tempo-aware LFO/FX/arp, MIDI and analog sync; never let random timing destabilize external clock | P0 |
| Stereo audio input | No use in lab | Determine actual routing/ADC and stock role; optional processing and audio-derived modulation from external input if routable | P1 research |
| Patch gain, master level, metronome, audio/MIDI settings | Partial output gain, no settings persistence | Separate patch gain, global volume, metronome, gain staging and safe output, setup/reset | P0 |
| Polychain 16 voices across two Cobalts | Missing | Preserve if feasible; defer until stable single unit, avoid bespoke protocol until mapped | P2 |
| MODALapp editor and firmware update | Independent browser labs | Standalone desktop editor, export/import, physical panel parity, version-gated offline patch and safe recovery; avoid relying on stock app for custom patch IDs | P0 |

## Design synthesis
P0 is not a request to stop creative R&D. It means core dependencies for an actual instrument. Focus physical UI on one consistent grammar: turn changes base, press inspects, source hold plus destination turn assigns, Roam hold captures. Shared encoders may use local focus (LFO, envelope, FX, phrase); no instrument-wide hidden mode. The physical event model needs verification, including press availability and OLED dimensions. Browser lab can remain a superset for exploration.

The biggest overlooked creative opportunity is the stock animation system: Roam moves a modulation destination, while recorded automation stores gestures and parameter locks record absolute step values. Keep these distinct and combine them with explicit precedence and non-destructive playback. A phrase can modulate sound and motion; audio-derived sensors respond to the result. Clocked modulation should preserve musical anchors while allowing controlled variation. Voice allocation and note expression must be coherent before polyphonic modulation is expanded.

## Suggested sequencing
1. Merge/review PR #1 separately. Modularize patch state, panel events, modulation registry, voice allocation and clock service.
2. Bring Afterimage into the master-side conceptual signal chain; no direct merge of old monolithic prototype until integration design agreed.
3. Restore independent envelopes, LFO scope, voice modes and basic clocking; add real panel model.
4. Implement faithful phrase playback and animation capture, then creative variation, arpeggiation and chord memory.
5. Patch storage/editor/MIDI and hardware version-specific feasibility work in parallel. Preserve recovery, license boundaries and stock data.
