# Alternate firmware research — November 2026

Research references, not imported code or claims of compatibility. The purpose is to learn from instruments that depart from stock behavior, not to collect features.

| Project | Observed idea | Cobalite experiment |
|---|---|---|
| [Warps Parasites](https://mqtthiqs.github.io/parasites/warps.html) | Reimagines cross modulation with bit manipulation, waveshaping and distinct processing modes | A/B relationship as a central continuously performable axis; clean mix to phase interaction, nonlinear folding, digital logic and degradation |
| [Tides Parasites](https://mqtthiqs.github.io/parasites/tides.html) | Two-bumps harmonic engine and waveform/function generation | A harmonic-field oscillator with two movable spectral concentrations; use a related slow shape for modulation |
| [Sheep](https://pichenettes.github.io/mutable-instruments-documentation/modules/tides_original/firmware/) | Wavetable exploration on a 2D grid | Curated two-dimensional timbre field; avoid dozens of opaque algorithm choices |
| [Deluge Community](https://github.com/SynthstromAudible/DelugeFirmware) | Performance view and automation of patch cables | Modulation of modulation; temporary transformations and return to base |
| [JIANT FM](https://github.com/juanjiant-bit/JIANT) | Generative pattern, live recording, digital engines and performance variation | Musical variation as a performance control; formula oscillators as one deliberately unusual family |
| [PreenFM3](https://github.com/Ixox/preenfm3) | Custom envelope curves and a flexible FM engine | Expressive envelopes with shape and response, not more menus |
| [Mutable third-party firmware index](https://pichenettes.github.io/mutable-instruments-documentation/third_party_firmware/) | Internal modulation, random meta-sequencers and keyframe mutations | Investigate time-varying modulation destinations and path-based sound design |

## Experiments beyond the conventional engine

1. RELATIONSHIP: a continuous spectrum of interaction between source A and B. At one end additive blend, at intermediate positions controlled phase/ring modulation, at the far end nonlinear combination or bitwise processing. Do not blindly crossfade unmatched algorithms: loudness-match, DC block and limit, evaluate phase cancellation and audible transitions. Existing Mix remains a reliable balance control; Interaction is separate.
2. FIELD: two spectral peaks slide through a harmonic series, with an optional inharmonic branch. Shape moves the centers and Character changes width and complexity. Preserve the fundamental at moderate settings; add digital degradation deliberately. Consider a band-limited wavetable implementation if additive synthesis is too expensive.
3. DAMAGE: define a single musical axis for independent quantization and sample-hold, with optional pre-filter placement and a binary logic interaction between sources. Avoid equating experimentation with constant harshness.
4. BEHAVIOUR: Roam, slow nonlinear drift, envelope shapes, modulation-of-depth, and bounded voice individuality. A path can become an instrument-level signature: no matrix page required. Try shared trajectories with optional small per-voice offsets.
5. SOUNDSCAPE: a patch is a small navigable space of related timbres, with safe reversible motion and direct manual editing. Distinguish from sample-based granular synthesis and from generic preset morphing. No need to reproduce Beads.

Prioritize Roam and Relationship as distinctive prototypes, then Field and Damage. Do not commit to architecture until the user auditions them. Preserve the ordinary dry, clean and pitched sound at one end of every experimental control. Hardware feasibility is not established. All third-party source licenses must be verified before copying or linking; this survey imports no upstream code.
