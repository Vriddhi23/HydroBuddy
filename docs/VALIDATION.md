# HydroBuddy 1.9.1 verification · October 15, 2026

- Added 10/20-minute presets and a custom 1–1,440 whole-minute input. The default remains 60 minutes. Existing saved intervals remain valid.
- Replaced ambiguous pause copy with explicit On (avatar visits) and Off (visits paused) descriptions. Startup is labeled Start when I log in and explains that paused reminders stay paused.
- All 47 unit tests passed, including custom interval bounds, invalid IPC inputs and custom preference persistence. ESLint and the production build passed.
- A real Windows Electron test passed: 10/20-minute schedule deadlines, custom 37-minute save/restart, invalid input blocking, pause/resume and manual Test Reminder while paused. A fresh screenshot was visually inspected.
- Corrected the countdown so its initial rounded display cannot exceed the selected interval.
- Mac builds and physical Mac tests remain pending; the GitHub workflow now also runs the custom interval test.

- Windows 1.9.1 installer built successfully (144,127,360 bytes). Packaged launch, setup, artwork, cross dismissal and default hourly scheduling passed. The interval test also passed after correcting the countdown display.
- SHA-256: 70c59434c1bb2695a77ff32e04c7a18004331b4247776754fb92fb0b2c84d99b. Checksums are in release/SHA256SUMS-win32-x64.txt.

---

# HydroBuddy 1.9.0 verification · October 15, 2026

- TypeScript, ESLint and production build passed on Windows. All 33 unit tests passed, including platform-specific startup arguments, Mac login-launch detection, rejected registration, required approval, opt-out and development safeguards.
- Windows Electron integration passed: setup, custom clothing colors, animation preview, save/restart persistence, Yes, Not yet, cross dismissal, dialog controls and pause.
- Both platform packaging configurations pass electron-builder v26 schema validation. The manually triggered three-platform workflow parses as valid YAML.
- Mac ICNS header/chunk sizes and all seven PNG resolutions (16–1024 px) validated. Menu-bar icons have transparent 18 px / 36 px representations.
- Mac runtime, DMG generation, real-device behavior, login after reboot and Apple notarization have NOT been tested on this Windows host. Run the new GitHub Mac jobs, then test on physical Macs. The workflow does not publish releases.
- The default Mac packages use ad-hoc test signing, not Developer ID signing/notarization. Windows remains unsigned. Electron renderer sandbox, context isolation, Node isolation and web security remain enabled.

- Windows 1.9.0 NSIS installer built successfully (144,128,394 bytes). Packaged smoke test passed: exact application version, onboarding, local male walking assets, overlay, cross dismissal, production hourly timer and ignored development timer flag.
- SHA-256: c6cc8ecffa2b41a2827fec8e703a2c030ef1851829e824f4971c52baa2975486. Checksums are also in release/SHA256SUMS-win32-x64.txt.

---

# HydroBuddy 1.8.1 verification · October 14, 2026

## Face-upload removal

- TypeScript, ESLint and the production build passed. All 25 unit tests passed, including migration of saved face settings without resetting gender, clothing colors, interval, pause or onboarding state.
- Removed the face-upload component, crop controls, renderer compositing, preference fields and face-specific save handling. Older face fields are ignored; original user files are not deleted.
- Real Electron integration passed: four-step setup, shirt and jeans colors, walk preview and Stop, Save, restart persistence, Yes, Not yet, cross dismissal, About and setup close, interval and pause controls. No renderer page errors occurred.
- Inspected the fresh final-preview screenshot: centered single preview, Save visible, no face-upload panel. The Settings screen has no face-upload controls.
- Walking artwork, pose order and animation timing were not changed.
- Automated tests use isolated profiles; normal preferences and login settings are not modified by tests.

