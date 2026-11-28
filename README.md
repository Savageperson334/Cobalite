# Cobalite

An independent alternate-firmware project for the Modal Cobalt8M.

**A different instrument in the same enclosure.** Cobalite is intended to make the eight-voice digital synthesizer more immediate, musical and exploratory. It will reuse useful Cobalt infrastructure where practical, but its interface, sound engine, presets and performance behavior should develop their own identity.

**Status: pre-alpha research and desktop prototyping. No flashable firmware or hardware compatibility is established. Do not flash experimental images.**

## Try it

    npm run serve    # or: python3 -m http.server 8000 --directory prototype
    npm test         # every headless test suite (Node 18+)

Open http://localhost:8000, turn the volume down and pick a build. The latest panel study is **[Front Panel H1](prototype/front-panel.html)** ([notes](docs/FRONT_PANEL_H1.md)), using Performance & Motion 0.9 audio. Everything runs in the browser. MIDI keyboards and clock can play it, but nothing here sends data or firmware to a Cobalt.

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

## Project map

- **[prototype/](prototype/README.md)**: the browser builds. H1 is the current panel mock using 0.9 DSP; 0.8 and 0.7 are earlier builds; Afterimage FX, Phrase Ecology and Voice Society are component labs; 0.1–0.4 are in [prototype/archive/](prototype/archive/README.md).
- **[docs/](docs/README.md)**: design notes, per-build notes and hardware research, with an index.
- **[firmware/panel/](firmware/panel/)**: portable C99 input event queue and host test, not a target build.
- **[tools/](tools/)**: `firmware-audit.cjs`, a read-only checker for your own stock Cobalt update files (`npm run audit -- panel.syx master.syx slave.syx`). It never sends MIDI or writes firmware. See [Hardware milestone H0](docs/HARDWARE_H0.md). `run-tests.cjs` runs every test suite.

All tests are headless checks of DSP and event logic. Browser audio, listening quality, the physical panel and the hardware remain unverified.
