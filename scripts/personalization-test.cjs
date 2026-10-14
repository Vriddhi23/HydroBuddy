const {_electron:electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path')
const profile=path.resolve('.test-data','personalize-'+Date.now()),env={...process.env,HYDROBUDDY_TEST_DATA:profile};delete env.ELECTRON_RUN_AS_NODE
let app;const errors=[]
async function launch(){app=await electron.launch({args:[path.resolve('out/main/main.js')],env});for(let i=0;i<100&&!['settings','companion','bubble'].every(k=>app.windows().some(p=>p.url().endsWith('/'+k)));i++)await new Promise(r=>setTimeout(r,100));for(const p of app.windows())p.on('pageerror',e=>errors.push(e.message));return Object.fromEntries(['settings','companion','bubble'].map(k=>[k,app.windows().find(p=>p.url().endsWith('/'+k))]))}
const phase=(p,s)=>p.waitForSelector(`[data-phase="${s}"]`,{state:'attached',timeout:16000})
async function run(){
 let {settings,companion,bubble}=await launch();await settings.waitForSelector('.setup-wizard[open]');await settings.waitForTimeout(1000);await settings.screenshot({path:'test-results/setup-gender.png'})
 await settings.getByRole('button',{name:'Choose Male',exact:true}).click()
 await settings.locator('.setup-wizard').getByRole('button',{name:'Sage t-shirt',exact:true}).click();await settings.waitForTimeout(300);await settings.screenshot({path:'test-results/setup-shirt.png'})
 await settings.getByRole('button',{name:'Continue',exact:true}).click();await settings.locator('.setup-wizard').getByLabel('Custom jeans color').fill('#bc9273');await settings.getByRole('button',{name:'Continue',exact:true}).click()
 const wizard=settings.locator('.setup-wizard');await settings.waitForTimeout(400);await settings.screenshot({path:'test-results/setup-preview.png'})
 await wizard.getByRole('button',{name:'Preview walk',exact:true}).click();await settings.waitForSelector('.setup-wizard [data-preview-phase="entering"]');await settings.waitForTimeout(2300);await settings.screenshot({path:'test-results/male-walk-colors.png'});await wizard.getByRole('button',{name:'Stop preview',exact:true}).click()
 await settings.getByRole('button',{name:'Save my HydroBuddy',exact:true}).click();await settings.waitForSelector('.setup-wizard',{state:'detached'});assert.equal((await settings.evaluate(()=>window.buddy.getState())).preferences.avatar.pantsColor,'#bc9273')
 await settings.getByRole('button',{name:'Test Reminder',exact:true}).click();await phase(companion,'asking');await phase(bubble,'asking');await bubble.getByRole('button',{name:'Not yet',exact:true}).click();await phase(companion,'negative');assert.equal(await companion.locator('.supplied-avatar-art').getAttribute('data-expression'),'sad');await companion.screenshot({path:'test-results/male-sad.png',omitBackground:true});await phase(companion,'hidden')
 assert(await app.evaluate(({BrowserWindow})=>{const a=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('/companion')),b=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('/bubble'));return !a.isVisible()&&!b.isVisible()&&!a.isFocusable()&&!b.isFocusable()}))
 await settings.getByRole('button',{name:'Test Reminder',exact:true}).click();await phase(bubble,'greeting');await bubble.getByRole('button',{name:'Dismiss reminder',exact:true}).click();await phase(companion,'exiting');await phase(companion,'hidden')
 await settings.getByRole('button',{name:'Test Reminder',exact:true}).click();await phase(bubble,'asking');await bubble.getByRole('button',{name:'Yes 💧',exact:true}).click();await phase(companion,'positive');await phase(companion,'hidden')
 // Restart preserves the chosen character and colors; retired face controls stay absent.
 await app.close();({settings,companion,bubble}=await launch());await settings.waitForSelector('.studio');assert.equal(await settings.locator('.setup-wizard').count(),0)
 const saved=await settings.evaluate(()=>window.buddy.getState());assert.equal(saved.preferences.avatar.gender,'male');assert.equal(saved.preferences.avatar.pantsColor,'#bc9273');assert.equal(saved.preferences.avatar.shirtColor,'#80a98e');assert.equal('faceAsset' in saved.preferences.avatar,false)
 assert.equal(await settings.getByText('A little more you').count(),0);assert.equal(await settings.getByRole('button',{name:'Add your own face',exact:true}).count(),0)
 await settings.getByRole('button',{name:'Female',exact:true}).click();await settings.getByRole('button',{name:'Lilac t-shirt',exact:true}).click();await settings.getByLabel('Custom jeans color').fill('#536c92');await settings.getByRole('button',{name:'Save changes',exact:true}).click();await settings.waitForTimeout(500);await settings.screenshot({path:'test-results/female-custom-colors.png'})
 await settings.getByRole('button',{name:'About HydroBuddy',exact:true}).click();await settings.getByRole('button',{name:'Close About',exact:true}).click()
 await settings.getByRole('button',{name:'Your routine',exact:true}).click();await settings.getByRole('switch',{name:'Enable reminders',exact:true}).click();await settings.getByRole('button',{name:'45 minutes',exact:true}).click();await settings.getByRole('button',{name:'Save changes',exact:true}).click();await settings.waitForTimeout(200);assert.equal((await settings.evaluate(()=>window.buddy.getState())).nextReminderAt,null)
 await settings.getByRole('button',{name:'Your buddy',exact:true}).click();await settings.getByRole('button',{name:'Change avatar',exact:false}).click();await settings.getByRole('button',{name:'Close setup',exact:true}).click();assert.equal(await settings.locator('.setup-wizard').count(),0)
 assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: wizard, colors, male walk, no/yes/dismiss, color persistence and removed face controls, dialog controls and pause.');await app.close()
}
run().catch(async e=>{console.error(e);if(app)await app.close();process.exitCode=1})




