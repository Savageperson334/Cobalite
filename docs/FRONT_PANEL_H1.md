# H1 — Cobalt8M front panel and native input boundary

## Try it
From the repo root run `python -m http.server 8000 --directory prototype`, then visit http://localhost:8000/front-panel.html. Power on audio at low volume. H1 reuses the current Performance & Motion 0.9 audio worklet; no new synthesis renderer. The earlier pages remain available.

## Panel mock
The manufacturer's [Cobalt8M quick start guide](https://cmi.com.au/Files/Files/Docs/MODAL/cobalt8M-QUICKSTART.pdf), first-page drawing, informed aligned physical columns, the central display and three rows. The published inventory is 26 encoders (13 switched), nine buttons and a joystick. Individual switched positions are candidate assignments inherited from 0.8 and still require verification. The visual geometry, four lines of 21 characters, and LED states are approximations, not measured coordinates, a pixel-exact OLED driver or electrical simulation. The stock legends toggle retains physical identities; alternate labels describe Cobalite semantics. Endless encoders operate on relative detents; position indicators are only an overlay. A dot on switched knobs is a browser input affordance, not another physical switch. Mouse hold assist is optional and strictly host-side; it cancels on blur or when disabled. The external keyboard and diagnostic panel are not part of the physical panel.

### Operating the mock
- Drag/scroll a knob, click a switched knob to press it, or hold the small switch marker. Arrow keys turn a focused knob; Enter/Space press a switched one.
- Boot into Patches. Edit selects factory sounds; press Edit to load. Push Page to toggle page/parameter navigation. Turn Page to move among pages or parameters. Edit turns change values; press Edit to execute an action.
- Save opens the user bank when elsewhere. Choose one of 16 slots with Edit, then Save. A later Edit press loads that slot. Slots store patch, Terrain corners and Roam paths locally, not hardware flash. Hold Init at least 800 ms to initialize.
- A1/A2 control source A shape/character; B1/B2 control source B shape/character. Algorithm push selects source, turn selects oscillator. Hold Patch and turn A1/A2 to tune sources. Mix, cutoff, resonance, FX level, ADSR, volume keep their roles.
- Rate push selects LFO; hold Rate and turn a destination to change signed modulation depth, without base edits. Velo, AftT and Sustain are also source switches. Utility page has other sources. FX A/B/C pushes select slots; Edit in FX type changes algorithm, A/B/C turns edit its parameters. Attack/Decay/Sustain presses select filter/amp/mod envelope focus.
- Hold Shift, turn destinations in sequence, release to launch Roam. Tap Shift to stop the chosen journey. Roam page selects paths, duration/depth/trail, freeze/stop/start. Expr enters Terrain; Page/Edit captures anchors and enters/returns/keeps interpolation; joystick moves it. This mock does not add spring-return or normal joystick pitchbend outside Terrain.
- Tempo push arms/finishes capture if no existing phrase, otherwise toggles playback. Hold Tempo for at least 650 ms to stop. Hold Patch + press Tempo to capture a new phrase. Phrase page exposes overdub, undo and motion capture. Note captures chord; Arp cycles chord/arp mode.
- R/P/1 keyboard shortcuts mirror held Shift/Patch/Rate. MIDI input supports notes, sustain, wheel, pressure, pitch bend and optional tempo follow, not true external phase lock.

## Architecture
`front-controller.js` is a DOM-independent candidate panel controller with injected output/storage services. It consumes logical events (down/up/turn/xy/cancel with timestamp), owns navigation and gesture state, outputs patch updates and commands, and accepts DSP feedback. The browser adapter in `front-panel.js` owns pointer and MIDI input, view drawing and AudioWorklet transport. Updates are coalesced between frames except commands, which flush pending state first. The OLED is a bounded text view of the controller. The audio worklet remains the existing 0.9 implementation. The controller still uses JS objects, full patch messages and dynamic allocation; it is not the embedded runtime.

`firmware/panel/panel_input.h/.c` is the first native, platform-independent C99 input layer. It exposes logical IDs in panel order, debounces switch levels (12 ms), accepts already decoded relative detents, clamps 12-bit normalized joystick readings and queues up to 64 events in fixed storage. Overflow discards the queue and produces a cancel event so the consumer can release any held gesture state. This is a single-thread/cooperatively scheduled component, not an ISR-safe concurrent queue. Native timestamps are uint32_t monotonic milliseconds; a future host bridge must unwrap them across rollover for the JS controller. Native IDs and event structs are not Modal protocol IDs or a wire format. There is no GPIO assignment, actual scan driver, display driver or MCU build. The browser controller and C input layer share an intended contract but do not currently communicate.

## Validation
`npm test` includes front-panel-test.cjs, checking control counts, non-destructive hold gestures, cancel, navigation, selected FX mix, capture/stop, preset bank, OLED bounds, native ID order and long-hold initialization. Native host test:
```sh
cc -std=c99 -Wall -Wextra -Werror -pedantic firmware/panel/panel_input.c firmware/panel/panel_input_test.c -o panel-input-test
./panel-input-test
```
The native test was compiled and run on a desktop host, not an ARM target. Browser DOM interaction and audible behaviour remain untested. The full npm suite was not rerun here.

## Next hardware gate
Obtain original official Cobalt update files locally, run the H0 audit, confirm exact unit/revision and recovery. Then map actual scan events and switch IDs, display controller/resolution, panel/master link traffic, and the stock application dispatch. Keep the real transport and hardware-specific code separate from the logical event layer. Port controller state to bounded C structures, define compact incremental commands and patch storage, test on host with identical gesture traces, then compile against the verified target. First target milestone should be one harmless, version-gated panel change, not replacing the whole DSP. No flashable image yet.
