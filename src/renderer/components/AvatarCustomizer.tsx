import type { AvatarAppearance } from '../../shared/preferences'
import { ColorField, shirtSwatches, pantsSwatches } from './ColorField'
export function AvatarCustomizer({ value, onChange }: { value: AvatarAppearance; onChange: (value: AvatarAppearance) => void }) {
  return <div className="customizer">
    <fieldset><legend>Your character</legend><div className="segmented">{(['female','male'] as const).map(gender => <button key={gender} type="button" aria-label={gender === 'female' ? 'Female' : 'Male'} aria-pressed={value.gender === gender} className={value.gender === gender ? 'selected' : ''} onClick={() => onChange({ ...value, gender })}>{gender === 'female' ? 'Female' : 'Male'} {value.gender === gender && <small>✓</small>}</button>)}</div></fieldset>
    <ColorField label="T-shirt" colors={shirtSwatches} value={value.shirtColor ?? '#ffffff'} onChange={shirtColor => onChange({ ...value, shirtColor })}/>
    <ColorField label="Jeans" colors={pantsSwatches} value={value.pantsColor ?? '#99c5e5'} onChange={pantsColor => onChange({ ...value, pantsColor })}/>
  </div>
}
