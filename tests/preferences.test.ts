import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defaults, validatePreferences } from '../src/shared/preferences'
import { PreferenceStore } from '../src/main/storage'
describe('preferences', () => {
  it('defaults to hourly reminders with auto-start off', () => { expect(defaults.reminderInterval).toBe(60); expect(defaults.launchAtStartup).toBe(false) })
  it.each([null, {}, { ...defaults, reminderInterval: 0 }, { ...defaults, remindersEnabled: 'yes' }, { ...defaults, avatar: { ...defaults.avatar, clothingColor: '__proto__' } }])('rejects invalid renderer payloads', value => expect(() => validatePreferences(value)).toThrow())
  it('keeps only explicitly allowed fields', () => { expect(validatePreferences({ ...defaults, arbitrary: 'ignored' })).toEqual(defaults) })
  it('migrates V1 without changing the saved colors, interval, or pause state', () => {
    const legacy = { avatar: { gender: 'male', clothingColor: 'green', bottleColor: 'pink' }, reminderInterval: 45, remindersEnabled: false, launchAtStartup: false, onboardingCompleted: true }
    const updated = validatePreferences(legacy)
    expect(updated.avatar).toMatchObject(legacy.avatar); expect(updated.avatar.source).toBe('builtin')
    expect(updated.reminderInterval).toBe(45); expect(updated.remindersEnabled).toBe(false); expect(updated.buddyName).toBe('Buddy'); expect(updated.walkStyle).toBe('classic')
  })
  it('rejects paths, missing custom images and oversized personal text', () => {
    for (const p of [{ ...defaults, avatar: { ...defaults.avatar, source: 'custom' } }, { ...defaults, avatar: { ...defaults.avatar, frontAsset: '../../private' } }, { ...defaults, buddyName: 'x'.repeat(25) }, { ...defaults, greeting: '' }, { ...defaults, walkStyle: 'unexpected' }]) expect(() => validatePreferences(p)).toThrow()
  })
  it('persists imported IDs and trims personal text without accepting extra fields', () => {
    const id = '678432a1-7803-43f9-98ef-a3ef9dd7a111'
    const p = validatePreferences({ ...defaults, buddyName: '  Mini me  ', avatar: { ...defaults.avatar, source: 'custom', frontAsset: id } })
    expect(p.buddyName).toBe('Mini me'); expect(p.avatar.frontAsset).toBe(id)
  })
  it('persists across store instances and backs up damaged data', () => { const dir = mkdtempSync(join(tmpdir(),'hydrobuddy-test-')); try { const p = { ...defaults, onboardingCompleted: true, avatar: { ...defaults.avatar, bottleColor: 'green' as const } }; new PreferenceStore(dir).write(p); expect(new PreferenceStore(dir).read()).toEqual(p); expect(JSON.parse(readFileSync(join(dir,'preferences.json'),'utf8'))).toEqual(p); writeFileSync(join(dir,'preferences.json'),'{broken'); expect(new PreferenceStore(dir).read()).toEqual(defaults); expect(readdirSync(dir).some(x => x.includes('.invalid-'))).toBe(true) } finally { rmSync(dir,{recursive:true,force:true}) } })
})
