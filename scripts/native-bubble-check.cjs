const {_electron:electron}=require('playwright'),path=require('node:path'),fs=require('node:fs')
const env={...process.env,HYDROBUDDY_TEST_DATA:path.resolve('.test-data','native-bubble-'+Date.now())};delete env.ELECTRON_RUN_AS_NODE
let app
async function run(){
 app=await electron.launch({args:[path.resolve('out/main/main.js'),'--demo-avatar'],env});for(let i=0;i<100&&!['settings','companion','bubble'].every(k=>app.windows().some(p=>p.url().endsWith('/'+k)));i++)await new Promise(r=>setTimeout(r,100))
 const pages=Object.fromEntries(['settings','companion','bubble'].map(k=>[k,app.windows().find(p=>p.url().endsWith('/'+k))]));await pages.settings.waitForSelector('.studio')
 await app.evaluate(({BrowserWindow})=>{for(const w of BrowserWindow.getAllWindows())w.setTitle(w.webContents.getURL().endsWith('/bubble')?'HydroBuddy button verification':w.webContents.getURL().endsWith('/settings')?'HydroBuddy test settings':'HydroBuddy test artwork')})
 await pages.settings.getByRole('button',{name:'Test Reminder',exact:true}).click();await pages.bubble.waitForSelector('[data-phase="asking"]');console.log('READY for native Not yet click')
 await pages.companion.waitForSelector('[data-phase="negative"]',{state:'attached',timeout:45000});console.log('PASS native Not yet');await pages.companion.waitForSelector('[data-phase="hidden"]',{state:'attached'});
 await pages.settings.getByRole('button',{name:'Test Reminder',exact:true}).click();await pages.bubble.waitForSelector('[data-phase="asking"]');console.log('READY for native cross click')
 await pages.companion.waitForSelector('[data-phase="exiting"]',{state:'attached',timeout:44000});await pages.companion.waitForSelector('[data-phase="hidden"]',{state:'attached'});console.log('PASS native dismissal')
 fs.writeFileSync('test-results/native-bubble-result.json',JSON.stringify({nativeNotYet:true,nativeDismiss:true,date:new Date().toISOString()}))
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(app)await app.close()})

