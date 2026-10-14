# HydroBuddy 1.8.1 💧

A small desktop hydration companion for Windows. HydroBuddy lives in the system tray, peeks around the right edge, walks onto your desktop, reminds you to drink water, reacts to your answer, and leaves. Everything works locally after installation.

## Run locally

Use Node.js 22.19+ and npm on Windows 10/11 x64.

```sh
npm install
npm run dev
```

First launch opens a four-step popup: **Female or Male → T-shirt → Jeans → Preview and Save**. Both clothing steps offer four swatches and a custom color picker. The preview plays the real peek, retreat, walk, greeting, reaction and departure sequence. Save creates your buddy and schedules the first hourly visit. **Test Reminder** starts a visit immediately. **Change avatar** reopens setup later; settings also let you edit colors, name and greeting.

Close Settings to keep HydroBuddy in the system tray. Open Settings, test, pause/resume or quit from the tray menu. A visit waits up to 45 seconds for an answer; the cross dismisses it with an exit animation. The next full interval starts after the visit finishes. Production defaults to 60 minutes, with 30/45/60/90-minute choices.

```sh
npm run dev:fast      # Temporary 10-second development timer
npm run dev:personal  # Select the supplied female avatar in the local profile
```

The personal command explicitly changes the selected avatar in the normal development profile. Fast mode never changes the saved interval and is ignored in packaged builds.

## Make it yours

The female artwork retains the approved eight-frame walking cycle. The male artwork has matching complete-body poses, short hair, a masculine face and body, and the same shared animation sequence. Frames last 135 ms; entrance lasts 3 seconds and departure 3.2 seconds. Shirt and jeans colors apply to walking, peek, idle, sad, wave and celebration poses. Both jeans legs share the selected base color, with the original shading preserved.

The final setup step shows your animated preview and Save. Face upload and face replacement are not available in this version. Existing face overlays are ignored when loading older preferences; character choices, clothing colors and reminder settings are preserved. Previously imported full-body images are preserved and still move as a single image. Choose Change avatar to switch to a built-in animated character.

Preferences are validated, saved atomically, and restored after restart. No AI service is part of the installed application.

## Start with your computer

Auto-start is **off by default**. In the installed app, enable **Your routine → Be here when I log in**. HydroBuddy then starts quietly in the tray at sign-in. Pause reminders from the tray or Settings, or use Quit to stop the current session. Disable the startup toggle to stop future automatic launches. Development builds disable this control to avoid registering the development Electron executable.

## Build and package

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run package
```

The Windows x64 NSIS installer is `release/HydroBuddy-Setup.exe`. It supports per-user installation, choosing the installation directory, a desktop shortcut and Windows uninstall. `release/win-unpacked/HydroBuddy.exe` is the unpacked app. `npm run package:dir` builds only the unpacked application. Packaging initially needs internet to acquire build tools; the installed app is offline.

Builds are unsigned and Windows SmartScreen may display a warning. Use code signing before public distribution. Preferences intentionally survive uninstall; development data is normally in `%APPDATA%/hydrobuddy` and installed data in `%APPDATA%/HydroBuddy`.

For public downloads, signing, release checks and update instructions, see [the Windows launch guide](docs/RELEASING.md).

## Verification

```sh
npm run test:desktop
node scripts/motion-check.cjs
node scripts/clothing-review.cjs
node scripts/walk-art-check.cjs
node scripts/packaged-smoke.cjs  # after packaging
```

Desktop tests use isolated `.test-data` profiles and write screenshots to `test-results`. They check the setup flow, color changes, both responses, dismissal, retired face controls, save/restart, dialog controls and pause. Motion checks verify full retreat before the upright walk, all eight frames, direction, reactions and reduced motion. Native Windows cross and Not yet clicks were also checked separately. See [validation notes](docs/VALIDATION.md).

## Structure

```text
src/main/                 Electron lifecycle, tray, secure windows, timer and local storage
src/preload/index.ts      Narrow, typed IPC bridge
src/shared/               Preferences, validation and IPC contracts
src/renderer/screens/    Settings, Companion and ReminderBubble
src/renderer/components/ SetupWizard, ColorField, AvatarPreview,
                         BuddyFigure, SuppliedAvatar and ProfileWalk
src/renderer/animations/ Reminder state machine, walking timings and avatarPainter
src/renderer/public/     Female and male walking/reaction artwork
resources/               Application and tray icons
scripts/                 Desktop, native interaction and packaging checks
tests/                   Input validation, storage, timers and interaction tests
docs/                    Artwork provenance and validation notes
```

Appearance, pose rendering and reminder timing remain separate. Both characters use the same renderer and state machine. Color tinting happens locally on the registered whole-body pose; limbs are not detached or re-rigged.

The avatar window is transparent, frameless, always-on-top during visits, non-focusable and click-through. A separate compact speech window receives clicks without cursor hit-testing toggles. Closing either response or dismissal flow hides both windows. Display work areas determine placement.

## Privacy and security

No accounts, cloud, analytics, AI calls or backend. Electron uses context isolation, sandboxing, web security, disabled Node integration and a restrictive content security policy. IPC checks the sender window and main frame, validates colors/text/asset IDs, and never exposes arbitrary file paths to the renderer. Navigation, new windows and permission requests are denied.

## Known limitations and next steps

- Face uploads and face replacement are not included.
- The companion is pointer-operated to avoid taking keyboard focus. Settings are keyboard accessible; an optional keyboard-focus mode remains a future accessibility improvement.
- Only the primary display is used. Test mixed DPI, display changes, sleep/resume, typing under the overlay and multiple apps on more Windows devices before distribution. Exclusive fullscreen and secure desktop screens are outside scope.
- Test install/uninstall and startup opt-in/out on a clean Windows account, then add code signing and Windows CI.
- macOS has a packaging target and startup integration, but needs testing/signing/notarization on a Mac.
- Quitting/restarting and waking from sleep begin a new full interval; missed reminders are not accumulated.

Female artwork prompts: [original art](docs/AVATAR-ART.md), [walking frames](docs/WALK-FRAMES-V2.md). Male artwork and full generation prompt set: [male avatar art](docs/MALE-AVATAR-ART.md). All generated assets are bundled locally; image generation was a development step only.
