import { useEffect, useId, useRef } from 'react'

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
const images = Promise.all(POSES.map(pose => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error(`Missing walking pose: ${pose.file}`))
  image.src = `./walk-v2/${pose.file}`
}))).catch(() => null)

export function ProfileWalk({ exiting }: { exiting: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const filter = useId().replaceAll(':', '')
  useEffect(() => {
    const surface = canvas.current!, ctx = surface.getContext('2d')!
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let animation = 0, disposed = false, start = 0, frames: HTMLImageElement[] | null = null, previous = -1
    const draw = () => {
      if (disposed || !frames) return
      const frame = media.matches ? 0 : Math.floor((performance.now() - start) / FRAME_MS) % POSES.length
      if (frame !== previous) {
        const pose = POSES[frame], scale = 337 / (pose.floor - pose.crown)
        ctx.setTransform(2, 0, 0, 2, 0, 0)
        ctx.clearRect(0, 0, 250, 362)
        if (exiting) { ctx.translate(250, 0); ctx.scale(-1, 1) }
        ctx.drawImage(frames[frame], 125 - pose.hip * scale, 354 - pose.floor * scale, 1024 * scale, 1536 * scale)
        surface.dataset.frame = String(frame)
        surface.dataset.pose = pose.file
        surface.dataset.ready = 'true'
        previous = frame
      }
      if (!media.matches) animation = requestAnimationFrame(draw)
    }
    void images.then(loaded => {
      if (disposed) return
      if (!loaded) { surface.dataset.ready = 'error'; return }
      frames = loaded; start = performance.now(); draw()
    })
    const change = () => { cancelAnimationFrame(animation); previous = -1; draw() }
    media.addEventListener('change', change)
    return () => { disposed = true; cancelAnimationFrame(animation); media.removeEventListener('change', change) }
  }, [exiting])
  return <><svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs><filter id={filter}><feMorphology in="SourceAlpha" operator="erode" radius=".7" result="edge"/><feComposite in="SourceGraphic" in2="edge" operator="in"/></filter></defs></svg><canvas ref={canvas} style={{ filter: `url(#${filter})` }} className="supplied-avatar-art profile-walk" width="500" height="724" aria-hidden="true" data-facing={exiting ? 'right' : 'left'} data-frame="0" data-expression="happy"/></>
}
