import { ARRIVAL_MS, DEPARTURE_MS } from './walkCycle'
export type Phase = 'hidden' | 'peeking' | 'entering' | 'greeting' | 'asking' | 'positive' | 'negative' | 'waving' | 'exiting'
export const affirmations = ['Woohoo! Great job! 💧🎉', 'Nice! Your body thanks you! 💙', 'Hydration achieved! 💧', 'Awesome! Keep it going! 🌊', "That’s what I like to hear! 🎉", 'Great job taking care of yourself! 💙']
export const gentleReminders = ['Aww 🥺 Don’t forget to drink some water!', 'Your water bottle is waiting for you! 💧', 'Okay! But grab a sip when you can 🥺💧', 'I’ll remind you again later! 💙']
export function phaseDelay(phase: Phase, reduced: boolean): number | null {
  switch (phase) { case 'peeking': return reduced ? 150 : 1700; case 'entering': return reduced ? 150 : ARRIVAL_MS; case 'greeting': return 2200; case 'asking': return 45000; case 'positive': case 'negative': return 2800; case 'waving': return reduced ? 300 : 950; case 'exiting': return reduced ? 150 : DEPARTURE_MS; default: return null }
}
export function nextPhase(phase: Phase): Phase {
  return ({ peeking: 'entering', entering: 'greeting', greeting: 'asking', asking: 'waving', positive: 'waving', negative: 'waving', waving: 'exiting', exiting: 'hidden', hidden: 'hidden' } as const)[phase]
}

