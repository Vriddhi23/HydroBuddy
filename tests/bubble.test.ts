import { expect, it } from 'vitest'
import { validateBubble } from '../src/shared/bubble'
it('accepts only visible reminder phases and allowlisted data', () => {
  for (const phase of ['greeting','asking','positive','negative']) expect(validateBubble({ phase,name:'Buddy',message:'Hello',extra:'ignored' })).toEqual({phase,name:'Buddy',message:'Hello'})
})
it('rejects malformed, oversized and invalid phase messages', () => {
  for (const value of [undefined,0,'asking',{}, {phase:'exiting',name:'Buddy',message:'Hello'}, {phase:'asking',name:'x'.repeat(25),message:'Hello'}, {phase:'asking',name:'Buddy',message:'x'.repeat(161)}, {phase:'asking',name:3,message:'Hello'}]) expect(()=>validateBubble(value)).toThrow()
})
it('supports explicit hiding without retaining stale content', () => { expect(validateBubble(null)).toBeNull() })