- Windows NSIS installer built successfully: application version 1.8.1, 144,127,549 bytes.
- Packaged smoke test passed: first-run setup, male local artwork, transparent overlay, cross dismissal, startup control availability, development timer ignored and next reminder scheduled for a full hour.
- Installer SHA-256: a38dbac9025fa3501b9e71a3dbdd854c49091f3c5de5ab09baf329ca4dd06397 (also in release/SHA256SUMS.txt).

The current installer is unsigned. Public publishing has not been performed. See [the launch guide](RELEASING.md) for clean-machine testing, signing and download hosting.

---

## Previous version: historical 1.8 verification


Validated on Windows x64 with Node 22.19.0, Electron 44.7.0 and electron-builder 26.15.3. All automated desktop runs use isolated `.test-data` profiles and leave normal preferences and login settings alone.

## Passed

- TypeScript, ESLint, production renderer/main/preload builds, and all 24 unit tests. Coverage includes validated hex colors, bounded face crop/asset references, bubble IPC payloads, persisted preferences, timer lifecycle and reminder phase transitions.
- Real Electron setup: male/female selection, shirt swatches, arbitrary jeans color, animated preview, Stop preview, Save, and setup dismissal. Color and avatar choices survive restart.
- Full reminder interaction: Yes → happy; Not yet → sad; cross during greeting → exit; both windows hide and the next full interval resumes. Repeated visits work. The bubble is a dedicated compact interactive window and the character remains non-focusable/click-through.
- Actual Windows mouse clicks (computer-use skill, not DOM dispatch): Not yet produced the sad reaction; the cross dismissed the reminder, hid the window after departure and resumed the hourly schedule. `test-results/native-cross-result.json` records the close check. A prior second-window UI-automation attempt encountered stale window state; the fresh-window coordinate click passed.
- Face import/crop/save/restart/removal; reset crop; male/female change; custom colors; About close; setup close; reminder pause; interval changes; no renderer page errors in the desktop integration run.
- Original female peek and retreat remain intact. Motion verification confirms a complete off-screen retreat, upright right-to-left entrance without a swing, all eight whole-body poses, right-facing departure, sad/happy expressions, reduced motion and persisted supplied-avatar selection.
- Both eight-frame walking packs are RGBA 1024×1536 with transparent borders. The male reaction sheet is RGBA 1536×1024. All 16 recolored poses were rendered and visually inspected; the bottle-over-jeans passing pose uses a traced mask to avoid a rectangular untinted patch.

## Commands

```sh
npm run build
npm run lint
npm test
node scripts/personalization-test.cjs
node scripts/clothing-review.cjs
node scripts/motion-check.cjs
node scripts/walk-art-check.cjs
```

## Limits

An uploaded face is a static oval image with local crop controls. It follows the body animation but does not synthesize a side profile or expression. Built-in drawn faces retain their sad/happy reactions when no upload is selected.

Clean-machine install/uninstall, actual reboot after startup opt-in/out, multi-monitor/mixed-DPI hardware, extended typing under the overlay, sleep/resume combinations, and macOS still need broader release testing. The installer is unsigned. Electron's renderer sandbox, context isolation and web security remain enabled.

Artwork provenance and exact prompts are in `MALE-AVATAR-ART.md` and `WALK-FRAMES-V2.md`. Generated assets are bundled locally; there is no runtime generation or network requirement.

## Packaged build

- Windows NSIS installer successfully generated: `release/HydroBuddy-Setup.exe` (144,126,391 bytes), application version 1.8.0.
- Packaged smoke test passed: first-run wizard, male artwork loaded from local packaged assets, transparent companion, cross dismissal, startup control availability, ignored development fast-mode flag, and a fresh full-hour reminder schedule.
- SHA-256: `f2007396d56cadc9bac712045d71d3007bd63205328e592c3e92b33f0fd13e97`. Also recorded in `release/SHA256SUMS`.
- Packaging used the existing Electron distribution: `npx electron-builder --win nsis --x64 --config.electronDist=node_modules/electron/dist` with the builder cache kept in `.cache/builder`.
