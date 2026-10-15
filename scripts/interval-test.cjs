const { _electron: electron } = require('playwright')
const assert = require('node:assert/strict')
const path = require('node:path')
const env = { ...process.env, HYDROBUDDY_TEST_DATA: path.resolve('.test-data', 'interval-'+Date.now()) }
delete env.ELECTRON_RUN_AS_NODE
let app
const errors = []
async function launch() {
  app = await electron.launch({ args: [path.resolve('out/main/main.js')], env })
  const settings = await app.firstWindow()
  // Window creation order is not a renderer readiness guarantee.
  for (let i=0;i<100;i++) {
    const page=app.windows().find(p=>p.url().endsWith('/settings'))
    if(page) { page.on('pageerror',e=>errors.push(e.message)); await page.waitForSelector('.studio'); return page }
    await settings.waitForTimeout(100)
  }
  throw new Error('Settings did not load')
}
async function run() {
  let page = await launch()
  await page.getByRole('button',{name:'Choose Female',exact:true}).click()
  await page.getByRole('button',{name:'Continue',exact:true}).click()
  await page.getByRole('button',{name:'Continue',exact:true}).click()
  await page.getByRole('button',{name:'Save my HydroBuddy',exact:true}).click()
  await page.getByRole('button',{name:'Your routine',exact:true}).click()
  for (const minutes of [10,20]) {
    await page.getByRole('button',{name:minutes+' minutes',exact:true}).click()
    await page.getByRole('button',{name:'Save changes',exact:true}).click()
    await page.waitForTimeout(150)
    const state=await page.evaluate(()=>window.buddy.getState())
    assert.equal(state.preferences.reminderInterval,minutes)
    assert.equal(await page.locator('.footer-status strong').innerText(),`Next visit in ${minutes} min`)
    const remaining=state.nextReminderAt-Date.now()
    assert(remaining>minutes*60000-5000 && remaining<=minutes*60000)
  }
  const input=page.getByRole('spinbutton',{name:'Custom reminder interval in minutes'})
  await input.fill('37')
  await page.getByRole('button',{name:'Save changes',exact:true}).click()
  await page.waitForTimeout(150)
  assert.equal(await page.locator('.footer-status strong').innerText(),'Next visit in 37 min')
  for (const invalid of ['', '0', '-1', '1.5', '1441']) {
    await input.fill(invalid)
    assert.equal(await input.getAttribute('aria-invalid'),'true')
    assert(await page.getByRole('button',{name:'Save changes',exact:true}).isDisabled())
    assert.equal((await page.evaluate(()=>window.buddy.getState())).preferences.reminderInterval,37)
  }
  await input.fill('37')
  await page.locator('.interval-field').scrollIntoViewIfNeeded()
  await page.screenshot({path:'test-results/custom-reminder-interval.png'})
  await app.close(); page=await launch()
  await page.getByRole('button',{name:'Your routine',exact:true}).click()
  assert.equal(await page.getByRole('spinbutton',{name:'Custom reminder interval in minutes'}).inputValue(),'37')
  const enabled=page.getByRole('switch',{name:'Enable reminders',exact:true})
  await enabled.click()
  assert.match(await page.locator('#reminder-help').innerText(),/^Off:/)
  await page.getByRole('button',{name:'Save changes',exact:true}).click()
  await page.waitForTimeout(150)
  assert.equal((await page.evaluate(()=>window.buddy.getState())).nextReminderAt,null)
  await page.getByRole('button',{name:'Test Reminder',exact:true}).click()
  const bubble=app.windows().find(p=>p.url().endsWith('/bubble'))
  await bubble.getByRole('button',{name:'Dismiss reminder',exact:true}).click()
  const companion=app.windows().find(p=>p.url().endsWith('/companion'))
  await companion.waitForSelector('[data-phase="hidden"]',{state:'attached',timeout:16000})
  assert.equal((await page.evaluate(()=>window.buddy.getState())).nextReminderAt,null)
  await enabled.click()
  assert.match(await page.locator('#reminder-help').innerText(),/^On:/)
  await page.getByRole('button',{name:'Save changes',exact:true}).click()
  await page.waitForTimeout(150)
  assert((await page.evaluate(()=>window.buddy.getState())).nextReminderAt>Date.now())
  assert.equal(errors.length,0,errors.join('\n'))
  console.log('PASS: 10/20 minute presets, custom interval scheduling and restart persistence, invalid inputs, clear on/off copy, pause and manual test while paused.')
}
run().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{if(app)await app.close().catch(()=>{})})
