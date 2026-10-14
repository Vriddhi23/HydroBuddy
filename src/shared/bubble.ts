import type { BubbleContent } from './api'
export function validateBubble(value: unknown): BubbleContent | null {
  if (value === null) return null
  if (!value || typeof value !== 'object') throw new Error('Invalid reminder bubble')
  const content = value as BubbleContent
  if (!['greeting','asking','positive','negative'].includes(content.phase) || typeof content.name !== 'string' || content.name.length > 24 || typeof content.message !== 'string' || content.message.length > 160) throw new Error('Invalid reminder bubble')
  return { phase: content.phase, name: content.name, message: content.message }
}
