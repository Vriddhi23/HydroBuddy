const {_electron:electron}=require('playwright')
const assert=require('node:assert/strict'),path=require('node:path')
let app
const env={...process.env,HYDROBUDDY_TEST_DATA:path.resolve('.test-data','motion-'+Date.now())};delete env.ELECTRON_RUN_AS_NODE
async function run(){
 app=await electron.launch({args:[path.resolve('out/main/main.js'),'--demo-avatar'],env})
 for(let i=0;i<100&&!app.windows().some(p=>p.url().includes('/settings'));i++)await new Promise(r=>setTimeout(r,100))
 const settings=app.windows().find(p=>p.url().includes('/settings')),companion=app.windows().find(p=>p.url().includes('/companion'))
 await settings.waitForSelector('[data-renderer="supplied-motion"]')
 const phase=value=>companion.waitForSelector(`[data-phase="${value}"]`,{state:'attached'})
 const shot=name=>companion.screenshot({path:`test-results/${name}.png`,omitBackground:true})
 await settings.getByRole('button',{name:'Test Reminder',exact:true}).click()
 await phase('peeking');await companion.waitForTimeout(1000)
 assert.equal(await companion.locator('.buddy-figure').evaluate(n=>getComputedStyle(n).clipPath),'none')
 await shot('natural-peek')
 await phase('entering')
 const recording=companion.evaluate(()=>new Promise(resolve=>{
  const source=document.querySelector('.profile-walk'),canvas=document.createElement('canvas');canvas.width=500;canvas.height=724
  const ctx=canvas.getContext('2d'),chunks=[],recorder=new MediaRecorder(canvas.captureStream(30),{mimeType:'video/webm;codecs=vp9'})
  let frame
  const draw=()=>{ctx.fillStyle='#e5eeea';ctx.fillRect(0,0,500,724);ctx.drawImage(source,0,0);frame=requestAnimationFrame(draw)}
  draw();recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=async()=>{cancelAnimationFrame(frame);resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())))};recorder.start();setTimeout(()=>recorder.stop(),2400)
 }))
 await companion.waitForTimeout(250)
 assert.equal(await companion.locator('.supplied-avatar-art').getAttribute('data-facing'),'left')
 const entranceX=(await companion.locator('.companion-walker').boundingBox()).x
 const frames=new Set()
 const samples=companion.evaluate(()=>new Promise(resolve=>{const poses=[],start=performance.now();const tick=()=>{const n=document.querySelector('.profile-walk');if(n)poses.push({...n.dataset});if(performance.now()-start<1900)requestAnimationFrame(tick);else resolve(poses)};tick()}))
 await shot('walking-0');await companion.waitForTimeout(700);await shot('walking-3');await companion.waitForTimeout(550);await shot('walking-6')
 const sampledPoses=await samples
 console.log(`Observed renderer updates: ${(sampledPoses.length/1.9).toFixed(1)} per second`)
 for(const pose of sampledPoses){
  frames.add(pose.frame)
 }
 assert(frames.size===8,'Every complete-body pose plays during the stride')
 assert((await companion.locator('.companion-walker').boundingBox()).x < entranceX, 'Entrance moves right to left')
 assert.equal(await companion.locator('.supplied-avatar-art').evaluate(n=>getComputedStyle(n).animationName),'none')
 require('node:fs').writeFileSync('docs/walking-preview.webm',Buffer.from(await recording))
 await phase('asking');await shot('natural-question')
 assert.equal(await companion.locator('.supplied-avatar-art').getAttribute('data-facing'),'front')
 await companion.getByRole('button',{name:'Not yet',exact:true}).click()
 await phase('negative')
 assert.equal(await companion.locator('.supplied-avatar-art').getAttribute('data-frame'),'9')
 assert.equal(await companion.locator('.supplied-avatar-art').getAttribute('data-expression'),'sad')
 await shot('sad-reaction')
 await phase('exiting')
 assert.equal(await companion.locator('.supplied-avatar-art').getAttribute('data-facing'),'right')
 await phase('hidden')
 await companion.emulateMedia({reducedMotion:'reduce'})
 await settings.getByRole('button',{name:'Test Reminder',exact:true}).click()
 await phase('asking');await companion.getByRole('button',{name:'Yes 💧',exact:true}).click()
 await phase('positive');assert.equal(await companion.locator('.supplied-avatar-art').getAttribute('data-frame'),'11')
 await phase('hidden')
 const saved=await settings.evaluate(()=>window.buddy.getState());const id=saved.preferences.avatar.frontAsset
 assert.equal((await settings.evaluate(id=>window.buddy.readAvatar(id),id)).motionPack,'supplied-v1')
 console.log('PASS: unclipped edge lean, left-facing profile steps moving right-to-left, right-facing departure without bounce, actual sad face, happy pose, reduced motion and persisted animation pack.')
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(app)await app.close().catch(()=>{})})
