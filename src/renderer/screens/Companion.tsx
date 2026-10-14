import { useEffect, useState } from 'react'
import type { AppState } from '../../shared/api'
import { BuddyFigure } from '../components/BuddyFigure'
import { affirmations, gentleReminders, phaseDelay, nextPhase, type Phase } from '../animations/reminder'
export function Companion({ state }: { state: AppState }) {
  const [phase, setPhase] = useState<Phase>('hidden')
  const [message, setMessage] = useState('')
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  useEffect(() => { setPhase(state.active ? 'peeking' : 'hidden') }, [state.active])
  useEffect(() => {
    const delay = phaseDelay(phase, reduced)
    if (delay === null) return
    const timer = setTimeout(() => { const next = nextPhase(phase); setPhase(next); if (next === 'hidden') window.buddy.finishReminder() }, delay)
    return () => clearTimeout(timer)
  }, [phase, reduced, state.preferences.walkStyle])
  useEffect(() => window.buddy.onBubbleAction(action => {
    if (action === 'dismiss') { setPhase('exiting'); return }
    if (phase !== 'asking') return
    const yes = action === 'yes', list = yes ? affirmations : gentleReminders
    setMessage(list[Math.floor(Math.random() * list.length)]); setPhase(yes ? 'positive' : 'negative')
  }), [phase])
  useEffect(() => {
    if (phase === 'greeting' || phase === 'asking' || phase === 'positive' || phase === 'negative') window.buddy.showBubble({ phase, name: state.preferences.buddyName, message: phase === 'greeting' ? state.preferences.greeting : phase === 'asking' ? 'Did you drink water?' : message })
    else window.buddy.showBubble(null)
  }, [phase, message, state.preferences.buddyName, state.preferences.greeting])
  return <main className={`companion phase-${phase} ${reduced ? 'reduced-motion' : ''}`} data-phase={phase}>
    <div className="companion-walker"><BuddyFigure appearance={state.preferences.avatar} phase={phase} label={state.preferences.buddyName}/>{phase === 'positive' && <div className="celebration" aria-hidden="true">{['💧','✦','✧','💧','✦','✧'].map((item,i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{item}</span>)}</div>}</div>
  </main>
}
