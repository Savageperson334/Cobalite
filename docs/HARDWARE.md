# Hardware research and integration

Target: Modal Cobalt8M. Exact hardware revision, current firmware and restoration procedure are unknown. No supported target manifest exists yet.

## Sources to investigate

- https://github.com/victorvillena/all8 — extraction, firmware patching, emulator and Iron research.
- https://github.com/cliffordmanasseh/crossflash-8 — cross-flashing experiments.
- https://www.manualslib.com/manual/3558870/Modal-Cobalt8m.html — panel, controls, MIDI and user interaction.
- https://www.korg.com/us/products/synthesizers/opsix/ — interaction reference only.

Treat third-party claims as leads, not proof of support for this device. Pin exact upstream commits and confirm licenses before importing or adapting code. Prefer locally supplied vendor images and independently authored patch modules.

## Workstreams

### A. Target inventory
Record model, hardware revision if accessible without opening, installed version, official update tool and matching vendor firmware. Back up presets and settings. Catalog physical encoders, encoder switches, buttons, LEDs, joystick, OLED resolution and panel event IDs. Distinguish actual hardware observations from stock manual functions. Build a table mapping physical controls to stock and proposed functions.

### B. Firmware build pipeline
Map the panel/master/slave image boundaries and version-specific checksums, code regions, entry points and memory budgets. Validate unpack/repack against the original input offline; reject unrecognized hashes and ambiguous targets. Compare output sections bytewise, write a manifest listing modified ranges and artifact hashes. Establish repeatable toolchain versions and use emulation where supported. Never modify bootloader, calibration or persistent identity regions.

### C. Interface hooks
Trace input event dispatch, display drawing, encoder acceleration, LED states, parameter messaging and storage. Design a small event-based UI with explicit local focus, no global latched alternate layer, and a stable base-parameter model. First experiment must be reversible in the emulator. Determine whether parameter/modulation messages can be retained or need extension; do not assume available free IDs.

### D. Audio hooks
Trace oscillator and filter dispatch and the voice mixing path. Identify sample rate, block sizes, per-voice state allocation, cycle budget and memory headroom. Reuse existing safe functions where appropriate. Build a native test harness for independently written DSP; compare deterministic renders with the emulated target. Add one original algorithm first, with silence/DC, clipping, aliasing, worst-case voice count, CPU and note-transition tests. Measure before expanding.

### E. Patch and release
Version the new patch schema. Do not overwrite stock presets without a tested conversion and restoration strategy. Prefer separate Cobalite patch storage/export if feasible. Flashing is a later explicit action, not part of automated builds. Verify official recovery path and exact model compatibility before first hardware experiment; bootloader preservation alone is not a guarantee against bricking.

## First real firmware milestone

A local, deterministic, version-gated offline patch build of the correct Cobalt8M application image with a minimal panel identity change and verified emulator behavior. Follow with a direct modulation inspector and one new oscillator path. Hardware testing is separate and requires owner approval and verified restoration plan.

## Repository policy

No vendor firmware binaries, extracted proprietary code or unlicensed upstream code in Git. No flashing workflows, no automatically published firmware artifacts and no claims of device support until hardware validated. Keep local firmware inputs outside the repository or ignored explicitly.
