// Exercises the real Electron session against a local trap server. No personal
// profile, external endpoint, or operating-system login setting is used.
const { _electron: electron } = require('playwright')
const assert = require('node:assert/strict')
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const requests = []
const server = http.createServer((request, response) => {
  requests.push(request.url)
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.end('unexpected connection')
})
let app
async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const target = `http://127.0.0.1:${server.address().port}/privacy-probe`
  const env = { ...process.env, HYDROBUDDY_TEST_DATA: path.resolve('.test-data', `privacy-${Date.now()}`) }
  delete env.ELECTRON_RUN_AS_NODE
  delete env.ELECTRON_RENDERER_URL
  const executablePath = process.argv[2] ? path.resolve(process.argv[2]) : undefined
  app = await electron.launch({ ...(executablePath ? { executablePath, args: [] } : { args: [path.resolve('out/main/main.js')] }), env })
  if (executablePath) assert.equal(await app.evaluate(({ app }) => app.isPackaged), true)
  let settings
  for (let i = 0; i < 100; i++) {
    settings = app.windows().find(page => page.url().endsWith('/settings'))
    if (settings) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(settings, 'Settings renderer loads with network blocked')
  await settings.waitForSelector('.setup-wizard[open]')
  assert.match(await settings.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'), /connect-src 'none'/)
  const isolation = await settings.evaluate(() => ({ require: typeof window.require, process: typeof window.process }))
  assert.deepEqual(isolation, { require: 'undefined', process: 'undefined' })
  assert.equal(await settings.evaluate(async url => {
    try { await fetch(url); return 'allowed' } catch { return 'blocked' }
  }, target), 'blocked', 'Renderer fetch is blocked by CSP')
  assert.equal(await settings.evaluate(url => new Promise(resolve => {
    const image = new Image()
    image.onload = () => resolve('allowed')
    image.onerror = () => resolve('blocked')
    image.src = url
  }), target), 'blocked', 'Remote images are blocked')
  const main = await app.evaluate(async ({ net, BrowserWindow }, url) => {
    const request = await new Promise(resolve => {
      const request = net.request(url)
      request.on('error', error => resolve(error.message))
      request.on('response', () => resolve('allowed'))
      request.end()
    })
    const windowsSafe = BrowserWindow.getAllWindows().every(window => {
      const preferences = window.webContents.getLastWebPreferences()
      return preferences.contextIsolation && preferences.sandbox && !preferences.nodeIntegration && preferences.webSecurity
    })
    return { request, windowsSafe }
  }, target)
  assert.match(main.request, /ERR_BLOCKED_BY_CLIENT/, 'Main-process Electron network requests hit the session block')
  assert.equal(main.windowsSafe, true)
  const permissions = await settings.evaluate(async () => ({
    notification: await Notification.requestPermission(),
    location: await new Promise(resolve => navigator.geolocation.getCurrentPosition(() => resolve('allowed'), error => resolve(error.code), { timeout: 3000 }))
  }))
  assert.deepEqual(permissions, { notification: 'denied', location: 1 }, 'Permission requests denied without prompting')
  const ipc = await settings.evaluate(async () => {
    let pathDenied = false, invalidPreferencesDenied = false, wrongWindowDenied = false
    try { await window.buddy.readAvatar('../../private') } catch { pathDenied = true }
    try { await window.buddy.savePreferences({ arbitrary: true }) } catch { invalidPreferencesDenied = true }
    try { await window.buddy.getBubble() } catch { wrongWindowDenied = true }
    return { pathDenied, invalidPreferencesDenied, wrongWindowDenied }
  })
  assert.deepEqual(ipc, { pathDenied: true, invalidPreferencesDenied: true, wrongWindowDenied: true })
  const windows = app.windows().length
  await settings.evaluate(url => window.open(url), target)
  await settings.waitForTimeout(300)
  assert.equal(app.windows().length, windows, 'External windows are denied')
  assert.deepEqual(requests, [], 'Trap server received no requests')
  const result = { checkedAt: new Date().toISOString(), packaged: !!executablePath, rendererFetchBlocked: true, remoteImagesBlocked: true, electronNetworkBlocked: true, permissionsDenied: true, isolatedRenderers: true, ipcValidation: ipc, externalWindowsDenied: true, trapServerRequests: requests.length }
  fs.mkdirSync('test-results', { recursive: true })
  fs.writeFileSync(`test-results/privacy-check${executablePath ? '-packaged' : ''}.json`, JSON.stringify(result, null, 2))
  console.log('PASS: offline session, CSP, permission denials, renderer isolation, IPC validation, external-window block; zero trap-server requests.')
}
run().catch(error => { console.error(error); process.exitCode = 1 }).finally(async () => {
  if (app) await app.close().catch(() => {})
  server.close()
})
