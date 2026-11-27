# Cobalite / Living Circuits 0.4

The goal is not a feature-rich version of the Cobalt. The goal is a new playable instrument in that enclosure. Existing prototypes remain untouched for comparison.

## Musical identity

**Relationships, not algorithms.** Two sounds have stable identities, but the balance between them is a region of synthesis. Three modulators behave like a network, not a list. Time can be composed through the panel as a physical gesture. Experiments should lead to sounds worth playing, not just impressive complexity.

### Relationship field — implemented
Balance A/B remains a reliable clean crossfade. The interaction contribution is amount * 4*b*(1-b), giving exact unmodified endpoints. A separate continuous relationship coordinate moves among phase modulation, ring multiplication, folding and 8-bit XOR. The processed signal blends with the clean mix. A DC blocker follows nonlinear processing; digital and filter stages remain independent. Moderate interactions intentionally remain useful for chords. This is a prototype transfer function, not a final loudness-matched engine. The XOR path is deliberately discontinuous; band-limiting and oversampling remain important.

### Living Circuits — implemented
Three free-running generators with continuous shape morph (sine, triangle, rounded pulse, smooth seeded random). Each spans 0.005–16 Hz nominal, has an independent depth, and can modulate another generator's rate, shape or depth. Six directed edges, one target per edge; signed amounts. Feedback is computed from the previous block, with bounded rate/shape/depth and smoothed outputs. Any of the three outputs can also route to the sound controls. Global Motion scales sound-route depths without removing them; it does not disconnect internal edges. Wander updates a random target at phase wrap and smoothly interpolates to it, so it does not simply loop a fixed waveform. Real recent-output plots and effective rate readouts help understand the network.

### Roam — implemented
Ordered momentary destination capture, overlap, stop, freeze and 10–600 second journeys. Relationship and filter colour are now eligible destinations. The path is transient rather than saved as part of the patch. Network links and Roam coexist; Roam remains independent of the ordinary Motion amount.

### Terrain — implemented
Capture four related patch states, then navigate a continuous 2D landscape with a pointer or X/Y controls. Bilinear interpolation of continuous values and signed route/link amounts, treating missing routes as zero. Corners must use matching oscillator engines and compatible link target types. NW is required; unfilled corners use NW. Enter saves a pre-journey patch; Return restores it; Keep retains the result. Manual edits are allowed; a subsequent pad move reconstructs the interpolated patch. Anchors and Roam transport are not persistent. Hardware joystick mapping is proposed, not implemented.

### Sound and playing — implemented
Five engines: classic, ensemble, phase/FM, harmonic field (two spectral concentrations), and soft fold. Improved classic saw/pulse edges via basic polyBLEP; this does not make nonlinear paths alias-free. Independent source tuning and ensemble phases, mild per-voice individuality, stereo, low/band/high filter morph, amp ADSR with envelope-to-tone, independent bit reduction/sample reduction/drive, Bloom macro, local patch storage, A/B compare, undo, MIDI notes/velocity/sustain/wheel/channel pressure. Wheel/pressure are global modulation sources, not MPE. Nine starter patches are hypotheses to audition, not a professionally calibrated sound bank.

## Next radical experiments (not implemented)

- **Tidal tempo**: a modulation network can breathe around an underlying pulse; rate variation happens inside an explicitly synchronized phrase rather than breaking musical timing.
- **Phrase ecology**: capture held notes into a motif, choose density, interval preference, contour and variation. Let generated phrases influence modulation or derive motion from note timing. Preserve harmony, rhythmic anchors and reversible return.
- **Voice society**: each voice has persistent personality and slow internal state; optional chord-dependent common motion with bounded divergence, not arbitrary detune. Voice allocation policies should be auditioned.
- **Response curves**: use envelope curvature, note repetition, key position and pressure as musically meaningful responses; support consistent gestural control without deep pages.
- **Damage field**: explore ordered digital processing, partial bit manipulation, asymmetry and pre/post placement. Calibrate the clean end and use matched gain.
- **Roam trail/confluence**: overlapping journeys with fading influence, bounded budgets, directed capture, independent rates and one-shot returns.
- **Physical interaction**: actual encoder relative-delta events, a contextual display and local select gestures. No global alternate mode. Prototype using physical constraints; no assumption that every browser control has its own encoder.

## Quality bar and acceptance gates

- Clean endpoints, no surprise volume spikes, silence with no notes, consistent pitch and usable low/middle/high registers.
- Sustain a chord, change a connection while playing, traverse Terrain, remove motion, and return to the original patch with minimal gestures.
- Sound checks: long sustained chords, sparse keys, bass, bright leads, subtle damage, two-handed MIDI playing. Listen for clicks, aliasing, DC, excessive loudness changes, sluggish controls and voice-steal artifacts.
- DSP tests cover finite/bounded output for all nine patches at 44.1/48 kHz, exact relationship endpoint invariance, full feedback graph bounds over 20,000 control blocks, random-state evolution, stereo, wheel/pressure smoothing, Roam traversal/freeze/return and voice handling, pre-limiter headroom (no starter patch reaches the output tanh), retriggered notes releasing rather than cutting, and sample reduction staying clean near zero. These tests are headless, not measurements on a physical synth.
- Browser usability, audio underruns, audible transitions, MIDI hardware, Terrain gestures, persistent save, and CPU/memory remain to be validated. The JS implementation currently prioritizes rapid iteration over allocation-free DSP. Harmonic-field cost and the nonlinear/logic stages require optimization and anti-aliasing before embedded use.
- Build the firmware backend separately using pinned input hashes and verified recovery procedures. This prototype does not create any device image. Upstream proprietary files remain outside Git.

## Audition
Serve prototype/ locally and open living.html. Enable audio at low volume, try Tidal field, connect MIDI if available, explore balance at high interaction, then vary LFO link types and amounts. Capture NW and other Terrain corners after modifying the same patch. Run a Roam example while exploring the network. Return restores the pre-Terrain patch, and Roam Stop independently clears the journey. Try quieter settings and extreme settings, then compare to the old lab.

Run node prototype/living-test.cjs from the repository root. Browser interaction is still untested. No production-ready or flashable firmware is claimed.
