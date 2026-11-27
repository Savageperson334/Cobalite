# Phrase Ecology — capture-first performance sequencer

This is a deliberate departure from the stock Cobalt sequencer. The user found that workflow unusable. Do not reproduce its step-entry menu structure merely for feature parity.

## Prototype implemented

- Capture arms without a countdown. First incoming note starts the phrase. Play freely, press Finish & loop to close the recording and audition immediately. The capture currently rounds upward to a four-beat bar and is capped at 32 bars/512 notes.
- Captures preserve note onset, duration, velocity and polyphony. MIDI sustain extends recorded gates. Original note events remain immutable under transformations; previous capture can be restored. Empty captures do not replace the previous phrase.
- Playback uses the audio sample clock, tempo in beats, explicit note-on/off events, and schedules note-offs across the boundary. Tempo changes preserve beat relationships. Stop releases generated voices but allows manual playing; panic clears everything.
- Density removes or adds rhythmic events, preserving the first onset group. Rotate offsets the whole phrase; quantize blends natural timing with a grid; swing is proportional to quantize; gate scales durations; harmony uses pitches present in the original phrase; Evolve changes seeded decisions per loop rather than randomly retuning the original notes.
- Transform edits are previewed immediately but become audible at the next loop boundary. Return to original clears all transforms. Try a phrase plays a short demo.
- The audition sound engine is independent, with soft/bright/pluck voices and optional Afterimage Decay. It is not Living Circuits, not the final eight-voice allocator, and not device firmware.

## Physical UX proposal
Record/Capture: tap to arm, play, tap to finish and loop; a clear OLED status (armed/recording/looping) and current bar count. Play toggles loop, Stop releases it. Phrase length is inferred by default, editable locally; no sequencer setup required. Preset/phrase changes must not discard unsaved work silently. A dedicated physical gesture is needed for Return to Original, distinct from Init Patch.

Use a local phrase focus to expose 2–3 performable controls at once: Density, Evolve, Rotate as the default trio; quantize, swing, gate, harmony remain optional. Primary synthesis encoders never change function merely because a phrase is running. Actual panel mapping and encoder count are still to be verified.

## Important next experiments
1. Smart close: distinguish a deliberate extra bar from a late button press. Provide an explicit free-length loop or trim-end gesture and show the chosen boundary. Never silently delete notes. Current round-up behavior can produce an unwanted empty bar.
2. Overdub: one gesture to add to a loop, undo last layer, replace only a selected layer. Separate overdub from live playing.
3. Capture gesture: same workflow for recording parameter movement, independent of notes; choose additive or absolute lanes; define precedence with Roam, Terrain and modulation.
4. Chord Memory: capture a chord/voicing, then apply inversions, arpeggiation and rhythm transformations without destroying it.
5. Phrase variations: immutable original plus A/B or four snapshots of transformations; temporary fills that return automatically; musical motif repetition rather than random event soup.
6. Clock: external MIDI/analog sync, clock divisions and transport; ensure drift cannot disrupt synchronized playback.
7. Patch/phrase storage and export, capture notes already held when arming only if intentionally specified, more accurate event timing via MIDI timestamps, and a unified voice allocator with Living Circuits.
8. Musical audition and browser testing. The worklet prototype allocates at event/cycle boundaries, uses a temporary audition synth, and does not establish MCU suitability.

Do not add arbitrary routing or dense step editing as the default. A detailed editor could be optional, but the physical instrument must be usable without it.
