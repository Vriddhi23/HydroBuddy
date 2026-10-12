import { useEffect, useRef } from 'react'
import { Droplet, X } from 'lucide-react'

export function AboutDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close() }, [])
  return <dialog ref={dialog} className="about-dialog" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }} aria-label="About HydroBuddy">
    <div className="about-dialog-content"><button className="icon-button" aria-label="Close About" onClick={onClose} autoFocus><X size={20}/></button><Droplet size={33}/><h2>A familiar face at your desk.</h2><p>HydroBuddy is a local desktop companion. Your images and preferences stay here. There are no accounts, uploads to a server, or AI calls.</p><p>The supplied character has a walking cycle and expressive poses. Other imported artwork moves as a single image. Built-in characters have moving arms and legs. Every visit starts with a little peek before your buddy steps into view.</p><small>HydroBuddy 1.5 · Made for everyday water breaks.</small></div>
  </dialog>
}
