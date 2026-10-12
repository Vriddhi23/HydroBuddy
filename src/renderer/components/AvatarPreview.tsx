import { useEffect, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import type { Preferences } from '../../shared/preferences'
import { nextPhase, phaseDelay, type Phase } from '../animations/reminder'
import { BuddyFigure } from './BuddyFigure'

export function AvatarPreview({ preferences }: { preferences: Preferences }) {
  const [phase, setPhase] = useState<Phase | 'rest'>('rest')
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  useEffect(() => { setPhase('rest') }, [preferences.walkStyle, preferences.avatar.source, preferences.avatar.frontAsset, preferences.avatar.sideAsset])
  useEffect(() => {
    if (phase === 'rest') return
    const delay = phase === 'hidden' ? 350 : phase === 'asking' ? 1000 : phase === 'positive' ? 1400 : phaseDelay(phase, reduced)
    const timer = setTimeout(() => setPhase(phase === 'hidden' ? 'rest' : phase === 'asking' ? 'positive' : nextPhase(phase)), delay ?? 350)
    return () => clearTimeout(timer)
  }, [phase, preferences.walkStyle, reduced])
  const message = phase === 'asking' ? 'Did you drink water?' : phase === 'positive' ? 'That’s a little win. Nice work!' : preferences.greeting
  return <section className="preview-panel" aria-label="Avatar preview">
    <div className="preview-heading"><span>THE DESKTOP VERSION OF YOU</span><span className="pencil-note">just dropping by.</span></div>
    <div className={`preview-scene preview-${phase} ${reduced ? 'reduced-motion' : ''}`} data-preview-phase={phase}>
      <div className="scene-window" aria-hidden="true"><i/><i/><i/><span/><span/></div>
      {['rest','greeting','asking','positive'].includes(phase) && <div className="preview-speech"><span>{preferences.buddyName || 'Buddy'}</span><p title={message}>{message || 'Hey, it’s time to get hydrated.'}</p></div>}
      <div className="preview-floor" aria-hidden="true"/>
      <div className="preview-walker"><BuddyFigure appearance={preferences.avatar} phase={phase} label={`${preferences.buddyName || 'Buddy'} preview`}/></div>
      <span className="floor-label">your desktop</span>
      {phase !== 'rest' && <span className="phase-caption" aria-live="polite">{phase === 'entering' ? 'Walking in…' : phase === 'peeking' ? 'Just a little peek…' : phase === 'exiting' ? 'See you in a bit.' : phase === 'positive' ? 'A little celebration.' : 'A moment for water.'}</span>}
    </div>
    <div className="preview-toolbar"><div><h2>{preferences.buddyName || 'Buddy'}<span> / your water reminder</span></h2><p>Same desk. A little more company.</p></div><button className="preview-play" disabled={phase !== 'rest'} onClick={() => setPhase('peeking')} aria-label="Preview walk">{phase === 'rest' ? <Play size={16} fill="currentColor"/> : <RotateCcw size={16}/>}</button></div>
    <p className="preview-footnote">A little peek. A friendly hello. A moment for water.</p>
  </section>
}
