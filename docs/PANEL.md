# Panel direction 0.2

Reference: [Cobalt8M quick start guide](https://cmi.com.au/Files/Files/Docs/MODAL/cobalt8M-QUICKSTART.pdf), page 1 diagram and page 2 shortcuts; [official product](https://modalelectronics.com/cobalt8m/). The mapping below is a candidate, not measured panel events. The actual module's hardware revision must be confirmed.

## Stable primary controls

| Stock physical group | Cobalite candidate |
|---|---|
| Tune1, Tune2 | Source A/B pitch; detents/quantized intervals as appropriate |
| Algorithm (shared selector) | Explicit local engine A/B selection, target indicated on OLED |
| A1, B1, A2, B2 | Shape and Character for each source; no global remapping |
| Mix | Source balance |
| Cutoff, Reso, Morph | Cutoff, resonance, filter character |
| Attack, Decay, Sustain, Release, Depth | Selected envelope and its amount; select AMP/FILT/MOD locally |
| LFO Rate, Depth | Selected LFO's rate and overall depth |
| FX Level, A, B, C | Selected FX amount and three effect parameters; one readily accessible degradation processor |
| Volume | Volume always |
| Drift, Width, Glide | Voice individuality, stereo width, glide |
| Joystick | Current performance assignment, visible on inspector |
| Page/Param, Preset/Edit | Focus/selection and editing, with dedicated preset context |
| Shift button | Candidate momentary Inspect modifier, never a global latch |
| Save, Patch/Seq, Init/Rand | Save, preset/sequence access, explicit protected init/variation |
| Mod sources | Direct momentary assignment, no latched routing state |
| Tempo/Length, Arp, Play/Record | Rhythm and sequence functions |

The exact grouping and press capability are to be cross-checked against a physical unit and firmware event trace. Some controls share encoders or secondary legends; the table is functional rather than a claim that all these functions have independent hardware. Preserve volume and cutoff even in local editing contexts.

## Candidate gesture

1. Turn Cutoff normally: cutoff changes and the OLED focuses it, showing base and active routes.
2. Press Inspect to pin the focused destination. The cutoff encoder continues editing cutoff.
3. Select LFO 1 using the existing source control; the OLED displays LFO1 → Cutoff.
4. Turn the screen Edit encoder to adjust bipolar depth live. Source selection never changes the base parameter.
5. Release Inspect or press Back: all primary knobs are still primary. No global shift remains.
6. Alternative for quick routing: hold a source and turn a destination, with immediate depth/polarity feedback. Stock firmware already has this gesture; the improvement is automatic exit, route visibility and a consistent destination inspector.

The display should show base and modulation as distinct quantities. When the screen is pinned, unrelated edits must not silently redirect the route; explicit source/destination selection is required. A zero depth removes the route; undo restores it. Avoid using destructive actions on accidental short presses.

## Local pages vs modes

Local pages are allowed when controls are genuinely shared (envelopes, LFOs, FX, engine selection). Each page changes only the relevant control group, shows the selected entity, and never repurposes unrelated controls. A fixed physical panel cannot expose every parameter simultaneously; prioritize direct musical controls rather than attempting to eliminate all context.

## Next prototype

Implement an event-driven panel model with relative encoder deltas, press/release, focus, inspect, source selection and explicit local contexts. Measure gesture counts for assignment, depth edits and route removal. Make sure pressing a control does not accidentally change a patch or enter a hidden mode. Then bind the model to a virtual physical panel and finally to hardware event IDs once reverse engineering confirms them.
