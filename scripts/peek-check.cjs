const {_electron:electron}=require('playwright')
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs')
let app
const env={...process.env,HYDROBUDDY_TEST_DATA:path.resolve('.test-data','personal-'+Date.now())};delete env.ELECTRON_RUN_AS_NODE
async function launch(args=[]) {
 app=await electron.launch({args:[path.resolve('out/main/main.js'),...args],env})
 for(let i=0;i<100&&!app.windows().some(p=>p.url().includes('/settings'));i++)await new Promise(r=>setTimeout(r,100))
 const settings=app.windows().find(p=>p.url().includes('/settings')),companion=app.windows().find(p=>p.url().includes('/companion'));await settings.waitForSelector('h1');return {settings,companion}
}
async function run(){
 let {settings,companion}=await launch(['--demo-avatar'])
 await settings.waitForSelector('[data-renderer="supplied-motion"]')
 assert.equal(await settings.locator('.avatar-chooser').count(),0)
 await settings.getByRole('button',{name:'Test Reminder',exact:true}).click()
 await companion.waitForSelector('[data-phase="peeking"]',{state:'attached'})
 await companion.waitForTimeout(850)
 assert.equal(await companion.locator('.buddy-figure').evaluate(n=>getComputedStyle(n).clipPath),'none')
 await companion.screenshot({path:'test-results/custom-peek.png',omitBackground:true})
 await companion.waitForSelector('[data-phase="asking"]',{state:'attached'})
 await companion.screenshot({path:'test-results/custom-companion.png',omitBackground:true})
 await app.close();({settings}=await launch())
 await settings.waitForSelector('[data-renderer="supplied-motion"]')
 await settings.getByRole('button',{name:'Change avatar'}).click()
 await settings.keyboard.press('Escape');assert.equal(await settings.locator('.avatar-chooser').count(),0)
 await settings.getByRole('button',{name:'Change avatar'}).click()
 await settings.locator('.avatar-chooser').evaluate((node,bytes)=>{const d=new DataTransfer();d.items.add(new File([new Uint8Array(bytes)],'mine.png',{type:'image/png'}));node.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:d}))},Array.from(fs.readFileSync('src/renderer/public/welcome-buddy.png')))
 await settings.waitForSelector('.avatar-chooser',{state:'detached'})
 assert.equal(await settings.locator('[data-renderer="custom-flat"]').count(),1)
 console.log('PASS: personal testing mode loads and persists the supplied avatar; final face crop, chooser dismissal, and direct popup drop work.')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(app)await app.close().catch(()=>{})})
