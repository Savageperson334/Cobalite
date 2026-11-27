# Instrument lab 0.1

A standalone browser sketch, not an emulator or a hardware firmware image.

## Run locally

Clone the repository and serve the prototype from localhost, using Python 3:

    cd Cobalite
    python -m http.server 8000 --directory prototype

Open http://localhost:8000 in a recent desktop browser, turn speaker volume down, then click Enable audio. AudioWorklet requires a secure context (localhost or HTTPS). No external libraries or network services are needed. Use the on-screen keys or A W S E D F T G Y H U J K; click outside focused inputs/buttons before playing with the computer keyboard.

## Try

1. Init and hold a few notes. Explore Source A Shape, then Character.
2. Blend Source B, try Ensemble, then Phase / FM.
3. Increase Phase interaction gradually.
4. Explore Bit reduction and Sample reduction separately; return both to zero.
5. Click the Cutoff label, select LFO, set a signed depth and apply. Adjust cutoff normally while modulation remains active.
6. Click the same destination again to inspect or remove the route. Use Motion amount to reduce its influence without deleting the connection.
7. Use Undo after changing a control, or Init for the starting sound. All notes off silences the prototype.

## Current scope and limitations

- Up to eight independently allocated voices, a basic attack/release envelope, a simple low-pass filter and two sources with three experimental oscillator families.
- Phase interaction, two forms of digital degradation, LFO and velocity modulation, route inspector and patch undo.
- Mono signal duplicated into both output channels; no real stereo engine yet.
- Simple native-rate waveforms and nonlinear processing can alias; parameter changes and voice stealing can click. This is not production DSP.
- CPU efficiency, browser compatibility, MIDI input, smooth parameter interpolation, real ADSR, presets, and accurate hardware-panel simulation are not yet implemented or validated. No hardware timing or memory conclusions can be inferred.
- The prototype has been committed but has not been auditioned or browser-tested during creation. If an AudioWorklet error appears, report browser/version and console error.

The goal is to compare interaction and sound directions before choosing hardware control mappings or porting DSP. Do not flash anything from this directory.
