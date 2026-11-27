# Cobalite — instrument design 0.1

This is a working design, not a fixed specification. The target is the Cobalt8M. The instrument must be rewarding before the user knows its architecture.

## 1. What should distinguish it

The opsix reference is about interaction: its mixer makes the consequences of changing an operator immediate, and its screen provides context for deeper edits. Cobalite should have an equally direct center of gravity without becoming a six-operator FM clone.

Start from a playable initialized sound. The user should be able to move from a soft sine-like sound to a rich chord, evolving pad or deliberately damaged lead without navigating to another page. A patch is not a collection of unrelated options: it is a coherent relationship between the sources, tone, motion and performance controls.

## 2. Control model candidates

The final assignments must follow a verified physical control/event inventory and respect panel legends. No physical control availability is assumed here.

| Function | Default behavior | Optional local action |
|---|---|---|
| Oscillator A/B | Shape and character stay direct | Engine selection at its own control |
| Oscillator balance | Mix continuously | Interaction type and depth at explicit local focus |
| Filter | Cutoff and resonance always edit base tone | Filter family selection |
| Envelope | Attack/decay/sustain/release | Select one envelope visibly; no hidden global Shift |
| LFO | Rate and shape | Select source for routing, see existing destinations |
| Degradation | Clean through broken, with zero bypass | Type / placement |
| Joystick | Expressive two-dimensional movement | Record or capture morph endpoints |
| Effects | Direct wetness and musical parameters | Local effect selection |
| Patch | Browse and recall | Save, revert, compare |

Keep primary sound controls stable even while the screen displays a different parameter. Where a secondary action is essential, prefer a short momentary chord or a local edit page with an explicit exit. Avoid combinations requiring the user to remember what global state the instrument is in. Encoder press-to-inspect versus press-to-reset must be tested; destructive reset should not be the default press.

## 3. Modulation: destination as a living object

A modulation route is (source, destination, signed depth). Route storage slots are internal, not a user-facing workflow.

Prototype three interactions:

A. **Destination-first:** touch/turn a parameter, then inspect its active sources, select a source, edit its signed depth, and return immediately. A source already assigned is edited rather than duplicated.
B. **Source-first:** temporarily hold or select a source, turn destination to set depth; release returns to normal editing. This resembles the existing Cobalt shortcut and should only remain if the new feedback makes it worthwhile.
C. **Quick motion:** one dedicated amount controls a curated musical modulation route in the current patch; the detailed assignment interface is optional.

A zero depth disables the route; remove and restore are explicit. Existing connections should never be overwritten silently when capacity is full. Keep base value and modulation separate; clamp or wrap according to destination semantics. Use perceptual scaling (e.g. log-frequency for cutoff). An assignment must not jump the base value. Display source, destination, polarity and depth; test compact OLED layouts against actual screen dimensions. Any assignment timeout must not destroy edits.

Default patch can include velocity-to-amplitude and an LFO with zero depth. Sound design should not require filling a matrix.

## 4. Engine proposal

Keep two sources initially. Each source offers stable Shape and Character semantics; tuning and relative level remain predictable. Algorithms may implement them differently but should expose the same perceptual intent.

| Family | Shape | Character | Purpose |
|---|---|---|---|
| Classic | Continuous sine/triangle/saw/pulse | Richness / symmetry | Familiar and warm |
| Ensemble | Continuous waveform | Spread / drift | Organic chords and pads |
| Phase | Harmonic shape | Phase distortion | Bright expressive tones |
| FM | Harmonic ratio | Modulation amount | Tonal FM first; metallic extremes intentionally reachable |
| Fold | Waveform symmetry | Folding depth | Nonlinear timbres |
| Harmonic | Harmonic distribution | Spectral tilt/complexity | Rich pitched sounds |
| Digital | Waveform | Quantization/hold texture | Broken but controllable |

This list is exploratory, not a commitment to implement every family. Try classic, phase/FM and digital shaping first. Avoid engine switching as the principal way to change timbre. A large continuous sweet spot matters more than the number of algorithms.

Interaction between A/B: start with mix and phase modulation; investigate ring, sync and folding later. A physical mix control should not unexpectedly turn into a routing selector. Match loudness between modes as far as practical; test chords, low notes and upper register for aliasing, noise and clipping. Ensure effects and nonlinear processors have calibrated gain and bypass.

## 5. Digital character

Separate bit depth and sample-rate reduction internally. A single Character/Crush gesture may map a musical curve across both; direct separate editing remains possible locally. Allow clean bypass, gentle grain and severe destruction. Compare per-oscillator, post-mix/pre-filter and post-filter placement before selecting a default. The filter can turn harsh quantization harmonics into attractive textures. Avoid duplicating degradation across unrelated screens.

## 6. Performance

The first performance additions should be reversible: patch compare/revert, temporary variations, stable joystick assignments, a global motion amount, and later gesture recording. Consider voice variation and chord-responsive behavior only after core editing feels good. Generative sequencing can follow; it should remain optional rather than the center of the instrument.

## 7. Audition and interaction test

Use the same short MIDI performances and volume-matched renders for each prototype:
- Init to warm playable chord with no menu.
- Add, adjust and remove modulation on cutoff while holding a chord.
- Reach a metallic FM sound deliberately, then return to a clean sound.
- Introduce and bypass digital degradation without losing the patch.
- Change one oscillator without confusing the other.
- Undo an accidental edit.
- Switch patch and confirm no unexpected lingering assignments or loud transients.

Record number of actions, wrong-mode errors, time to sound, audio peaks, CPU/memory and subjective musical usefulness. Hardware mapping, control resolution and firmware patchability remain open.
