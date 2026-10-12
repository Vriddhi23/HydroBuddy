import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { AppState } from '../../shared/api'
import { BuddyFigure } from '../components/BuddyFigure'
import { affirmations, gentleReminders, phaseDelay, nextPhase, type Phase } from '../animations/reminder'
export function Companion({ state }: { state: AppState }) {
  const [phase, setPhase] = useState<Phase>('hidden')
  const [message, setMessage] = useState('')
  const bubbleRef = useRef<HTMLElement>(null)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  useEffect(() => { setPhase(state.active ? 'peeking' : 'hidden') }, [state.active])
  useEffect(() => {
    const delay = phaseDelay(phase, reduced)
    if (delay === null) return
    const timer = setTimeout(() => { const next = nextPhase(phase); setPhase(next); if (next === 'hidden') window.buddy.finishReminder() }, delay)
    return () => clearTimeout(timer)
  }, [phase, reduced, state.preferences.walkStyle])
  useLayoutEffect(() => {
    const element=bubbleRef.current
    if(!element){window.buddy.setInteractionBounds(null);return}
    const update=()=>{
      const box=element.getBoundingClientRect(),x=Math.max(0,box.left-10),y=Math.max(0,box.top-10)
      window.buddy.setInteractionBounds({x,y,width:Math.min(innerWidth,box.right+10)-x,height:Math.min(innerHeight,box.bottom+10)-y})
    }
    update()
    const observer=new ResizeObserver(update);observer.observe(element)
    window.addEventListener('resize',update)
    return()=>{observer.disconnect();window.removeEventListener('resize',update);window.buddy.setInteractionBounds(null)}
  },[phase])
  const answer = (yes: boolean) => { if (phase !== 'asking') return; const list = yes ? affirmations : gentleReminders; setMessage(list[Math.floor(Math.random()*list.length)]); setPhase(yes ? 'positive' : 'negative') }
  const bubble = ['greeting','asking','positive','negative'].includes(phase)
  return <main className={`companion phase-${phase} ${reduced ? 'reduced-motion' : ''}`} data-phase={phase}>
    {bubble && <section ref={bubbleRef} className="speech-bubble" data-interactive="true" aria-live="polite"><button className="dismiss" aria-label="Dismiss reminder" onClick={() => setPhase('exiting')}>×</button><span className="bubble-eyebrow">{state.preferences.buddyName}</span><p>{phase === 'greeting' ? state.preferences.greeting : phase === 'asking' ? 'Did you drink water?' : message}</p>{phase === 'asking' && <div className="answer-buttons"><button className="primary" onClick={() => answer(true)}>Yes 💧</button><button className="secondary" onClick={() => answer(false)}>Not yet</button></div>}</section>}
    <div className="companion-walker"><BuddyFigure appearance={state.preferences.avatar} phase={phase} label={state.preferences.buddyName}/>{phase === 'positive' && <div className="celebration" aria-hidden="true">{['💧','✦','✧','💧','✦','✧'].map((item,i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{item}</span>)}</div>}</div>
  </main>
}
