import { useEffect, useRef } from 'react'
import { Droplet, X } from 'lucide-react'

export function AboutDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close() }, [])
  return <dialog ref={dialog} className="about-dialog" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }} aria-label="About HydroBuddy">
    <div className="about-dialog-content"><button className="icon-button" aria-label="Close About" onClick={onClose} autoFocus><X size={20}/></button><Droplet size={33}/><h2>A familiar face at your desk.</h2><p>HydroBuddy is a local desktop companion. Your images and preferences stay here. There are no accounts, uploads to a server, or AI calls.</p><p>Both characters share the same peek, walking cycle and reactions. Choose your T-shirt and jeans colors to make your companion yours. Older full-avatar imports move as a single image.</p><small>HydroBuddy 1.9.0 · Made for everyday water breaks.</small></div>
  </dialog>
}
