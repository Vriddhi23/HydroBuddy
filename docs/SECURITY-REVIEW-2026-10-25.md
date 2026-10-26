# HydroBuddy security and privacy review

Reviewed October 25, 2026 (America/Phoenix), on Windows. This covers the local working tree based on version 1.9.2, including the uncommitted security changes. It is a development review, not a certification or independent penetration test.

## What the checks found

No malicious behavior or data-upload feature was identified in the application source reviewed. Microsoft Defender reported no threats in the project directory and in the three downloaded release folders. npm reports zero known dependency vulnerabilities after the updates below. These are useful results, but none guarantees that software is free of every possible threat.

The existing GitHub downloads are unchanged. The new dependency versions and privacy protections require new builds. Nothing was committed, pushed, uploaded to GitHub, or published as part of this review. A separate unpacked Windows test build was created under `.cache/privacy-package`; it is not a new public release.

## Where data goes

- Preferences, character selection, colors, buddy name, reminder text and timing are saved in `preferences.json` under Electron's per-user app-data directory. They are plain local files, not encrypted storage.
- Legacy custom-avatar imports use a native file picker or supplied image bytes. Images are size/type checked, decoded, resized and re-encoded as PNG in the local `avatars` directory. File references are UUIDs, not arbitrary renderer-supplied paths. No image is sent to an AI provider or server.
- Yes / Not yet / dismiss messages pass between the app's own windows. The app has no water-intake analytics or remote event reporting.
- Login startup is an operating-system setting and changes only when enabled or disabled by the user.
- No backend, authentication, analytics, remote font loading, crash-upload service, automatic updater, AI API, screen capture or remote content loader was found in `src`.
- Data can still be read by someone who has sufficient access to the same computer. Operating-system backups or synchronization of user folders are outside HydroBuddy's control.

## Changes made

1. Updated Electron to 44.9.1, fast-uri to 3.1.9, and the installed undici versions to 6.29.1 and 7.30.1. These fix known dependency advisories; those advisories were not evidence of malware in HydroBuddy.
2. Added a default-deny Electron session request policy. Normal builds reject network URLs, including HTTP, HTTPS, WebSocket, localhost and network file shares. Local app assets and in-memory images remain available. Development mode permits only the configured loopback development server and its hot-reload socket.
3. Production HTML now uses `connect-src 'none'`, with form submissions and embedded frames also blocked. The development connection policy is replaced during the build.
4. Permission requests, permission checks and device permissions are denied. Downloads and webview attachment are blocked. Existing external-window and navigation blocks remain in place.
5. Added unit tests and a desktop privacy regression check. The existing manual GitHub build workflow now runs that check after compiling; this workflow edit remains local until committed and pushed by the owner.

The session policy covers Electron's request stack. It is not an operating-system firewall and cannot prevent arbitrary future malicious Node/native code from opening its own socket. The reviewed application main process does not contain such network code. Keep reviewing future dependencies and features.

## Verification

| Check | Result |
| --- | --- |
| npm dependency audit | 0 critical, high, moderate or low known vulnerabilities |
| ESLint | Passed |
| TypeScript and production build | Passed |
| Unit tests | 71 passed |
| Desktop behavior check | Setup, clothing colors, walking, Yes, Not yet, dismiss, pause and persisted preferences passed |
| Real Electron privacy check | Passed for compiled app and packaged Windows app |
| Packaging contents | App archive contained `node_modules`, `out`, `package.json`, and `resources`; filename inspection found no test profiles, preferences file, `.git`, `.env`, or private-key/certificate files |
| Dependency lockfile | 570 package entries; every resolved URL used the npm registry and had integrity metadata. This is not a complete source audit of every dependency. |
| Source credential-pattern check | No embedded credential found in application source; signing script references environment-variable names only |

The desktop privacy check starts a temporary loopback server and attempts renderer fetch/image loading and a main-process Electron network request. Requests are blocked, and the server receives zero requests. It also verifies notification/location denial, renderer isolation, rejection of invalid preferences and path traversal, rejection of an IPC request from the wrong window, and refusal to create an external browser window. It uses a separate test profile.

Automated tests initially encountered temporary-file restrictions in the restricted runner. They passed when rerun with normal local filesystem/desktop access. One initial privacy-test implementation used an unavailable Electron test API; it was corrected to exercise real renderer permission requests, then passed. These were testing issues, not antivirus detections.

## Antivirus checks

Microsoft Defender platform 4.18.26090.9-0, signatures 1.461.202.0 (updated October 25, 2026). Antivirus and real-time protection reported enabled.

Custom scans used `-DisableRemediation`, so the scans reported findings without automatically deleting or quarantining project files. Defender returned success and "found no threats" for:

- The HydroBuddy project directory, including its dependencies and existing release output.
- The final rebuilt Windows test package under `.cache/privacy-package`, scanned separately after packaging and privacy verification.
- `Downloads/HydroBuddy-Windows-x64`.
- `Downloads/HydroBuddy-Mac-Intel`.
- `Downloads/HydroBuddy-Mac-Apple-Silicon`.

The downloaded files checked were:

| File | SHA-256 |
| --- | --- |
| HydroBuddy-Setup.exe | `b957ce54f1d2c3ced943fc2026fd062af58e36545096fd71fd621cce4001f583` |
| HydroBuddy-1.9.2-mac-x64.dmg | `f04062dacb96c3a359eb258ff2a86f1e4c1289ba47cb144636a4010333c07b5d` |
| HydroBuddy-1.9.2-mac-arm64.dmg | `a3223a6eb0ef0fe83103998dc8a8bb2e80a9484429a7d118e98babf87a626220` |

A Windows scan of a DMG does not establish that every embedded macOS executable was inspected, and does not replace native Mac testing or Apple notarization. Older installers can still contain outdated dependencies even when antivirus finds no malware.

## Before publishing the next version

Choose a new version, build fresh installers from the reviewed changes, scan those exact files, generate new checksums, and test the downloads on Windows and a Mac. Do not label the existing downloads as updated just because source files changed.

For normal Mac distribution without the unverified-developer warning, follow [Apple signing and notarization](APPLE-NOTARIZATION.md). Apple credentials and a Mac are still required; no Developer ID signing or Apple notarization was performed here. Publishing a GitHub draft does not perform either step.

To repeat the source and runtime checks:

```sh
npm ci
npm audit
npm run lint
npm test
npm run build
node scripts/privacy-check.cjs
node scripts/personalization-test.cjs
```

To check an already packaged Windows app:

```sh
node scripts/privacy-check.cjs release/win-unpacked/HydroBuddy.exe
```

Development dependency audits contact npm with dependency metadata. App runtime privacy is separate from the internet access required to download build tools, audit dependencies or submit a future build to Apple.

References: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security), [Electron request interception](https://www.electronjs.org/docs/latest/api/web-request), [Microsoft Defender command-line scanning](https://learn.microsoft.com/en-us/defender-endpoint/command-line-arguments-microsoft-defender-antivirus).
