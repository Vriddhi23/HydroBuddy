import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defaults, validatePreferences } from '../src/shared/preferences'
import { PreferenceStore } from '../src/main/storage'
describe('preferences', () => {
  it('defaults to hourly reminders with auto-start off', () => { expect(defaults.reminderInterval).toBe(60); expect(defaults.launchAtStartup).toBe(false) })
  it.each([1, 10, 20, 37, 90, 1440])('accepts %i whole minutes', reminderInterval => {
    expect(validatePreferences({ ...defaults, reminderInterval }).reminderInterval).toBe(reminderInterval)
  })
  it.each([0, -1, 1.5, 1441, Infinity, NaN, '20', null])('rejects an invalid interval %s at the IPC boundary', reminderInterval => {
    expect(() => validatePreferences({ ...defaults, reminderInterval })).toThrow('whole number')
  })
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
  it('validates custom clothing colors', () => {
    const valid = { ...defaults, avatar: { ...defaults.avatar, shirtColor: '#A1B2C3', pantsColor: '#234567' } }
    expect(validatePreferences(valid).avatar).toMatchObject({ shirtColor: '#a1b2c3', pantsColor: '#234567' })
    for (const invalid of [{ shirtColor: 'url(https://example.com)' }, { pantsColor: '#123' }]) expect(() => validatePreferences({ ...defaults, avatar: { ...defaults.avatar, ...invalid } })).toThrow()
  })
  it('retires saved face overlays without resetting the character or routine', () => {
    const current = { ...defaults, reminderInterval: 45, remindersEnabled: false, onboardingCompleted: true, avatar: { ...defaults.avatar, gender: 'male', shirtColor: '#80a98e', pantsColor: '#bc9273' } }
    const legacy = { ...current, avatar: { ...current.avatar, faceAsset: '678432a1-7803-43f9-98ef-a3ef9dd7a111', faceCrop: { x: .2, y: -.1, zoom: 2 } } }
    expect(validatePreferences(legacy)).toEqual(current)
  })
  it('persists custom intervals across store instances and backs up damaged data', () => { const dir = mkdtempSync(join(tmpdir(),'hydrobuddy-test-')); try { const p = { ...defaults, reminderInterval: 37, onboardingCompleted: true, avatar: { ...defaults.avatar, bottleColor: 'green' as const } }; new PreferenceStore(dir).write(p); expect(new PreferenceStore(dir).read()).toEqual(p); expect(JSON.parse(readFileSync(join(dir,'preferences.json'),'utf8'))).toEqual(p); writeFileSync(join(dir,'preferences.json'),'{broken'); expect(new PreferenceStore(dir).read()).toEqual(defaults); expect(readdirSync(dir).some(x => x.includes('.invalid-'))).toBe(true) } finally { rmSync(dir,{recursive:true,force:true}) } })
})
