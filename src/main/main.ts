import { app, BrowserWindow, ipcMain, powerMonitor, screen, dialog, type IpcMainInvokeEvent, type IpcMainEvent } from 'electron'
import { PreferenceStore } from './storage'
import { ReminderManager } from './reminderManager'
import { makeWindow, loadWindow, positionCompanion, positionBubble } from './windows'
import { createTray } from './tray'
import { validatePreferences } from '../shared/preferences'
import type { AppState, BubbleContent } from '../shared/api'
import { validateBubble } from '../shared/bubble'
import { AvatarAssets } from './avatarAssets'
import { join } from 'node:path'
import { createStartupController } from './startup'
import { createAppMenu } from './menu'

// A test profile never touches the person's real preferences or auto-start setting.
if (process.env.HYDROBUDDY_TEST_DATA) app.setPath('userData', process.env.HYDROBUDDY_TEST_DATA)
const fastMode = !app.isPackaged && process.argv.includes('--fast-reminders')
let quitting = false
if (!app.requestSingleInstanceLock()) app.quit()
else {
  let settings: BrowserWindow | undefined
  app.on('second-instance', () => { settings?.show(); settings?.focus() })
  app.on('before-quit', () => { quitting = true })
  app.on('window-all-closed', () => { /* Tray owns the lifetime of this application. */ })
  app.whenReady().then(async () => {
    if (process.platform === 'win32') app.setAppUserModelId('com.hydrobuddy.desktop')
    const store = new PreferenceStore(app.getPath('userData'))
    const avatars = new AvatarAssets(app.getPath('userData'))
    let preferences = store.read()
    const suppliedAvatar = () => avatars.import(join(__dirname, process.env.ELECTRON_RENDERER_URL ? '../../src/renderer/public/welcome-buddy.png' : '../renderer/welcome-buddy.png'), 'supplied-v1')
    // Explicit local testing mode uses the supplied character and the normal local profile.
    if (!app.isPackaged && process.argv.includes('--demo-avatar')) {
      const asset = await suppliedAvatar()
      preferences = { ...preferences, avatar: { ...preferences.avatar, source: 'custom', frontAsset: asset.id, sideAsset: null }, onboardingCompleted: true }
      store.write(preferences)
    }
    const startup = createStartupController(app)
    const startupSupported = startup.supported
    const startedHidden = startup.startedHidden(process.argv)
    if (startupSupported) preferences.launchAtStartup = startup.read()!.openAtLogin
    const companion = makeWindow(true)
    // The artwork never intercepts clicks. The small speech window always does,
    // avoiding Windows click-through races when the pointer enters a button.
    const bubble = makeWindow(true)
    bubble.setTitle('HydroBuddy reminder')
    bubble.setIgnoreMouseEvents(false)
    positionBubble(bubble, 180)
    let bubbleContent: BubbleContent | null = null
    const hideBubble = () => { bubbleContent = null; bubble.webContents.send('bubble:changed', null); bubble.hide() }
    settings = makeWindow(false)
    const state = (): AppState => ({ preferences, active: manager.active, nextReminderAt: manager.nextReminderAt, fastMode, startupSupported })
    const broadcast = () => { for (const win of [settings, companion]) if (win && !win.isDestroyed()) win.webContents.send('state:changed', state()) }
    const manager = new ReminderManager(() => { positionCompanion(companion); companion.setAlwaysOnTop(true, 'floating'); companion.showInactive() }, () => { hideBubble(); companion.hide() }, broadcast)
    const configure = () => manager.configure(preferences.remindersEnabled && preferences.onboardingCompleted, fastMode ? 10000 : preferences.reminderInterval * 60000)
    const showSettings = () => { settings?.show(); settings?.focus() }
    createAppMenu(showSettings)
    const test = () => { if (!preferences.onboardingCompleted) showSettings(); else manager.start() }
    const tray = createTray({ show: test, settings: showSettings, toggle: () => {
      try { const next = { ...preferences, remindersEnabled: !preferences.remindersEnabled }; store.write(next); preferences = next; configure(); tray.update(next.remindersEnabled) }
      catch { dialog.showErrorBox('Could not save your settings', 'Please check that your local preferences folder is writable.') }
    }, quit: () => app.quit() })
    tray.update(preferences.remindersEnabled)
    const trusted = (event: IpcMainInvokeEvent | IpcMainEvent, role?: 'settings' | 'companion' | 'bubble') => {
      const target = role === 'settings' ? settings : role === 'companion' ? companion : role === 'bubble' ? bubble : undefined
      if (event.senderFrame !== event.sender.mainFrame || (target ? event.sender !== target.webContents : ![settings?.webContents, companion.webContents, bubble.webContents].includes(event.sender))) throw new Error('Untrusted sender')
    }
    ipcMain.handle('state:get', event => { trusted(event); return state() })
    ipcMain.handle('preferences:save', async (event, input: unknown) => {
      trusted(event, 'settings'); const next = validatePreferences(input)
      if (next.avatar.source === 'custom' && !(await avatars.read(next.avatar.frontAsset!))) throw new Error('Your avatar file is missing. Please import it again.')
      if (next.avatar.sideAsset && !(await avatars.read(next.avatar.sideAsset))) throw new Error('Your side-view file is missing. Please import it again or remove the side view.')
      if (next.launchAtStartup !== preferences.launchAtStartup) {
        next.launchAtStartup = startup.setEnabled(next.launchAtStartup)
      }
      store.write(next)
      const previousAssets = [preferences.avatar.frontAsset, preferences.avatar.sideAsset]
      preferences = next; configure(); tray.update(preferences.remindersEnabled); broadcast()
      for (const id of previousAssets) if (id && ![next.avatar.frontAsset, next.avatar.sideAsset].includes(id)) await avatars.remove(id)
      return state()
    })
    ipcMain.handle('reminder:test', event => { trusted(event, 'settings'); test() })
    let importing = false
    ipcMain.handle('avatar:import', async event => {
      trusted(event, 'settings')
      if (importing) return null
      importing = true
      try {
        const result = await dialog.showOpenDialog(settings!, { title: 'Choose your avatar', buttonLabel: 'Use this image', properties: ['openFile'], filters: [{ name: 'Avatar images', extensions: ['png', 'webp', 'jpg', 'jpeg'] }] })
        if (result.canceled || !result.filePaths[0]) return null
        return await avatars.import(result.filePaths[0])
      } finally { importing = false }
    })
    ipcMain.handle('avatar:read', (event, id: unknown) => { trusted(event); if (typeof id !== 'string') throw new Error('Invalid avatar reference'); return avatars.read(id) })
    ipcMain.handle('avatar:supplied', event => { trusted(event, 'settings'); return suppliedAvatar() })
    ipcMain.handle('avatar:drop', (event, bytes: unknown) => {
      trusted(event, 'settings')
      if (!(bytes instanceof Uint8Array) || bytes.byteLength > 8 * 1024 * 1024) throw new Error('Choose a PNG or WebP smaller than 8 MB.')
      return avatars.importBytes(Buffer.from(bytes))
    })
    ipcMain.on('reminder:finished', event => { trusted(event, 'companion'); if (manager.active) manager.finish() })
    ipcMain.on('settings:close', event => { trusted(event, 'settings'); settings?.hide() })
    ipcMain.handle('bubble:get', event => { trusted(event, 'bubble'); return bubbleContent })
    ipcMain.on('bubble:show', (event, value: unknown) => {
      try {
        trusted(event, 'companion')
        const content = validateBubble(value)
        if (!content || !manager.active) { hideBubble(); return }
        bubbleContent = content
        bubble.webContents.send('bubble:changed', bubbleContent)
        positionBubble(bubble); bubble.setAlwaysOnTop(true, 'floating'); bubble.showInactive()
      } catch { /* Ignore invalid requests from a stale renderer. */ }
    })
    ipcMain.on('bubble:answer', (event, action: unknown) => {
      try {
        trusted(event, 'bubble')
        if (!manager.active || !bubbleContent || !['yes','no','dismiss'].includes(String(action))) return
        if (action !== 'dismiss' && bubbleContent.phase !== 'asking') return
        companion.webContents.send('bubble:action', action)
        if (action === 'dismiss') hideBubble()
      } catch { /* Reject unauthorized actions. */ }
    })
    ipcMain.on('companion:bounds', (event, value: unknown) => {
      try {
        trusted(event, 'bubble')
        const height = (value as { height?: number } | null)?.height
        if (typeof height === 'number' && Number.isFinite(height) && height >= 60 && height <= 260) positionBubble(bubble, Math.ceil(height))
      }
      catch { /* Ignore malformed or stale rectangles without interrupting a reminder. */ }
    })
    settings.on('close', event => { if (!quitting) { event.preventDefault(); settings?.hide() } })
    companion.webContents.on('render-process-gone', () => { manager.finish(); void companion.reload() })
    const reposition = () => { positionCompanion(companion); positionBubble(bubble) }
    screen.on('display-metrics-changed', reposition)
    screen.on('display-added', reposition)
    screen.on('display-removed', reposition)
    bubble.webContents.on('render-process-gone', () => { manager.finish(); void bubble.reload() })
    powerMonitor.on('suspend', () => { if (manager.active) manager.finish() })
    powerMonitor.on('resume', () => manager.resume())
    app.on('activate', showSettings)
    app.on('will-quit', () => { manager.dispose(); tray.tray.destroy() })
    await Promise.all([loadWindow(companion, '/companion'), loadWindow(settings, '/settings'), loadWindow(bubble, '/bubble')])
    configure()
    if (!preferences.onboardingCompleted || !startedHidden) showSettings()
  }).catch(error => { dialog.showErrorBox('HydroBuddy could not start', String(error)); app.quit() })
}
