import { app, Menu } from 'electron'

export function createAppMenu(showSettings: () => void) {
  if (process.platform !== 'darwin') return
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'HydroBuddy', submenu: [
      { label: 'Settings…', accelerator: 'Cmd+,', click: showSettings },
      { type: 'separator' }, { role: 'services' }, { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' }, { label: 'Quit HydroBuddy', accelerator: 'Cmd+Q', click: () => app.quit() }
    ] },
    { role: 'editMenu' },
    { role: 'windowMenu' }
  ]))
}
