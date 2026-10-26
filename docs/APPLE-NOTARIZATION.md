# Preparing an Apple-verified Mac release

Publishing a GitHub draft does not sign or notarize its downloads. The 1.9.2 DMGs are ad-hoc signed beta builds. Their warning does not mean Apple detected malware; it means Apple cannot verify them through its normal distribution process.

Apple notarization checks for known malicious content and signing problems. Neither notarization nor a dependency audit guarantees that software has no security flaws.

## What you need

- Apple Developer Program membership. Apple lists USD 99 per membership year, with regional pricing. Qualifying nonprofit organizations, accredited educational institutions, and government entities can request a waiver; an ordinary free developer account is not equivalent.
- A Mac with Xcode command-line tools, Node.js 22.19+, and this repository.
- A **Developer ID Application** certificate and its private key installed in that Mac's Keychain. Create these through your Apple developer account; do not share the private key, passwords, or certificates in chat or commit them.
- Notarization credentials saved in Keychain. Follow Apple's `notarytool` instructions. `xcrun notarytool store-credentials "hydrobuddy-notary"` prompts for the relevant credentials; use an app-specific password rather than your normal Apple Account password when using Apple ID authentication.

## Build after the account and certificate are ready

Use a new release version for the updated dependencies rather than replacing the existing published 1.9.2 binaries. For example, run `npm version 1.9.3 --no-git-tag-version` when preparing that release, and review both package files.

On the Mac, install dependencies, run lint/tests/build, and set these non-password variables in Terminal:

```sh
npm ci
npm run lint
npm test
npm run build
export CSC_NAME="Your certificate name (TEAMID)"
export APPLE_KEYCHAIN_PROFILE="hydrobuddy-notary"
node scripts/package-mac-notarized.cjs arm64
```

Replace the certificate example with your actual identity, omitting the `Developer ID Application:` prefix. A certificate SHA-1 identifier also works. For an Intel DMG, run the command with `x64`, preferably on an Intel Mac. Keep the certificate and Keychain profile available on whichever Mac performs the build.

The production command enables Hardened Runtime and requests only the JIT entitlement needed by Electron. It requires a real signing identity, submits the app to Apple, attaches the notarization ticket, and verifies the signature, ticket, and Gatekeeper assessment. Missing credentials, rejection, or failed validation stops the command. Outputs are separated in `release/notarized/`; no release is published automatically.

This path has been prepared on Windows, but cannot be end-to-end tested here without a Mac, your certificate, and Apple's acceptance. The existing GitHub **Build desktop installers** workflow still produces non-notarized beta builds; it does not become a production signing workflow merely because credentials exist elsewhere.

## Verify the exact download

Create SHA-256 checksums for the final DMGs. Upload them as a new draft release, download the correct DMG through Safari on another Mac, install using Finder, eject, and open from Applications. Check the full reminder flow and startup separately. A normal first-launch “downloaded from the internet” confirmation can still appear on a notarized app. Do not call an artifact Apple-verified until notarization and these release checks pass.

## Sources

- [Apple enrollment and price](https://developer.apple.com/programs/enroll/)
- [Apple fee waivers](https://developer.apple.com/help/account/membership/fee-waivers/)
- [Developer ID certificates](https://developer.apple.com/help/account/certificates/create-developer-id-certificates/)
- [Apple notarization](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- [electron-builder v26 Mac options](https://www.electron.build/v26/docs/api/app-builder-lib.interface.macconfiguration/)
