import { useId } from 'react'
import { ProfileWalk } from './ProfileWalk'
import type { Phase } from '../animations/reminder'

// Register each authored pose to the same head center and ground line.
// This changes sprite positioning, not the original atlas pixels.
const registration = [
  [233.5,356], [209.5,355], [186.5,355], [174.5,355],
  [226,351], [205.5,353], [188,354], [180,352],
  [224.5,351], [205,351], [214,351], [202,351]
]
export function SuppliedAvatar({ phase }: { phase: Phase | 'rest' }) {
  const edgeFilter = useId().replaceAll(':', '')
  if (phase === 'entering' || phase === 'exiting') return <ProfileWalk exiting={phase === 'exiting'}/>
  const frame = phase === 'negative' ? 9 : phase === 'waving' || phase === 'greeting' ? 10 : phase === 'positive' ? 11 : 8
  const [headX, floor] = registration[frame]
  return <svg className="supplied-avatar-art" viewBox="0 0 250 362" aria-hidden="true" data-frame={frame} data-facing="front" data-expression={phase === 'negative' ? 'sad' : 'happy'}>
    <defs><filter id={edgeFilter} filterUnits="userSpaceOnUse" x="0" y="0" width="250" height="362"><feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="edge"/><feGaussianBlur in="edge" stdDeviation=".25" result="softEdge"/><feComposite in="SourceGraphic" in2="softEdge" operator="in"/></filter></defs>
    <image href="./buddy-motion-atlas.png" filter={`url(#${edgeFilter})`} x={-(frame % 4) * 362 + 125 - headX} y={-Math.floor(frame / 4) * 362 + 354 - floor} width="1448" height="1086"/>
  </svg>
}
