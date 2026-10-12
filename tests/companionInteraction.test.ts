import { afterEach, expect, it, vi } from 'vitest'
import { CompanionInteraction } from '../src/main/companionInteraction'

afterEach(() => vi.useRealTimers())
function setup() {
  vi.useFakeTimers()
  const point = { x: 160, y: 260 }
  const window = { isVisible: () => true, getContentBounds: () => ({ x: 100, y: 200, width: 400, height: 500 }), setIgnoreMouseEvents: vi.fn() }
  const hit = new CompanionInteraction(window, () => point)
  return { hit, point, window }
}
it('accepts a click when the bubble appears under a stationary pointer', () => {
  const { hit, window } = setup()
  hit.setBounds({ x: 20, y: 30, width: 200, height: 120 })
  expect(window.setIgnoreMouseEvents).toHaveBeenLastCalledWith(false, { forward: true })
  hit.dispose()
})
it('tracks native pointer movement without renderer mouse events and clears on dismissal', () => {
  const { hit, point, window } = setup()
  hit.setBounds({ x: 20, y: 30, width: 200, height: 120 })
  point.x = 480
  vi.advanceTimersByTime(16)
  expect(window.setIgnoreMouseEvents).toHaveBeenLastCalledWith(true, { forward: true })
  point.x = 160
  vi.advanceTimersByTime(16)
  expect(window.setIgnoreMouseEvents).toHaveBeenLastCalledWith(false, { forward: true })
  hit.setBounds(null)
  expect(window.setIgnoreMouseEvents).toHaveBeenLastCalledWith(true, { forward: true })
  expect(vi.getTimerCount()).toBe(0)
})
it('rejects invalid or out-of-window rectangles', () => {
  const { hit } = setup()
  for (const bounds of [undefined, true, {}, { x: -1, y: 0, width: 20, height: 20 }, { x: 0, y: 0, width: 900, height: 20 }, { x: 0, y: 0, width: NaN, height: 20 }]) expect(() => hit.setBounds(bounds)).toThrow('Invalid interaction bounds')
  hit.dispose()
})
