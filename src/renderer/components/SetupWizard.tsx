import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import type { AvatarAppearance, Preferences } from '../../shared/preferences'
import { BuddyFigure } from './BuddyFigure'
import { AvatarPreview } from './AvatarPreview'
import { ColorField, shirtSwatches, pantsSwatches } from './ColorField'
export function SetupWizard({ preferences, initial, onSave, onClose }: { preferences: Preferences; initial: boolean; onSave: (avatar: AvatarAppearance) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const [avatar, setAvatar] = useState<AvatarAppearance>({ ...preferences.avatar, source: 'builtin', frontAsset: null, sideAsset: null })
  const titles = ['Who’s your HydroBuddy?', 'Pick a T-shirt.', 'Find your favorite jeans.', 'Meet your little reminder.']
  const subtitles = ['Choose a character. We’ll make them yours next.', 'A familiar color makes it feel like you.', 'Keep it classic, or pick a color of your own.', 'Try the walk, then save your HydroBuddy.']
  useEffect(() => { const el = dialog.current; el?.showModal(); return () => el?.close() }, [])
  async function save() { setBusy(true); setError(''); try { await onSave(avatar) } catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Please try again.') } finally { setBusy(false) } }
  const locked = busy
  return <dialog ref={dialog} className={`setup-wizard ${step === 3 ? 'setup-review' : ''}`} aria-labelledby="setup-title" onCancel={e => { e.preventDefault(); if (!locked) onClose() }}>
    <button className="icon-button wizard-close" aria-label="Close setup" disabled={locked} onClick={onClose}><X size={18}/></button>
    <header className="wizard-heading"><span className="chapter">MAKE YOURSELF AT HOME · {step + 1} / 4</span><h1 id="setup-title">{titles[step]}</h1><p>{subtitles[step]}</p></header>
    {step === 0 ? <div className="gender-cards">{(['female','male'] as const).map(gender => <button key={gender} aria-label={gender === 'female' ? 'Choose Female' : 'Choose Male'} aria-pressed={avatar.gender === gender} onClick={() => { setAvatar({ ...avatar, gender }); setStep(1) }}><div className="gender-portrait"><BuddyFigure appearance={{ ...avatar, gender }}/></div><span>{gender === 'female' ? 'Female' : 'Male'}<ArrowRight size={17}/></span></button>)}</div> : step < 3 ? <div className="wizard-outfit"><div className="outfit-portrait"><BuddyFigure appearance={avatar}/></div><div><span className="pencil-note">your everyday look.</span>{step === 1 ? <ColorField label="T-shirt" value={avatar.shirtColor ?? '#ffffff'} colors={shirtSwatches} onChange={shirtColor => setAvatar({ ...avatar, shirtColor })}/> : <ColorField label="Jeans" value={avatar.pantsColor ?? '#99c5e5'} colors={pantsSwatches} onChange={pantsColor => setAvatar({ ...avatar, pantsColor })}/>}<p>Every step, peek and hello wears your colors.</p></div></div> : <div className="wizard-review-grid"><AvatarPreview preferences={{ ...preferences, avatar }}/></div>}
    {error && <p role="alert" className="error">{error}</p>}
    <footer className="wizard-footer">{step > 0 ? <button className="text-button" disabled={locked} onClick={() => setStep(step - 1)}><ArrowLeft size={15}/> Back</button> : <small>Made for your desktop. Saved only here.</small>}{step > 0 && <button className="primary" disabled={locked} onClick={() => step < 3 ? setStep(step + 1) : void save()}>{busy ? 'Saving…' : step < 3 ? 'Continue' : initial ? 'Save my HydroBuddy' : 'Save avatar'}{step < 3 ? <ArrowRight size={16}/> : <Check size={16}/>}</button>}</footer>
  </dialog>
}
