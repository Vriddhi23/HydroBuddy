import { useId } from 'react'
export const shirtSwatches = { White: '#ffffff', Sage: '#80a98e', Lilac: '#a18bbd', Rose: '#dc9da6' }
export const pantsSwatches = { 'Light blue': '#99c5e5', Indigo: '#536c92', Cream: '#d7cbb5', Charcoal: '#4c5057' }
export function ColorField({ label, value, colors, onChange }: { label: string; value: string; colors: Record<string, string>; onChange: (hex: string) => void }) {
  const id = useId()
  return <fieldset className="color-field"><legend>{label}</legend><div className="color-options">
    {Object.entries(colors).map(([name, hex]) => <button key={name} type="button" aria-label={`${name} ${label.toLowerCase()}`} aria-pressed={value === hex} onClick={() => onChange(hex)}><span style={{ backgroundColor: hex }}>{value === hex && '✓'}</span><small>{name}</small></button>)}
    <label className="custom-color" htmlFor={id}><input id={id} type="color" aria-label={`Custom ${label.toLowerCase()} color`} value={value} onChange={e => onChange(e.target.value)}/><small>Pick yours</small></label>
  </div></fieldset>
}
