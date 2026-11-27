# ROAM — travelling modulation

Status: implemented as an independent browser experiment in prototype/archive/roam.html (archived; Roam continues in the 0.8 and 0.9 builds); no hardware integration. This is a deliberately different kind of modulation source: the destination travels, not just the source value.

## Gesture

Hold a dedicated momentary control, touch or turn a series of continuous parameter encoders, release. During capture, touches append destination identities without changing their base values. Consecutive duplicates are ignored; revisiting a parameter later is allowed. A maximum of 24 visits bounds storage. The browser uses hold R and mouse touches, or a click-to-capture/click-to-start alternative. Hardware button identity and event detection remain undecided. Do not steal Shift globally before evaluating real panel constraints.

## Motion

For N visits over duration T, each nominal segment takes T/N. Let x = phase*N, i=floor(x), f=x-i. Blend from visit i to i+1 with w=(1-cos(pi*f))/2. Adjacent weights sum to one, the derivative at segment edges is zero, and the final visit hands off to the first. Multiple visits to the same destination add their weighted offsets. One destination becomes a slow raised-cosine LFO. A mild coherent amplitude contour (Swell) or deterministic multiperiod contour (Wander) scales the weights. Each destination has a curated normalized depth limit, with polarity initially chosen toward available headroom. This is not random patch mutation or recording absolute knob positions.

Offsets are computed from the audio sample clock at block rate, smoothed with a 450 ms time constant and added to base values alongside ordinary modulation, then clamped. Stereo spread is treated as a global destination; no discrete algorithm selectors, master volume or pitch are included in the initial safe list. Stop decays all offsets toward zero without editing the patch. Freeze holds path phase (offsets can still settle and depth can still be edited); resume continues from there. Duration changes preserve normalized phase. Depth scales the entire journey. Roam is an independent temporary transport, not saved with snapshots or patches in this version. Init and preset recall stop it.

## Future departures

- **Trail:** leave slowly fading modulation behind as Roam proceeds; optionally link fade time to visit spacing.
- **Confluence:** two travelling paths with independent lengths and opposite directions, sharing a bounded modulation budget.
- **Orbit:** rotate a joystick-controlled path through recorded destinations; joystick position changes path speed and focus.
- **Return:** one-shot journey that returns to base, with a separate safe fade in/out.
- **Elastic:** dwell time based on capture pauses or explicit weights; smoothly varying speed rather than random jumps.
- **Directed visits:** capture encoder direction and movement amount as a signed depth hint. This requires reliable relative encoder events and an explicit gesture so a touch does not accidentally commit a large depth.
- **Sound spaces:** capture multiple coherent patch states, interpolate continuous controls along paths, and use explicit safe transitions for discrete algorithms; distinct from Roam's destination travel.

These are candidates, not implemented features. Prefer useful combinations over numerous unrelated modes. The first physical test should compare audible transitions across a 3-minute chord and manual editing during the journey. Measure CPU, block rate, parameter range scaling and storage before porting; the control-rate design is intended to be modest, not proven on the Cobalt.

## Tests

Headless check: browser script and worklet syntax, eight-voice render, 180-second ordered traversal, freeze, wrap, and decay to near zero after stop. Browser event handling, audio-device performance, exact three-minute listening experience, and hardware are not yet validated.
