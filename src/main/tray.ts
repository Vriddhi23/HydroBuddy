import { Menu, nativeImage, Tray } from 'electron'
import { iconPath } from './windows'
export function createTray(actions: { show: () => void; settings: () => void; toggle: () => void; quit: () => void }) {
  const tray = new Tray(nativeImage.createFromPath(iconPath()).resize({ width: 24, height: 24 }))
  tray.setToolTip('HydroBuddy · a little sip of self-care')
  tray.on('double-click', actions.settings)
  const update = (enabled: boolean) => tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'HydroBuddy 💧', enabled: false }, { type: 'separator' },
    { label: 'Show HydroBuddy', click: actions.show }, { label: 'Test Reminder', click: actions.show },
    { label: 'Settings', click: actions.settings }, { label: enabled ? 'Pause Reminders' : 'Resume Reminders', click: actions.toggle },
    { type: 'separator' }, { label: 'Quit HydroBuddy', click: actions.quit }
  ]))
  return { tray, update }
}
