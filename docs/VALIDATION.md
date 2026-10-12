# Version 1.7 verification · October 11, 2026

Validated on Windows 10.0.26300 x64 with Node 22.19.0, Electron 44.7.0 and electron-builder 26.15.3.

## Passed

- TypeScript type checking, ESLint and production build.
- All 23 unit tests across persistence, preference validation, migration, timer lifecycle, reminder sequence, stationary-pointer hit-testing, native pointer movement, and invalid hit rectangles.
- Real Electron integration: personal studio; male/female, clothing and bottle customization; custom name and greeting; half-visible edge lean and front-facing limb motion; popup chooser; supplied avatar selection; real DOM image drop and local imports; malformed image/path rejection; saved images after process restart; replacement cleanup; custom companion; main-process timer with settings hidden; both Yes and Not yet; dismissal; pause and test while paused; reduced motion; no renderer page errors; clean process exit.
- Native window checks: always on top, compact bounds, visible only during a visit, not focusable, context isolation on, Node integration off, sandbox on.
- Real packaged executable: launch, onboarding, overlay interaction, startup setting availability, fast mode ignored, full-hour production schedule after dismissal.
- Windows NSIS installer generation with HydroBuddy executable metadata/icon and an uninstaller. Output: `release/HydroBuddy-Setup.exe` (approximately 110 MiB).
- Production dependency audit: zero reported vulnerabilities. Moderate build-only findings remain in the electron-builder downloader chain; see README.
- Visual inspection of the redesigned studio, imported avatar, peek entrance and transparent companion. Automated layout checks confirm no speech/avatar overlap at normal and compact window sizes, a visible footer, containment of maximum-length greetings, and Escape dismissal of the native About dialog.
- Personal testing mode selects and persists the supplied transparent character. The popup accepts a direct image drop and can be dismissed with Escape when changing an existing avatar. The packaged app includes the supplied image and loads it through the chooser.

## Still requires manual release testing

- Installing/uninstalling on a clean Windows account and inspecting the installer screens.
- Opting in/out of OS auto-start and rebooting (tests deliberately do not alter login settings).
- Tray clicks, actual typing in other applications while reminders arrive, and click-through behavior over multiple applications.
- Multiple physical displays, DPI settings, sleep/wake hardware combinations, and macOS.

Tests use separate local profiles under `.test-data/`; the user's normal preferences are untouched. The build used the already-downloaded Electron distribution because this execution environment restricts the default download-cache folder. Equivalent packaging command used:

```sh
npx electron-builder --win nsis --x64 --config.electronDist=node_modules/electron/dist
```

Electron's own renderer sandbox and security settings remained enabled throughout testing.

Additional verification scripts (after building): `node scripts/desktop-test.cjs`, `node scripts/visual-check.cjs`, and `node scripts/packaged-smoke.cjs` (after packaging). Desktop tests exercise native Electron windows and need an interactive Windows desktop. They substitute a chosen file path for the native picker only inside the test process; production imports always use the user's file selection.

`node scripts/peek-check.cjs` checks personal testing mode, the unmasked leaning peek, direct popup drops, and persistence using its own isolated profile. The normal development app was also opened with `--demo-avatar` at the user's request; this intentionally selects the supplied character in their regular profile without enabling OS auto-start.

Version 1.5 uses connected canvas meshes textured from the original side-profile artwork. A 1.8-second gait alternates planted feet and bent-knee swing, with the bottle attached to the moving hand. The head, hair, torso and waist remain anchored; overlapping sleeve/hip regions prevent gaps. The recordings supplied on October 11 were read locally for gait comparison. Motion checks exercise both lifted feet, continuous support, bottle swing, direction, reactions and reduced motion. A preview is saved as docs/walking-preview.webm. Broader production acceptance still needs user testing.

Version 1.7: regenerated the walking frames individually after the user identified incorrect leg continuity in v1.6. Eight whole-body poses now follow contact/lift/pass/reach on one support leg, then the opposite support leg. Both jeans legs use light blue; depth uses seam/outline overlap. Each frame lasts 135 ms. Walking sprites were inspected individually; the discarded v1.6 atlas is no longer rendered. Build, lint, 23 unit tests, motion flow and packaged-app smoke checks were rerun. The previously documented Windows click-tool limitation remains unchanged.
