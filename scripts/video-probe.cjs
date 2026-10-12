const {_electron}=require('playwright'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url')
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE
async function run(){
 fs.writeFileSync('test-results/video-probe.html','<!doctype html><video muted preload="auto"></video>')
 const app=await _electron.launch({args:[path.resolve('scripts/video-probe-main.cjs')],env})
 try{
 const page=await app.firstWindow()
 const meta=await page.evaluate(url=>new Promise((resolve,reject)=>{const v=document.querySelector('video');v.onloadedmetadata=()=>resolve({duration:v.duration,width:v.videoWidth,height:v.videoHeight});v.onerror=()=>reject(v.error.message);v.src=url}),pathToFileURL(process.argv[2]).href)
 console.log(meta)
 const times=process.argv.slice(4).map(Number)
 for(const time of times.length?times:[1,meta.duration/2]){
 const data=await page.evaluate(t=>new Promise(resolve=>{const v=document.querySelector('video');v.onseeked=()=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);resolve(c.toDataURL('image/png').split(',')[1])};v.currentTime=t}),time)
 fs.writeFileSync(`test-results/${process.argv[3]}-${time.toFixed(2)}.png`,Buffer.from(data,'base64'))
 }
 }finally{await app.close()}
}
run().catch(e=>{console.error(e);process.exitCode=1})
