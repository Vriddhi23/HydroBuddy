import { BrowserWindow, screen, app } from 'electron'
import { join } from 'node:path'
export function iconPath() { return join(app.getAppPath(), 'resources', 'icon.png') }
export function makeWindow(companion: boolean) {
  const area = screen.getPrimaryDisplay().workArea
  const win = new BrowserWindow({
    width: companion ? 400 : Math.min(1060, area.width - 32), height: companion ? 470 : Math.min(840, area.height - 32), minWidth: companion ? undefined : Math.min(820, area.width - 32), minHeight: companion ? undefined : Math.min(700, area.height - 32),
    show: false, title: 'HydroBuddy', icon: iconPath(), backgroundColor: companion ? '#00000000' : '#f9faf7',
    transparent: companion, frame: !companion, resizable: !companion, maximizable: !companion, fullscreenable: !companion,
    skipTaskbar: companion, alwaysOnTop: companion, hasShadow: !companion, focusable: !companion, autoHideMenuBar: true,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false, webSecurity: true }
  })
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-navigate', event => event.preventDefault())
  win.webContents.on('will-attach-webview', event => event.preventDefault())
  if (companion) {
    positionCompanion(win); win.setIgnoreMouseEvents(true, { forward: true })
    if (process.platform === 'darwin') win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }
  return win
}
export async function loadWindow(win: BrowserWindow, route: string) {
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) await win.loadURL(`${process.env.ELECTRON_RENDERER_URL}#${route}`)
  else await win.loadFile(join(__dirname, '../renderer/index.html'), { hash: route })
}
export function positionCompanion(win: BrowserWindow) {
  const area = screen.getPrimaryDisplay().workArea
  const width = Math.min(400, area.width), height = Math.min(470, area.height)
  win.setBounds({ x: area.x + area.width - width, y: area.y + area.height - height, width, height })
}
export function positionBubble(win: BrowserWindow, height = win.getBounds().height) {
  const area = screen.getPrimaryDisplay().workArea
  const width = Math.min(350, area.width)
  win.setBounds({ x: area.x + area.width - width - Math.min(26, area.width - width), y: area.y + Math.max(0, area.height - 265 - height), width, height })
}
