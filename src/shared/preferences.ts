export const clothingColors = { blue: '#639de2', green: '#6ba991', purple: '#9b83cd', pink: '#e994af', orange: '#eaa46c', black: '#414654' } as const
export const bottleColors = { blue: '#65c3e5', green: '#78c5a6', pink: '#e99cbf', purple: '#ae95df', orange: '#f0b375' } as const
export const assetIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/
export type AvatarAppearance = {
  gender: 'male' | 'female'; clothingColor: keyof typeof clothingColors; bottleColor: keyof typeof bottleColors
  source: 'builtin' | 'custom'; frontAsset: string | null; sideAsset: string | null
  shirtColor?: string; pantsColor?: string
}
export type WalkStyle = 'profile' | 'classic'
export type Preferences = {
  avatar: AvatarAppearance; buddyName: string; greeting: string; walkStyle: WalkStyle
  reminderInterval: number; remindersEnabled: boolean; launchAtStartup: boolean; onboardingCompleted: boolean
}
export const defaults: Preferences = {
  avatar: { gender: 'female', clothingColor: 'purple', bottleColor: 'blue', source: 'builtin', frontAsset: null, sideAsset: null, shirtColor: '#ffffff', pantsColor: '#99c5e5' },
  buddyName: 'Buddy', greeting: 'Hey, it’s time to get hydrated.', walkStyle: 'classic',
  reminderInterval: 60, remindersEnabled: true, launchAtStartup: false, onboardingCompleted: false
}
function localText(value: unknown, fallback: string, max: number): string {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !value.trim() || value.length > max || [...value].some(character => character.charCodeAt(0) < 32)) throw new Error('Please check your name and reminder text.')
  return value.trim()
}
function assetId(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string' || !assetIdPattern.test(value)) throw new Error('Invalid avatar reference')
  return value
}
function color(value: unknown, fallback: string): string {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Choose a valid clothing color.')
  return value.toLowerCase()
}
export function validatePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object') throw new Error('Invalid preferences')
  const p = value as Preferences
  if (!p.avatar || !['male', 'female'].includes(p.avatar.gender) || !Object.hasOwn(clothingColors, p.avatar.clothingColor) || !Object.hasOwn(bottleColors, p.avatar.bottleColor) || ![30,45,60,90].includes(p.reminderInterval) || ['remindersEnabled','launchAtStartup','onboardingCompleted'].some(k => typeof p[k as keyof Preferences] !== 'boolean')) throw new Error('Invalid preferences')
  // Additive migration preserves existing V1 preferences.
  const source = p.avatar.source ?? 'builtin', walkStyle = p.walkStyle ?? 'profile'
  if (!['builtin', 'custom'].includes(source) || !['profile', 'classic'].includes(walkStyle)) throw new Error('Invalid avatar options')
  const frontAsset = assetId(p.avatar.frontAsset)
  assetId(p.avatar.sideAsset) // Validate legacy references before retiring the side-view option.
  if (source === 'custom' && !frontAsset) throw new Error('Choose a front-view avatar first.')
  return {
    avatar: { gender: p.avatar.gender, clothingColor: p.avatar.clothingColor, bottleColor: p.avatar.bottleColor, source, frontAsset, sideAsset: null,
      shirtColor: color(p.avatar.shirtColor, '#ffffff'), pantsColor: color(p.avatar.pantsColor, '#99c5e5') },
    buddyName: localText(p.buddyName, defaults.buddyName, 24), greeting: localText(p.greeting, defaults.greeting, 110), walkStyle: 'classic',
    reminderInterval: p.reminderInterval, remindersEnabled: p.remindersEnabled, launchAtStartup: p.launchAtStartup, onboardingCompleted: p.onboardingCompleted
  }
}
