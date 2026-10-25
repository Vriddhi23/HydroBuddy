// Local release-media helper. Uses an isolated profile and the packaged app.
// Set HYDROBUDDY_FFMPEG to a local ffmpeg executable to record the desktop.
const { _electron: electron } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const sharp = require('sharp')
const { spawn } = require('node:child_process')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let app, recording
async function run() {
  const profile = path.resolve('.test-data', `release-media-${Date.now()}`)
  fs.mkdirSync(profile, { recursive: true })
  fs.mkdirSync('docs/media', { recursive: true })
  fs.writeFileSync(path.join(profile, 'preferences.json'), JSON.stringify({ avatar: { gender: 'female', clothingColor: 'green', bottleColor: 'blue', source: 'builtin', frontAsset: null, sideAsset: null, shirtColor: '#80a98e', pantsColor: '#99c5e5' }, buddyName: 'Buddy', greeting: 'Hey, it’s time to get hydrated.', walkStyle: 'classic', reminderInterval: 20, remindersEnabled: true, launchAtStartup: false, onboardingCompleted: true }))
  const env = { ...process.env, HYDROBUDDY_TEST_DATA: profile }
  delete env.ELECTRON_RUN_AS_NODE
  app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/HydroBuddy.exe'), env })
  for (let i = 0; i < 100 && !app.windows().some(p => p.url().endsWith('/settings')); i++) await delay(100)
  const settings = app.windows().find(p => p.url().endsWith('/settings'))
  const companion = app.windows().find(p => p.url().endsWith('/companion'))
  const display = await app.evaluate(({ screen }) => screen.getPrimaryDisplay())
  fs.writeFileSync('.cache/media-display.json', JSON.stringify(display))
  console.log('Primary display:', JSON.stringify({ bounds: display.bounds, workArea: display.workArea, scaleFactor: display.scaleFactor }))
  await settings.waitForSelector('.studio')
  await settings.getByRole('button', { name: 'Your routine', exact: true }).click()
  await delay(600)
  await settings.screenshot({ path: 'docs/media/reminder-settings.png' })
  await settings.getByRole('button', { name: 'Your buddy', exact: true }).click()
  await settings.screenshot({ path: 'docs/media/choose-your-buddy.png' })
  // Collect the same rendered canvas poses used by the reminder, for README stills.
  await settings.evaluate(() => window.buddy.testReminder())
  await companion.waitForSelector('.profile-walk[data-ready="true"]')
  const frames = await companion.evaluate(() => new Promise(resolve => {
    const result = {}, start = performance.now()
    function tick() {
      const canvas = document.querySelector('.profile-walk[data-ready="true"]')
      if (canvas) result[canvas.dataset.frame] ??= canvas.toDataURL()
      if (Object.keys(result).length === 8 || performance.now() - start > 2000) resolve(result)
      else requestAnimationFrame(tick)
    }
    tick()
  }))
  if (Object.keys(frames).length !== 8) throw new Error('Not all walking frames were captured')
  const strips = await Promise.all([0, 2, 4, 6].map(async index => ({ input: await sharp(Buffer.from(frames[index].split(',')[1], 'base64')).resize(250, 362).png().toBuffer(), left: index / 2 * 270 + 15, top: 20 })))
  await sharp({ create: { width: 1080, height: 400, channels: 4, background: '#e5eeea' } }).composite(strips).png().toFile('docs/media/walking-steps.png')
  const bubble = app.windows().find(p => p.url().endsWith('/bubble'))
  await bubble.waitForSelector('[data-phase="asking"]', { state: 'attached' })
  await bubble.getByRole('button', { name: 'Dismiss reminder' }).click()
  await companion.waitForSelector('[data-phase="hidden"]', { state: 'attached' })
  await settings.evaluate(() => window.buddy.closeSettings())
  if (!process.env.HYDROBUDDY_FFMPEG) return
  console.log('READY: settings are hidden. Put Google or VS Code on the primary display, then create .cache/start-demo.txt.')
  for (let i = 0; i < 600 && !fs.existsSync('.cache/start-demo.txt'); i++) await delay(500)
  if (!fs.existsSync('.cache/start-demo.txt')) throw new Error('Recording was not started')
  const { bounds, scaleFactor } = display
  // Desktop Duplication captures the composited transparent windows on Windows.
  // The operator checks the output index against the primary display first.
  const capture = process.env.HYDROBUDDY_DDA_OUTPUT !== undefined
    ? ['-f', 'lavfi', '-i', `ddagrab=output_idx=${Number(process.env.HYDROBUDDY_DDA_OUTPUT)}:framerate=30:draw_mouse=1`, '-vf', 'hwdownload,format=bgra,scale=1920:-2']
    : ['-f', 'gdigrab', '-framerate', '30', '-draw_mouse', '1', '-offset_x', String(Math.round(bounds.x * scaleFactor)), '-offset_y', String(Math.round(bounds.y * scaleFactor)), '-video_size', `${Math.round(bounds.width * scaleFactor)}x${Math.round(bounds.height * scaleFactor)}`, '-i', 'desktop', '-vf', 'scale=1920:-2']
  const args = ['-y', '-hide_banner', '-loglevel', 'warning', ...capture, '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p', '.cache/hydrobuddy-demo-raw.mp4']
  recording = spawn(process.env.HYDROBUDDY_FFMPEG, args, { windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] })
  recording.stderr.on('data', data => process.stderr.write(data))
  const stopped = new Promise((resolve, reject) => { recording.on('error', reject); recording.on('exit', code => code === 0 ? resolve() : reject(new Error(`Capture exited ${code}`))) })
  await delay(2000)
  await settings.evaluate(() => window.buddy.testReminder())
  await bubble.waitForSelector('[data-phase="asking"]', { state: 'attached' })
  console.log('ASKING: click Yes in the desktop bubble now.')
  if (process.env.HYDROBUDDY_DEMO_AUTO_YES === '1') {
    // Exercise the real renderer button using Playwright input. Useful when
    // native UI Automation coordinates are unreliable with mixed display DPI.
    await delay(2500)
    await bubble.getByRole('button', { name: 'Yes 💧', exact: true }).hover()
    await delay(500)
    await bubble.getByRole('button', { name: 'Yes 💧', exact: true }).click()
  }
  await companion.waitForSelector('[data-phase="positive"]', { state: 'attached', timeout: 35000 })
  console.log('YES recorded')
  await companion.waitForSelector('[data-phase="hidden"]', { state: 'attached' })
  await delay(1800)
  recording.stdin.write('q\n')
  await stopped
  recording = null
  console.log('Recording complete: .cache/hydrobuddy-demo-raw.mp4')
}
run().catch(error => { console.error(error); process.exitCode = 1 }).finally(async () => { if (recording) recording.stdin.write('q\n'); if (app) await app.close() })
