import { useEffect, useId, useRef } from 'react'
import { ProfileWalk, preloadWalk } from './ProfileWalk'
import type { AvatarAppearance } from '../../shared/preferences'
import type { Phase } from '../animations/reminder'
import { colorClothes, loadPicture } from '../animations/avatarPainter'
import { reactionArtwork } from '../animations/reactionArtwork'
export function SuppliedAvatar({ phase, appearance }: { phase: Phase | 'rest'; appearance: AvatarAppearance }) {
  const filter = useId().replaceAll(':',''), canvas = useRef<HTMLCanvasElement>(null)
  const walking = phase === 'entering' || phase === 'exiting'
  const frame = phase === 'negative' ? 9 : phase === 'waving' || phase === 'greeting' ? 10 : phase === 'positive' ? 11 : 8
  useEffect(() => { void preloadWalk(appearance.gender) }, [appearance.gender])
  useEffect(() => {
    if (walking) return
    let cancelled=false
    const surface=canvas.current!, context=surface.getContext('2d')!
    const male=appearance.gender==='male', index=frame-8
    void loadPicture(male?'./male-v1/reactions.png':'./buddy-motion-atlas.png').then(image=>{
      if(cancelled)return
      context.setTransform(2,0,0,2,0,0);context.clearRect(0,0,250,362)
      const art = reactionArtwork(male, index)
      context.drawImage(image,index*art.cellWidth,art.sourceY,art.cellWidth,art.cellHeight,art.dx,art.dy,art.cellWidth*art.scale,art.cellHeight*art.scale)
      colorClothes(surface,appearance,art.regions)
      surface.dataset.ready='true'
    }).catch(()=>{if(!cancelled)surface.dataset.ready='error'})
    return()=>{cancelled=true}
  },[walking,frame,appearance.gender,appearance.shirtColor,appearance.pantsColor])
  if(walking)return <ProfileWalk exiting={phase==='exiting'} appearance={appearance}/>
  return <><svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true"><defs><filter id={filter}><feMorphology in="SourceAlpha" operator="erode" radius=".7" result="edge"/><feComposite in="SourceGraphic" in2="edge" operator="in"/></filter></defs></svg><canvas ref={canvas} className="supplied-avatar-art" style={{filter:`url(#${filter})`}} width="500" height="724" aria-hidden="true" data-gender={appearance.gender} data-frame={frame} data-facing="front" data-expression={phase==='negative'?'sad':'happy'}/></>
}
