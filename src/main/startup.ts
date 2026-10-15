import type { App, LoginItemSettings, LoginItemSettingsOptions, Settings } from 'electron'

type LoginAPI = {
  isPackaged: App['isPackaged']
  getLoginItemSettings(options?: LoginItemSettingsOptions): Pick<LoginItemSettings, 'openAtLogin' | 'wasOpenedAtLogin' | 'status'>
  setLoginItemSettings(settings: Settings): void
}

export function createStartupController(application: LoginAPI, platform = process.platform, executable = process.execPath) {
  const supported = application.isPackaged && (platform === 'win32' || platform === 'darwin')
  // macOS registers the application bundle. Command-line startup arguments are Windows-only.
  const options = platform === 'win32' ? { path: executable, args: ['--hidden'] } : {}
  const read = () => supported ? application.getLoginItemSettings(options) : null
  return {
    supported,
    read,
    startedHidden: (args: string[]) => args.includes('--hidden') || (platform === 'darwin' && read()?.wasOpenedAtLogin === true),
    setEnabled(enabled: boolean) {
      if (!supported) throw new Error('Start at login is available after installation.')
      application.setLoginItemSettings({ ...options, openAtLogin: enabled })
      const result = read()!
      if (enabled && platform === 'darwin' && result.status === 'requires-approval') throw new Error('Allow HydroBuddy in System Settings → General → Login Items, then save again.')
      if (result.openAtLogin !== enabled) throw new Error(platform === 'darwin'
        ? 'The system could not update startup. Install HydroBuddy in Applications and check Login Items. Test builds may require a signed app.'
        : 'The system could not update startup. Please check HydroBuddy in Windows Settings → Apps → Startup.')
      return result.openAtLogin
    }
  }
}
