// Explicit production path; ordinary beta packaging remains separate.
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { build, Platform, Arch } = require('electron-builder')
const root = path.resolve(__dirname, '..')

async function run() {
  if (process.platform !== 'darwin') throw new Error('Run this command on a Mac with your Developer ID certificate installed.')
  const architecture = process.argv[2] || process.arch
  if (!['arm64', 'x64'].includes(architecture)) throw new Error('Choose arm64 or x64.')
  const identity = process.env.CSC_NAME?.trim()
  if (!identity || identity === '-' || identity.startsWith('Developer ID Application:')) {
    throw new Error('Set CSC_NAME to your Developer ID certificate name without the "Developer ID Application:" prefix, or its SHA-1 identifier. Ad-hoc signing is not allowed here.')
  }
  if (!process.env.APPLE_KEYCHAIN_PROFILE?.trim()) throw new Error('Set APPLE_KEYCHAIN_PROFILE to credentials saved with xcrun notarytool store-credentials.')
  // Keep authentication unambiguous: electron-builder prioritizes these over
  // keychain profiles, so refuse them instead of silently using another account.
  const conflicting = ['APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'APPLE_API_KEY', 'APPLE_API_KEY_ID', 'APPLE_API_ISSUER']
  if (conflicting.some(name => process.env[name])) throw new Error('Unset other Apple authentication variables; this command uses only APPLE_KEYCHAIN_PROFILE.')
  process.chdir(root)
  const base = require('../package.json').build
  const output = path.join(root, 'release', 'notarized')
  await build({
    targets: Platform.MAC.createTarget('dmg', architecture === 'arm64' ? Arch.arm64 : Arch.x64),
    publish: 'never',
    config: {
      ...base,
      forceCodeSigning: true,
      directories: { ...base.directories, output },
      mac: {
        ...base.mac, identity, type: 'distribution', hardenedRuntime: true,
        entitlements: 'resources/entitlements.distribution.plist',
        entitlementsInherit: 'resources/entitlements.distribution.plist',
        notarize: true
      }
    }
  })
  const app = path.join(output, architecture === 'arm64' ? 'mac-arm64' : 'mac', 'HydroBuddy.app')
  // Notarization must finish and its ticket must be attached before success.
  for (const [command, args] of [
    ['codesign', ['--verify', '--deep', '--strict', '--verbose=2', app]],
    ['xcrun', ['stapler', 'validate', app]],
    ['spctl', ['--assess', '--type', 'execute', '--verbose=4', app]]
  ]) execFileSync(command, args, { stdio: 'inherit' })
  console.log('Signing, notarization ticket, and Gatekeeper checks passed. Test the DMG on another Mac before publishing. Files: release/notarized/')
}
run().catch(error => { console.error(error.message); process.exitCode = 1 })
