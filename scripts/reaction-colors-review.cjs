// Render the production pose registration and painter together, for visual QA.
const { _electron: electron } = require('playwright')
const { build } = require('esbuild')
const path = require('node:path')
const assert = require('node:assert/strict')
let app
async function run() {
  const bundle = await build({ stdin: { contents: "export {colorClothes} from './src/renderer/animations/avatarPainter'; export {reactionArtwork} from './src/renderer/animations/reactionArtwork'", resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', globalName: 'colorReview' })
  const env = { ...process.env, HYDROBUDDY_TEST_DATA: path.resolve('.test-data', `reaction-colors-${Date.now()}`) }
  delete env.ELECTRON_RUN_AS_NODE
  app = await electron.launch({ args: [path.resolve('out/main/main.js'), '--demo-avatar'], env })
  for (let attempt = 0; attempt < 100 && !app.windows().some(page => page.url().endsWith('/settings')); attempt++) await new Promise(resolve => setTimeout(resolve, 100))
  const settings = app.windows().find(page => page.url().endsWith('/settings'))
  assert(settings, 'Settings window loaded')
  await settings.waitForSelector('.studio')
  await settings.evaluate(bundle.outputFiles[0].text)
  for (const shirtColor of ['#6ba991', '#dc9da6', '#414654']) {
    const count = await settings.evaluate(async shirtColor => {
      document.querySelector('#color-review')?.remove()
      const panel = document.createElement('div')
      panel.id = 'color-review'
      panel.style.cssText = 'position:fixed;inset:0;background:#e5eeea;z-index:9999;display:grid;grid-template-columns:repeat(4,1fr);overflow:auto'
      document.body.append(panel)
      for (const male of [false, true]) {
        const image = new Image()
        image.src = male ? './male-v1/reactions.png' : './buddy-motion-atlas.png'
        await image.decode()
        for (let index = 0; index < 4; index++) {
          const art = colorReview.reactionArtwork(male, index)
          const canvas = document.createElement('canvas')
          canvas.width = 500; canvas.height = 724
          canvas.style.cssText = 'width:100%;height:285px;object-fit:contain'
          const ctx = canvas.getContext('2d')
          ctx.scale(2, 2)
          ctx.drawImage(image, index * art.cellWidth, art.sourceY, art.cellWidth, art.cellHeight, art.dx, art.dy, art.cellWidth * art.scale, art.cellHeight * art.scale)
          colorReview.colorClothes(canvas, { shirtColor, pantsColor: '#99c5e5' }, art.regions)
          const cell = document.createElement('div')
          cell.append(canvas, `${male ? 'Male' : 'Female'} ${['idle', 'sad', 'wave', 'celebrate'][index]}`)
          panel.append(cell)
        }
      }
      return panel.querySelectorAll('canvas').length
    }, shirtColor)
    assert.equal(count, 8)
    await settings.screenshot({ path: `test-results/reaction-colors-${shirtColor.slice(1)}.png` })
  }
  console.log('Rendered all eight reaction poses in green, rose and charcoal with the production painter.')
}
run().catch(error => { console.error(error); process.exitCode = 1 }).finally(async () => { if (app) await app.close() })
