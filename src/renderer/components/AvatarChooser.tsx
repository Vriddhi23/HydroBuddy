import { useEffect, useRef, useState } from 'react'
import { ArrowRight, UserRound, Upload, X } from 'lucide-react'
import type { AvatarAppearance } from '../../shared/preferences'
import { AvatarImport } from './AvatarImport'
import { rememberAvatar } from '../hooks/useAvatarAsset'

export function AvatarChooser({ value, initial = false, onChoose, onClose }: { value: AvatarAppearance; initial?: boolean; onChoose: (avatar: AvatarAppearance) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [upload, setUpload] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function drop(file: File) {
    if (busy) return
    setBusy(true); setError('')
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error('Choose a PNG or WebP smaller than 8 MB.')
      const asset = await window.buddy.importAvatarData(new Uint8Array(await file.arrayBuffer()))
      rememberAvatar(asset); onChoose({ ...value, source: 'custom', frontAsset: asset.id, sideAsset: null })
    } catch { setError('Could not open that image. Choose a PNG or WebP smaller than 8 MB.') }
    finally { setBusy(false) }
  }
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close() }, [])
  return <dialog ref={dialog} className="avatar-chooser" aria-labelledby="choose-title" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) void drop(file) }} onCancel={event => { if (initial || busy) event.preventDefault(); else onClose() }}>
    {!initial && <button className="icon-button chooser-close" aria-label="Close avatar chooser" disabled={busy} onClick={onClose}><X size={18}/></button>}
    <span className="pencil-note">a little company, made yours.</span>
    <h1 id="choose-title">Who's dropping by?</h1>
    <p>Pick a little friend. Or bring a little you.</p>
    <div className="chooser-options">
      <button className="choose-character" disabled={busy} onClick={() => onChoose({ ...value, source: 'builtin', sideAsset: null })}><UserRound size={28}/><strong>Pick a character</strong><small>Make it yours with color.</small><ArrowRight size={17}/></button>
      <button className={upload ? 'choose-image selected' : 'choose-image'} disabled={busy} aria-expanded={upload} onClick={() => setUpload(true)}><Upload size={28}/><strong>Use my own image</strong><small>Drop in your ready-made avatar.</small><ArrowRight size={17}/></button>
    </div>
    {upload && <AvatarImport value={value} onChange={onChoose} onBusy={setBusy}/>}
    {busy && <p role="status" className="import-help">Getting your buddy ready…</p>}
    {error && <p role="alert" className="error">{error}</p>}
    <small className="chooser-privacy">Just on your computer. Just for you.</small>
  </dialog>
}

