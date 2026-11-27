# Cobalite

An independent alternate-firmware project for the Modal Cobalt8M.

**A different instrument in the same enclosure.** Cobalite is intended to make the eight-voice digital synthesizer more immediate, musical and exploratory. It will reuse useful Cobalt infrastructure where practical, but its interface, sound engine, presets and performance behavior should develop their own identity.

**Status: pre-alpha research and desktop prototyping. No flashable firmware or hardware compatibility is established. Do not flash experimental images.**

## Design principles

- Play first. The panel should remain useful while notes are held or a sequence is running.
- A knob should have a stable, recognizable purpose. Avoid global latched Shift layers and nested menus for frequent actions.
- Make the signal path visible. Take inspiration from the Korg opsix operator mixer: direct interaction and clear relationships between sound sources, not an imitation of its FM engine.
- Modulation is part of playing, not matrix administration. Show connections, depth, polarity and source activity; never require a user to find a free slot manually.
- Make sweet spots broad. Clean, warm, rich and delicate sounds should be easy; metallic, broken and chaotic sounds should remain deliberate choices.
- Treat digital character as expressive material, particularly amplitude quantization and sample-rate reduction, without making it compulsory.
- Support experimentation with undo, temporary variations, morphing and reversible edits.
- Preserve physical legends and dedicated controls wherever that supports usability; document any unavoidable mismatch and consider a removable panel overlay.

## Proposed instrument

Two sound sources with consistent Shape and Character controls; selectable interaction (mix, phase/FM, ring, fold, etc.); a deliberately curated set of oscillator families; familiar envelopes and filters; a dedicated or readily accessible digital-degradation stage; stereo effects; playable modulation and sequencing.

The initial engine should explore a continuous classic waveform, an ensemble oscillator, a harmonically constrained FM/phase engine, and digital shaping. Additional engines earn a place by sounding and playing differently, not by increasing an algorithm count. Reuse stock DSP when it meets the goal. Original algorithms should be independently testable and replaceable.

## Interaction research

The existing Cobalt already supports hold-source-and-turn-destination routing; simply reproducing that would not solve its usability problems. Explore destination-first inspection, momentary source assignment, clearly visible connections and a modulation overview. Keep normal editing active immediately after releasing the assignment control. A local focus is acceptable; a hidden alternate instrument-wide mode is not.

Use the existing OLED and LEDs to indicate selected controls, actual parameter names, signed modulation depths and source activity. Do not assume a touchscreen, RGB LEDs or extra hardware.

## Roadmap

1. **Desktop instrument prototype:** a panel/event model, modulation interaction experiments, independent auditionable DSP, and a small set of reference sounds.
2. **Hardware research:** inventory Cobalt8M controls and revision; pin matching firmware versions and hashes; document panel/master/slave communication, preset layout, build and recovery constraints.
3. **Repeatable stock-derived build:** validate unpack/repack offline, compare outputs, and establish a version-gated patch backend. No bootloader changes.
4. **First alternate panel and engine:** prove safe routing and display hooks, then one original DSP algorithm with measured CPU, memory and audio behavior.
5. **Playable alpha:** cohesive panel mapping, modulation, selected oscillators and filters, degradation, gesture/morph tools, and sound-design trials.
6. **Hardware release candidate:** only after recovery and physical validation on the target revision.

## References and provenance

- [Modal Cobalt8M manual](https://www.manualslib.com/manual/3558870/Modal-Cobalt8m.html)
- [Korg opsix](https://www.korg.com/us/products/synthesizers/opsix/)
- [all8 / Iron reverse engineering](https://github.com/victorvillena/all8)
- [crossflash-8](https://github.com/cliffordmanasseh/crossflash-8)

Cobalite is unofficial and not affiliated with Modal or Korg. Do not commit vendor firmware, extracted proprietary binaries, presets or third-party code without verified redistribution rights. Keep original firmware inputs local; distribute original code and version-specific patch tooling where permitted. Verify upstream licenses before incorporating code. No project license is assumed until the owner selects one.

Design and engineering decisions remain provisional until validated by listening, panel interaction tests and hardware evidence.

## Earlier experiment: Living Circuits 0.4

[Design and quality gates](docs/LIVING_CIRCUITS.md) · [Audition instructions](prototype/README.md) · [Browser prototype](prototype/living.html). Three interconnected LFOs, travelling modulation, four-corner sound terrain and a continuous oscillator relationship field. Prior labs remain in the repo for comparison. No flashable firmware is available.

## Afterimage: effects research

[FX design](docs/AFTERIMAGE_FX.md) · [Stock capability audit](docs/COBALT_CAPABILITY_AUDIT.md) · [Audition lab](prototype/fx.html). Serve `prototype/` locally as before and open `/fx.html`. Five original experimental effects, three fixed serial slots and audio-derived modulation. Run `node prototype/fx-test.cjs` for headless DSP checks. Independent from Living Circuits while PR #1 is in progress; no flashable firmware or browser audition yet.

## Phrase Ecology: capture-first sequencing

[Phrase design](docs/PHRASE_ECOLOGY.md) · [Audition lab](prototype/phrase.html). Serve `prototype/` locally and open `/phrase.html`. Capture a performance, finish to loop, transform it without changing the original. MIDI keyboard input and a simple audition synth with optional Afterimage echo. Run `node prototype/phrase-test.cjs`. Separate from Living Circuits and device firmware.

## Voice Society / Chord Memory

[Design and allocator contract](docs/VOICE_SOCIETY.md) · [Audition lab](prototype/society.html). Serve `prototype/` locally and open `/society.html`. Eight persistent voice identities, mono/unison/stack/complement modes, captured chord voicings, inversion and arpeggiation. Run `node prototype/society-test.cjs`. Independent audition renderer; not integrated firmware.

## Earlier instrument: 0.7 unified build

[Audition the unified instrument](prototype/instrument.html) · [Consolidation review](docs/INSTRUMENT_07.md). Serve `prototype/` as before and open `/instrument.html`. One voice pool, patch, modulation registry, synthesis engine, phrase/chord transport and Afterimage rack. Try Living sound for a cross-modulating and audio-responsive starting patch. Run `node prototype/instrument-test.cjs`. Prior labs are retained for comparison. Headless checks passed at 44.1 and 48 kHz; browser audition, physical panel and firmware remain unverified.

## Earlier instrument study: 0.8 panel

[Panel audition](prototype/panel.html) · [Design and limitations](docs/PANEL_08.md). Serve `prototype/` locally and open `/panel.html`. Relative controls, two Roam journeys, Terrain joystick and twelve audition patches. `node prototype/panel-test.cjs` for regression checks. Hardware-shaped candidate, not an exact emulator or flashable firmware. 0.7 remains available.

## Current instrument study: 0.9 Performance & Motion

[Audition](prototype/performance-09.html) · [Performance design](docs/PERFORMANCE_09.md) · [Hardware milestone H0](docs/HARDWARE_H0.md). Serve `prototype/` locally, open `/performance-09.html`. Overdub/undo, smart/free loop capture, four motion lanes, Euclidean arp, third envelope, two additional voice-local LFO sources, tempo-relative modulation and routable journey speeds. Run `node prototype/performance-test-09.cjs`. Headless integration checks passed; actual browser audio, hardware and firmware remain unverified. Read-only stock SysEx inventory tool: `tools/firmware-audit.cjs`.
