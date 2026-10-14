import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { BubbleContent, BubbleAction } from '../../shared/api'

export function ReminderBubble() {
  const [content, setContent] = useState<BubbleContent | null>(null)
  const [answered, setAnswered] = useState(false)
  const section = useRef<HTMLElement>(null)
  useEffect(() => {
    const update = (value: BubbleContent | null) => { setContent(value); setAnswered(false) }
    const off = window.buddy.onBubble(update)
    void window.buddy.getBubble().then(update)
    return off
  }, [])
  useLayoutEffect(() => {
    if (!section.current) return
    const element = section.current
    const resize = () => window.buddy.setInteractionBounds({ x: 0, y: 0, width: 350, height: Math.min(260, element.scrollHeight + 2) })
    resize(); const observer = new ResizeObserver(resize); observer.observe(element)
    return () => observer.disconnect()
  }, [content])
  const answer = (action: BubbleAction) => { if (answered && action !== 'dismiss') return; setAnswered(true); window.buddy.answerBubble(action) }
  if (!content) return null
  return <section ref={section} className="speech-bubble native-bubble" aria-live="polite" data-phase={content.phase}>
    <button className="dismiss" aria-label="Dismiss reminder" title="Dismiss reminder" onClick={() => answer('dismiss')}>×</button>
    <span className="bubble-eyebrow">{content.name}</span><p>{content.message}</p>
    {content.phase === 'asking' && <div className="answer-buttons"><button className="primary" disabled={answered} onClick={() => answer('yes')}>Yes 💧</button><button className="secondary" disabled={answered} onClick={() => answer('no')}>Not yet</button></div>}
  </section>
}
