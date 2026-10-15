# Windows and Mac beta release — 1.9.0

Use one GitHub release with separate installer assets. A Windows EXE cannot run on a Mac. Apple Silicon and Intel Macs get separate DMGs, built from the same commit and version.

## Build on GitHub after pushing

1. Push all changes, including `.github/workflows/build-desktop.yml`, to the repository's default branch. The Run workflow button requires the workflow to exist there.
2. Open the repository's Actions tab. Enable Actions if GitHub asks.
3. Select **Build desktop installers** → **Run workflow**, choose the branch with these changes, and run it.
4. Wait for **Windows-x64**, **Mac-Apple-Silicon**, and **Mac-Intel** to finish. Each runs lint, unit tests, a production build, the setup/reminder desktop test, packaging, and a packaged-app smoke test. A failed job does not upload an installer. Open its failed step for the error; do not publish an installer from an older run as this version.
5. Open the completed run. Under **Artifacts**, download all three HydroBuddy archives. Extract them locally. These are build artifacts, not public releases, and expire after 30 days.
6. The resulting assets are `HydroBuddy-Setup.exe`, `HydroBuddy-1.9.0-mac-arm64.dmg`, `HydroBuddy-1.9.0-mac-x64.dmg`, and three platform-specific `SHA256SUMS-*.txt` files. Upload the extracted files to your release, not the enclosing Actions archives.
7. Test the downloaded installers on the matching computers. Then create a draft release for tag `v1.9.0` targeting the exact commit used in the successful build. Title: **HydroBuddy 1.9.0 — Desktop Beta**. Attach the installers/checksums, paste [RELEASE-NOTES-1.9.0.md](RELEASE-NOTES-1.9.0.md), mark it as a pre-release, and publish when testing is satisfactory.

The workflow has read-only repository permissions and never publishes a release or pushes code. It uses GitHub's native Mac runners, so it can be started from a Windows computer. GitHub Actions availability and usage limits depend on your repository/account.

Do not attach the old 1.8.1 installer to the 1.9.0 release. If only Windows is ready, publish the Windows beta and clearly state that Mac installers are pending. If immutable releases are enabled, collect all tested assets in a draft before publishing; later binaries may need a new version.

## Test on a Mac

1. Open **Apple menu → About This Mac**. For an Apple M-series chip, use the `arm64` DMG. For an Intel processor, use the `x64` DMG. These packages declare macOS 13 or newer.
2. Open the DMG and drag HydroBuddy into **Applications**. Eject the disk image and launch the app from Applications.
3. The beta is ad-hoc signed, not Developer ID signed or notarized. Gatekeeper may block it. For your own verified test download, follow Apple's current guidance for **System Settings → Privacy & Security → Open Anyway** when available. Do not disable Gatekeeper. A work-managed Mac may require its administrator's approval.
4. Complete setup, preview the walk, save, and test Yes, Not yet and the cross. Check reminder clicks while typing in another app, desktop Spaces, fullscreen apps, different display scaling and sleep/resume. No Accessibility or Screen Recording permission should be needed.
5. Close Settings with the red close button; the menu-bar droplet should remain. Open Settings and test/pause/resume from that menu. Confirm **Command+,** opens Settings and **Command+Q** quits. Reopen from Applications and confirm colors and reminder settings persist.
6. Test **Be here when I log in**, save, log out/in and check the menu-bar icon. Disable it and repeat. macOS login registration may fail for a beta that is not Developer ID signed and notarized; the app now reports failure or a required Login Items approval instead of claiming success. This must be verified with the final signed build before advertising reliable Mac auto-start.
7. Quit HydroBuddy before uninstalling. Move the app from Applications to Trash. Preferences remain in the user's Application Support folder unless separately removed.

Automated Mac tests do not prove Gatekeeper acceptance, a real reboot, fullscreen behavior on physical hardware, or all display configurations. Record those manual results before a wider release.

## Build directly on a Mac

Install Node.js 22.19+ and check out the code, then run:

```sh
npm ci
npm run lint
npm test
npm run package:mac
node scripts/packaged-smoke.cjs
```

`package:mac` creates both DMGs. The smoke test launches the package matching the host's architecture. A Mac is required for this route; use the GitHub workflow from Windows.

## Prepare a public Mac distribution

The default Mac configuration deliberately produces a beta with `identity: "-"`, `hardenedRuntime: false` and `notarize: false`. Ad-hoc signing does not identify a trusted publisher or bypass Gatekeeper.

For a public launch, enroll in the Apple Developer Program, create a Developer ID Application signing identity, and arrange notarization credentials. Configure electron-builder v26 with that identity, hardened runtime enabled and notarization enabled. Modern Electron needs the allow-JIT entitlement; electron-builder supplies its standard entitlements when a custom file is not specified. Keep certificates and credentials in GitHub Actions secrets or your Mac keychain, never Git. The beta workflow must then be updated to load those credentials rather than force test signing.

Rebuild, confirm signature verification, notarization acceptance and stapling, then test the downloaded DMG and login behavior on a separate Mac. No Apple credentials, signing account or notarized build have been configured in this workspace. The Windows beta is also unsigned. Neither platform currently has automatic updates.

References: [Electron login items](https://www.electronjs.org/docs/latest/api/app#appsetloginitemsettingssettings), [electron-builder v26 Mac options](https://www.electron.build/v26/docs/mac/), [GitHub Mac runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners), [Apple app-opening guidance](https://support.apple.com/en-us/102445).
