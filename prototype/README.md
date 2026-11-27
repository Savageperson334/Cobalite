# Cobalite prototypes

Browser sketches for comparing sound and interaction ideas. They are not emulators and not firmware. Do not flash anything from this directory.

## Run

From the repository root (Python 3):

    npm run serve        # same as: python3 -m http.server 8000 --directory prototype

Open http://localhost:8000 for the list of builds. AudioWorklet needs localhost or HTTPS. Turn the volume down, then click Enable audio. No external libraries or network services are used.

Run every headless test with `npm test` (Node 18 or later). These check the DSP and event logic only; they don't replace listening, browser testing or hardware validation.

## What's here

| Page | Status | Notes | Test |
|---|---|---|---|
| [performance-09.html](performance-09.html) | **Current build** | [PERFORMANCE_09](../docs/PERFORMANCE_09.md) | `performance-test-09.cjs` |
| [panel.html](panel.html) | Earlier build 0.8 | [PANEL_08](../docs/PANEL_08.md) | `panel-test.cjs` |
| [instrument.html](instrument.html) | Earlier build 0.7 | [INSTRUMENT_07](../docs/INSTRUMENT_07.md) | `instrument-test.cjs` |
| [fx.html](fx.html) | Component lab | [AFTERIMAGE_FX](../docs/AFTERIMAGE_FX.md) | `fx-test.cjs` |
| [phrase.html](phrase.html) | Component lab | [PHRASE_ECOLOGY](../docs/PHRASE_ECOLOGY.md) | `phrase-test.cjs` |
| [society.html](society.html) | Component lab | [VOICE_SOCIETY](../docs/VOICE_SOCIETY.md) | `society-test.cjs` |
| [archive/](archive/README.md) | Early labs 0.1–0.4 | [archive/README](archive/README.md) | `archive/*-test.cjs` |

## Shared modules

The builds and component labs share these files, so they stay together in this folder:

- `fx-core.js`: Afterimage effects.
- `phrase-core.js`: phrase capture and transformation.
- `society-core.js`: voice allocator and chord memory.
- `instrument-core.js`: stable parameter IDs and the shared parameter registry.
- `panel-core.js`, `panel-bank.js`: virtual panel events and the audition bank.
- `roam-08.js`: dual Roam journeys.
- `performance-09.js`: 0.9 capture, motion lanes, clock and voice modulation.
- `panel-adapter-09.js`: maps 0.9 features onto the physical-panel gestures.
- `*-worklet.js`: the AudioWorklet processor (synthesis and voices) for each page.

The archived labs are single files with everything inline.
