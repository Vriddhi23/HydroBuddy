import { useState } from 'react'
import { Upload, Check } from 'lucide-react'
import type { AvatarAppearance } from '../../shared/preferences'
import { rememberAvatar, useAvatarAsset } from '../hooks/useAvatarAsset'

export function AvatarImport({ value, onChange, onBusy }: { value: AvatarAppearance; onChange: (value: AvatarAppearance) => void; onBusy: (busy: boolean) => void }) {
  const { asset: front, missing } = useAvatarAsset(value.frontAsset)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function choose(file?: File, supplied = false) {
    if (busy) return
    setBusy(true); onBusy(true); setError('')
    try {
      if (file && file.size > 8 * 1024 * 1024) throw new Error('Choose a PNG or WebP smaller than 8 MB.')
      const asset = supplied ? await window.buddy.useSuppliedAvatar() : file ? await window.buddy.importAvatarData(new Uint8Array(await file.arrayBuffer())) : await window.buddy.importAvatar()
      if (asset) { rememberAvatar(asset); onChange({ ...value, source: 'custom', frontAsset: asset.id, sideAsset: null }) }
    } catch (e) { setError(e instanceof Error ? e.message.replace(/^Error invoking remote method '[^']+': Error: /, '') : 'Could not import this image.') }
    finally { setBusy(false); onBusy(false) }
  }
  return <div className="avatar-import" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); event.stopPropagation(); const file = event.dataTransfer.files[0]; if (file) void choose(file) }}>
    <button className={`import-front ${front ? 'has-image' : ''}`} disabled={busy} onClick={() => void choose()} aria-label={front ? 'Replace avatar image' : 'Choose avatar image'}>
      {front ? <span className="file-thumb checker"><img src={front.dataUrl} alt="Imported avatar"/></span> : <span className="import-icon"><Upload size={23}/></span>}
      <span><strong>{busy ? 'Getting your buddy ready…' : front ? 'Your avatar is here.' : 'Drop your avatar here'}</strong><small>{front ? 'Drop a new image or click to replace' : 'or click to browse · PNG / WebP · up to 8 MB'}</small></span>{front && <Check size={18}/>}
    </button>
    <p className="import-help">A full-body image with a transparent background works best. Your image stays on this computer.</p>
    {missing && <p className="error" role="alert">This avatar file is missing. Choose the image again.</p>}
    {front && !front.hasTransparency && <p className="image-note">This image has a background. It will appear on the desktop too; use a transparent export for a cutout.</p>}
    <button className="supplied-avatar" disabled={busy} onClick={() => void choose(undefined, true)}><img src="./welcome-buddy.png" alt=""/><span><strong>Try the supplied avatar</strong><small>Ready to go, with no background.</small></span></button>
    <p className="import-help">Your picture leans around the edge and moves smoothly into view. The supplied avatar includes walking poses and a sad expression. Clothing and bottle colors are part of your artwork; choose a built-in character to customize those colors.</p>
    {error && <p className="error" role="alert">{error}</p>}
  </div>
}

