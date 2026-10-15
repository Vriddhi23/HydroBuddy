import { describe, expect, it, vi } from 'vitest'
import { createStartupController } from '../src/main/startup'
import type { LoginItemSettings } from 'electron'

function fixture(platform: NodeJS.Platform, isPackaged = true) {
  const api = {
    isPackaged,
    getLoginItemSettings: vi.fn((): Pick<LoginItemSettings, 'openAtLogin' | 'wasOpenedAtLogin' | 'status'> => ({ openAtLogin: true, wasOpenedAtLogin: false, status: 'enabled' })),
    setLoginItemSettings: vi.fn()
  }
  return { api, startup: createStartupController(api, platform, '/app/HydroBuddy') }
}
describe('platform startup', () => {
  it('matches the Windows startup command when reading and writing', () => {
    const { api, startup } = fixture('win32')
    expect(startup.setEnabled(true)).toBe(true)
    expect(api.setLoginItemSettings).toHaveBeenCalledWith({ path: '/app/HydroBuddy', args: ['--hidden'], openAtLogin: true })
    expect(api.getLoginItemSettings).toHaveBeenCalledWith({ path: '/app/HydroBuddy', args: ['--hidden'] })
    expect(startup.startedHidden(['--hidden'])).toBe(true)
    expect(startup.startedHidden([])).toBe(false)
  })
  it('uses the Mac bundle and recognizes a login launch without Windows arguments', () => {
    const { api, startup } = fixture('darwin')
    api.getLoginItemSettings.mockReturnValue({ openAtLogin: true, wasOpenedAtLogin: true, status: 'enabled' })
    expect(startup.startedHidden([])).toBe(true)
    startup.setEnabled(true)
    expect(api.setLoginItemSettings).toHaveBeenCalledWith({ openAtLogin: true })
    expect(api.getLoginItemSettings).toHaveBeenCalledWith({})
  })
  it('does not hide a normal Mac launch merely because startup is enabled', () => {
    expect(fixture('darwin').startup.startedHidden([])).toBe(false)
  })
  it('surfaces refused startup changes instead of claiming success', () => {
    const { api, startup } = fixture('darwin')
    api.getLoginItemSettings.mockReturnValue({ openAtLogin: false, wasOpenedAtLogin: false, status: 'enabled' })
    expect(() => startup.setEnabled(true)).toThrow('could not update startup')
  })
  it('explains when macOS requires approval in Login Items', () => {
    const { api, startup } = fixture('darwin')
    api.getLoginItemSettings.mockReturnValue({ openAtLogin: true, wasOpenedAtLogin: false, status: 'requires-approval' })
    expect(() => startup.setEnabled(true)).toThrow('Login Items')
  })
  it('can disable Mac startup', () => {
    const { api, startup } = fixture('darwin')
    api.getLoginItemSettings.mockReturnValue({ openAtLogin: false, wasOpenedAtLogin: false, status: 'not-registered' })
    expect(startup.setEnabled(false)).toBe(false)
    expect(api.setLoginItemSettings).toHaveBeenCalledWith({ openAtLogin: false })
  })
  it.each(['win32', 'darwin'] as const)('never registers development startup on %s', platform => {
    const { api, startup } = fixture(platform, false)
    expect(startup.supported).toBe(false)
    expect(startup.read()).toBe(null)
    expect(() => startup.setEnabled(true)).toThrow('after installation')
    expect(api.getLoginItemSettings).not.toHaveBeenCalled()
    expect(api.setLoginItemSettings).not.toHaveBeenCalled()
  })
})
