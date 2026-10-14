# Launch HydroBuddy for Windows

The deliverable for users is `release/HydroBuddy-Setup.exe`. Users install it, choose a character and colors, and save. They do not need Node.js, npm, a browser extension, an account, or an internet connection to run it. Start with a Windows x64 beta; macOS is not yet verified.

## Prepare a release

1. Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, and `node scripts/personalization-test.cjs`.
2. Run `npm run package`, then `node scripts/packaged-smoke.cjs`. Keep the app version and release tag consistent (this version: `1.8.1` / `v1.8.1`).
3. On a separate Windows account or clean Windows computer, install the exact installer. Check onboarding, both characters, clothing colors, Yes, Not yet, cross dismissal, tray pause/resume, quit, and uninstall. Test an upgrade over an existing installation and confirm settings survive.
4. Turn on **Your routine → Be here when I log in**, restart Windows, and confirm quiet tray startup. Turn it off and confirm it no longer starts automatically. Check common screen scales and sleep/resume.
5. Generate a SHA-256 checksum for the final installer, after signing if applicable. Publish the matching checksum with the download.

Automated checks already completed are recorded in [VALIDATION.md](VALIDATION.md). Clean-machine and reboot checks are still release work, not verified by the automated smoke test.

## Host the download with GitHub Releases

A public GitHub release is a straightforward first download page. It can host the installer and release notes without running an application server. A dedicated marketing website is optional.

1. Create or choose the public HydroBuddy repository. If publishing source, choose a license intentionally and exclude personal data, `.test-data`, screenshots of personal sessions, credentials, caches and `node_modules`. The installer belongs in a release asset rather than Git history.
2. Open **Releases → Draft a new release** and use tag `v1.8.1` and title **HydroBuddy 1.8.1 — Windows beta**.
3. Attach `HydroBuddy-Setup.exe` and `SHA256SUMS.txt`. Describe Windows x64 support, offline use, optional startup, how to quit, and the unsigned status of the current build. Mark the first test release as a pre-release.
4. Publish when the files and notes are ready. Share the release page; users choose the installer under Assets. GitHub's automatically generated source archives are not the installer.
5. Add a **Download for Windows** link to that release page on your website or social profile. Include a way to report problems, such as the repository's Issues page.

Official instructions: [Managing GitHub releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).

## Signing and a wider launch

The current installer is unsigned. Windows may show an unknown-publisher or SmartScreen warning. For a wider public launch, obtain a Windows code-signing identity, configure signing for the application and installer, rebuild, and verify their signatures. The current build configuration explicitly disables executable signing; it must be replaced with the configuration for your signing provider. Keep signing credentials outside the repository. Signing identifies the publisher; do not promise that every reputation warning will disappear immediately.

See [Electron's signing guide](https://www.electronjs.org/docs/latest/tutorial/code-signing) and [electron-builder Windows signing](https://www.electron.build/docs/features/code-signing/code-signing-win/). Choose the provider after checking its current eligibility and pricing. A certificate or signing subscription has not been purchased or configured for this project.

## Everyday use and updates

Auto-start is opt-in. Once enabled in the installed app, users do not need to open HydroBuddy after every login. Closing Settings leaves it running in the tray; Pause stops reminders and Quit ends the current session. Disabling the startup option prevents future automatic launches.

Automatic app updates are not implemented. For this beta, publish a new version and have users quit HydroBuddy and run the newer installer. Keep the same application ID so upgrades retain the installation identity. Preferences are kept locally and intentionally survive uninstall.

The installed application needs no backend, AI API or cloud database. Hosting a downloadable installer does not change that. Future automatic updates would need a separate implementation and testing.

## Suggested release notes

HydroBuddy 1.8.1 is a Windows x64 desktop hydration companion. Choose a female or male character, customize T-shirt and jeans colors, preview their walk, and receive gentle reminders above your other apps. It works offline and can start at login if you enable that option.

This update removes the optional face-upload panel and face replacement. Saved character, clothing and reminder preferences are preserved. The existing peek, walk and reaction animations remain unchanged.

This beta installer is unsigned. macOS and automatic updates are not included. Please report installation, display or reminder issues through the project's support channel.

No public release has been published by this local build process. Publishing requires your chosen GitHub repository or another download host.
