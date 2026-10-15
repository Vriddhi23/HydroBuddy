const { _electron: electron } = require('playwright')
const assert = require('node:assert/strict')
const path = require('node:path')
const fs = require('node:fs')
const env = { ...process.env, HYDROBUDDY_TEST_DATA: path.resolve('.test-data', `packaged-${Date.now()}`) }
delete env.ELECTRON_RUN_AS_NODE
let app
async function run() {
  const candidates = process.platform === 'darwin'
    ? [process.arch === 'arm64' ? 'release/mac-arm64/HydroBuddy.app/Contents/MacOS/HydroBuddy' : 'release/mac/HydroBuddy.app/Contents/MacOS/HydroBuddy']
    : ['release/win-unpacked/HydroBuddy.exe']
  const executablePath = candidates.map(p => path.resolve(p)).find(p => fs.existsSync(p))
  assert(executablePath, 'Package this platform before running the smoke test')
  app = await electron.launch({ executablePath, args: ['--fast-reminders'], env })
  let settings
  for (let attempt = 0; attempt < 100; attempt++) {
    settings = app.windows().find(p => p.url().includes('/settings'))
    if (settings) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(settings, 'Packaged settings window loaded')
  await settings.waitForSelector('h1')
  const state = await settings.evaluate(() => window.buddy.getState())
  assert.equal(await app.evaluate(({app}) => app.isPackaged), true)
  assert.equal(state.fastMode, false)
  assert.equal(state.preferences.reminderInterval, 60)
  assert.equal(state.preferences.onboardingCompleted, false)
  assert.equal(state.startupSupported, true)
  assert.equal(await app.evaluate(({app}) => app.getVersion()), require('../package.json').version)
  if (process.platform === 'darwin') assert(await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows().filter(w => /\/(companion|bubble)$/.test(w.webContents.getURL())).every(w => w.isVisibleOnAllWorkspaces())))
  await settings.getByRole('button', { name: 'Choose Male', exact: true }).click()
  await settings.getByRole('button', { name: 'Continue', exact: true }).click()
  await settings.getByRole('button', { name: 'Continue', exact: true }).click()
  await settings.getByRole('button', { name: 'Save my HydroBuddy', exact: true }).click()
  await settings.getByRole('button', { name: 'Test Reminder', exact: true }).click()
  const companion = app.windows().find(p => p.url().includes('/companion'))
  await companion.waitForSelector('.profile-walk[data-ready="true"]')
  assert.equal(await companion.locator('.profile-walk').getAttribute('data-facing'), 'left')
  const atlasWidth = await companion.evaluate(() => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image.naturalWidth); image.onerror = reject; image.src = './male-v1/step-05.png' }))
  assert.equal(atlasWidth, 1024, 'Packaged whole-body walking artwork loads locally')
  await companion.waitForSelector('[data-phase="asking"]', { state: 'attached' })
  await app.windows().find(p => p.url().endsWith('/bubble')).getByRole('button', { name: 'Dismiss reminder' }).click()
  await companion.waitForSelector('[data-phase="hidden"]', { state: 'attached' })
  const next = await settings.evaluate(() => window.buddy.getState())
  assert(next.nextReminderAt - Date.now() > 3590000)
  console.log(`PASS: packaged ${process.platform}/${process.arch} app launches, onboarding and overlay work, startup control is available, fast mode is ignored, and the production timer schedules a full hour.`)
}
run().catch(e => { console.error(e); process.exitCode = 1 }).finally(async () => { if (app) await app.close().catch(() => {}) })

