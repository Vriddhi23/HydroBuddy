import { describe, it, expect, vi, afterEach } from 'vitest'
import { ReminderManager } from '../src/main/reminderManager'
describe('reminder lifecycle', () => {
  afterEach(() => vi.useRealTimers())
  function setup() { vi.useFakeTimers(); const show = vi.fn(), hide = vi.fn(); const manager = new ReminderManager(show, hide, vi.fn()); return { manager, show, hide } }
  it('waits a full hour and restarts only after goodbye', () => { const { manager,show } = setup(); manager.configure(true,3600000); vi.advanceTimersByTime(3599999); expect(show).not.toHaveBeenCalled(); vi.advanceTimersByTime(1); expect(show).toHaveBeenCalledTimes(1); expect(manager.nextReminderAt).toBeNull(); manager.finish(); vi.advanceTimersByTime(3600000); expect(show).toHaveBeenCalledTimes(2); manager.dispose() })
  it('prevents overlapping reminders, including repeated test clicks', () => { const { manager,show } = setup(); manager.start(); manager.start(); expect(show).toHaveBeenCalledTimes(1); manager.dispose() })
  it('pauses an active visit and leaves test available while paused', () => { const { manager,hide,show } = setup(); manager.configure(true,10000); manager.start(); manager.configure(false,10000); expect(hide).toHaveBeenCalled(); vi.advanceTimersByTime(60000); expect(show).toHaveBeenCalledTimes(1); expect(manager.nextReminderAt).toBeNull(); manager.start(); expect(show).toHaveBeenCalledTimes(2); manager.finish(); expect(manager.nextReminderAt).toBeNull(); manager.dispose() })
  it('recovers from a stuck renderer and schedules again', () => { const { manager,hide } = setup(); manager.configure(true,3600000); manager.start(); vi.advanceTimersByTime(90000); expect(manager.active).toBe(false); expect(hide).toHaveBeenCalled(); expect(manager.nextReminderAt).toBe(Date.now()+3600000); manager.dispose() })
  it('starts a fresh interval after waking instead of accumulating reminders', () => { const { manager,show } = setup(); manager.configure(true,10000); vi.advanceTimersByTime(9000); manager.resume(); vi.advanceTimersByTime(9000); expect(show).not.toHaveBeenCalled(); vi.advanceTimersByTime(1000); expect(show).toHaveBeenCalledTimes(1); manager.dispose() })
})
