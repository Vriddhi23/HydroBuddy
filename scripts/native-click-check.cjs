const { _electron: electron } = require('playwright')
const path = require('node:path'), fs = require('node:fs')
const env = {...process.env, HYDROBUDDY_TEST_DATA:path.resolve('.test-data','native-click-'+Date.now())};delete env.ELECTRON_RUN_AS_NODE
let app
async function run(){
 app=await electron.launch({args:[path.resolve('out/main/main.js'),'--demo-avatar'],env})
 for(let i=0;i<100&&!app.windows().some(p=>p.url().includes('/settings'));i++)await new Promise(r=>setTimeout(r,100))
 const settings=app.windows().find(p=>p.url().includes('/settings')),companion=app.windows().find(p=>p.url().includes('/companion'))
 await settings.waitForSelector('[data-renderer="supplied-motion"]')
 await app.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.setTitle(w.webContents.getURL().includes('/companion')?'HydroBuddy reminder click test':'HydroBuddy native click test')})
 console.log('READY: waiting for a real Windows Test Reminder and Not yet click')
 await companion.waitForSelector('[data-phase="negative"]',{state:'attached',timeout:240000})
 const expression=await companion.locator('.supplied-avatar-art').getAttribute('data-expression')
 await companion.screenshot({path:'test-results/native-not-yet.png',omitBackground:true})
 if(expression!=='sad')throw Error('Sad expression missing')
 await companion.waitForSelector('[data-phase="hidden"]',{state:'attached'})
 const state=await settings.evaluate(()=>window.buddy.getState())
 if(state.active||!state.nextReminderAt)throw Error('Schedule did not resume')
 fs.writeFileSync('test-results/native-click-result.json',JSON.stringify({nativeNotYet:true,expression,scheduleResumed:true,date:new Date().toISOString()},null,2))
 console.log('PASS: real native Not yet click produced sad reaction, departure and resumed schedule')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(app)await app.close().catch(()=>{})})
