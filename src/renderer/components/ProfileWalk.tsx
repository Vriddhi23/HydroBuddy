import { useEffect, useId, useRef } from 'react'
import type { AvatarAppearance } from '../../shared/preferences'
import { colorClothes, loadPicture, type PaintRegions } from '../animations/avatarPainter'

// Each image is a complete authored pose. Keep each foot's half-cycle together:
// near supports / far swings, then far supports / near swings.
const POSES = [
  { file: 'step-01.png', hip: 500, floor: 1454, crown: 78 },
  { file: 'step-02.png', hip: 500, floor: 1459, crown: 79 },
  { file: 'step-03.png', hip: 525, floor: 1452, crown: 84 },
  { file: 'step-04.png', hip: 525, floor: 1447, crown: 82 },
  { file: 'step-05.png', hip: 525, floor: 1438, crown: 85 },
  { file: 'step-06.png', hip: 515, floor: 1467, crown: 49 },
  { file: 'step-07.png', hip: 535, floor: 1455, crown: 83 },
  { file: 'step-08.png', hip: 500, floor: 1437, crown: 78 },
] as const
const FRAME_MS = 135
// Preload once per renderer so a reminder never starts on an empty frame.
const images = new Map<AvatarAppearance['gender'], Promise<HTMLImageElement[] | null>>()
export function preloadWalk(gender: AvatarAppearance['gender']) {
  if (!images.has(gender)) images.set(gender, Promise.all(POSES.map(pose => loadPicture(`./${gender === 'male' ? 'male-v1' : 'walk-v2'}/${pose.file}`))).catch(() => { images.delete(gender); return null }))
  return images.get(gender)!
}
const bottles = [[670,700,170,300],[670,700,170,300],[275,740,175,270],[160,680,190,285],[170,680,200,285],[130,630,195,310],[350,810,150,250],[650,690,260,300]]

export function ProfileWalk({ exiting, appearance }: { exiting: boolean; appearance: AvatarAppearance }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const filter = useId().replaceAll(':', '')
  useEffect(() => {
    const surface = canvas.current!, ctx = surface.getContext('2d')!
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let animation = 0, disposed = false, start = 0, frames: HTMLCanvasElement[] | null = null, previous = -1
    const draw = () => {
      if (disposed || !frames) return
      const frame = media.matches ? 0 : Math.floor((performance.now() - start) / FRAME_MS) % POSES.length
      if (frame !== previous) {
        const pose = POSES[frame]
        ctx.setTransform(2, 0, 0, 2, 0, 0)
        ctx.clearRect(0, 0, 250, 362)
        if (exiting) { ctx.translate(250, 0); ctx.scale(-1, 1) }
        ctx.drawImage(frames[frame], 0, 0, 250, 362)
        surface.dataset.frame = String(frame)
        surface.dataset.pose = pose.file
        surface.dataset.ready = 'true'
        previous = frame
      }
      if (!media.matches) animation = requestAnimationFrame(draw)
    }
    void preloadWalk(appearance.gender).then(loaded => {
      if (disposed) return
      if (!loaded) { surface.dataset.ready = 'error'; return }
      frames = loaded.map((image,index) => {
        const p = POSES[index], male = appearance.gender === 'male'
        const floor = male ? 1468 : p.floor, crown = male ? 30 : p.crown, hip = male ? 520 : p.hip
        const scale = 337/(floor-crown), dx = 125-hip*scale, dy=354-floor*scale
        const painted = document.createElement('canvas'); painted.width=500; painted.height=724
        const context=painted.getContext('2d')!; context.scale(2,2); context.drawImage(image,dx,dy,1024*scale,1536*scale)
        const b=male && index<2 ? [720,700,210,310] : male && index===4 ? [125,695,195,280] : bottles[index]
        const regions: PaintRegions = { shirt:[60,70,120,100],pants:[0,145,250,201],bottle:[dx+b[0]*scale,dy+b[1]*scale,b[2]*scale,b[3]*scale] }
        // At the passing step the bottle overlaps the jeans; a traced boundary
        // protects the bottle without leaving a rectangular patch on the leg.
        if(index===6) regions.bottleOutline = [[357,835],[435,817],[450,884],[453,919],[479,1028],[408,1047],[389,1024],[365,917],[372,889]].map(([x,y])=>[dx+x*scale,dy+y*scale])
        colorClothes(painted,appearance,regions)
        return painted
      }); start = performance.now(); draw()
    })
    const change = () => { cancelAnimationFrame(animation); previous = -1; draw() }
    media.addEventListener('change', change)
    return () => { disposed = true; cancelAnimationFrame(animation); media.removeEventListener('change', change) }
  }, [exiting, appearance.gender, appearance.shirtColor, appearance.pantsColor])
  return <><svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs><filter id={filter}><feMorphology in="SourceAlpha" operator="erode" radius=".7" result="edge"/><feComposite in="SourceGraphic" in2="edge" operator="in"/></filter></defs></svg><canvas ref={canvas} style={{ filter: `url(#${filter})` }} className="supplied-avatar-art profile-walk" width="500" height="724" aria-hidden="true" data-facing={exiting ? 'right' : 'left'} data-frame="0" data-expression="happy"/></>
}
