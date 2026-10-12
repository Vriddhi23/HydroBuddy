import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defaults, validatePreferences, type Preferences } from '../shared/preferences'
export class PreferenceStore {
  private file: string
  constructor(directory: string) { mkdirSync(directory, { recursive: true }); this.file = join(directory, 'preferences.json') }
  read(): Preferences {
    if (!existsSync(this.file)) return structuredClone(defaults)
    try { return validatePreferences(JSON.parse(readFileSync(this.file, 'utf8'))) }
    catch { try { renameSync(this.file, `${this.file}.invalid-${Date.now()}`) } catch { /* Preserve defaults if backup fails. */ } return structuredClone(defaults) }
  }
  write(value: Preferences) { const safe = validatePreferences(value); writeFileSync(`${this.file}.tmp`, JSON.stringify(safe, null, 2), 'utf8'); renameSync(`${this.file}.tmp`, this.file) }
}
