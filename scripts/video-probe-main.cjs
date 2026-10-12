const { app, BrowserWindow } = require('electron')
app.whenReady().then(async()=>{
 const window=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}})
 await window.loadFile(require('node:path').resolve('test-results/video-probe.html'))
})
