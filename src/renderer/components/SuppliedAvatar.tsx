import { useEffect, useId, useRef } from 'react'
import { ProfileWalk, preloadWalk } from './ProfileWalk'
import type { AvatarAppearance } from '../../shared/preferences'
import type { Phase } from '../animations/reminder'
import { colorClothes, loadPicture } from '../animations/avatarPainter'
const registration = [[224.5,351],[205,351],[214,351],[202,351]]
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
      if(male){ const scale=337/884;context.drawImage(image,index*384,0,384,1024,125-192*scale,354-960*scale,384*scale,1024*scale) }
      else { const [headX,floor]=registration[index];context.drawImage(image,index*362,724,362,362,125-headX,354-floor,362,362) }
      colorClothes(surface,appearance,{shirt:[55,95,145,91],pants:[55,175,145,165],bottle:male?[25,55,68,80]:[25,55,59,115]})
      surface.dataset.ready='true'
    }).catch(()=>{if(!cancelled)surface.dataset.ready='error'})
    return()=>{cancelled=true}
  },[walking,frame,appearance.gender,appearance.shirtColor,appearance.pantsColor])
  if(walking)return <ProfileWalk exiting={phase==='exiting'} appearance={appearance}/>
  return <><svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true"><defs><filter id={filter}><feMorphology in="SourceAlpha" operator="erode" radius=".7" result="edge"/><feComposite in="SourceGraphic" in2="edge" operator="in"/></filter></defs></svg><canvas ref={canvas} className="supplied-avatar-art" style={{filter:`url(#${filter})`}} width="500" height="724" aria-hidden="true" data-gender={appearance.gender} data-frame={frame} data-facing="front" data-expression={phase==='negative'?'sad':'happy'}/></>
}
