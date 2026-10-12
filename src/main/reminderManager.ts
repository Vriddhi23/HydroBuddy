export class ReminderManager {
  nextReminderAt: number | null = null
  active = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private watchdog: ReturnType<typeof setTimeout> | null = null
  private enabled = false
  private interval = 3600000
  constructor(private show: () => void, private hide: () => void, private changed: () => void) {}
  configure(enabled: boolean, interval: number) {
    this.enabled = enabled; this.interval = interval
    if (!enabled && this.active) this.finish()
    else if (!this.active) this.schedule()
  }
  private clear() { if (this.timer) clearTimeout(this.timer); this.timer = null; this.nextReminderAt = null }
  private schedule() {
    this.clear()
    if (this.enabled) { this.nextReminderAt = Date.now() + this.interval; this.timer = setTimeout(() => this.start(), this.interval) }
    this.changed()
  }
  start() {
    if (this.active) return
    this.clear(); this.active = true
    // Safety recovery if a renderer crashes or never completes the interaction.
    this.watchdog = setTimeout(() => this.finish(), 90000)
    this.show(); this.changed()
  }
  finish() {
    if (this.watchdog) clearTimeout(this.watchdog)
    this.watchdog = null; this.active = false; this.hide(); this.schedule()
  }
  resume() { if (!this.active) this.schedule() }
  dispose() { this.clear(); if (this.watchdog) clearTimeout(this.watchdog) }
}
