import type { InteractionBounds } from '../shared/api'

type HitWindow = {
  isVisible(): boolean
  getContentBounds(): InteractionBounds
  setIgnoreMouseEvents(ignore: boolean, options: { forward: boolean }): void
}
export class CompanionInteraction {
  private bounds: InteractionBounds | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private interactive = false
  constructor(private window: HitWindow, private cursor: () => { x: number; y: number }) {}
  setBounds(input: unknown) {
    if (input !== null) {
      if (typeof input !== 'object') throw new Error('Invalid interaction bounds')
      const b = input as InteractionBounds, size = this.window.getContentBounds()
      if (![b.x,b.y,b.width,b.height].every(Number.isFinite) || b.x < 0 || b.y < 0 || b.width <= 0 || b.height <= 0 || b.x+b.width > size.width+1 || b.y+b.height > size.height+1) throw new Error('Invalid interaction bounds')
      this.bounds = { x:b.x,y:b.y,width:b.width,height:b.height }
    } else this.bounds = null
    if (this.timer) clearInterval(this.timer)
    this.timer = this.bounds ? setInterval(() => this.refresh(), 16) : null
    this.refresh()
  }
  private refresh() {
    const b=this.bounds, origin=this.window.getContentBounds(), point=this.cursor()
    const x=point.x-origin.x,y=point.y-origin.y
    const interactive=!!b && this.window.isVisible() && x>=b.x && x<=b.x+b.width && y>=b.y && y<=b.y+b.height
    if (interactive !== this.interactive) {
      this.interactive=interactive
      this.window.setIgnoreMouseEvents(!interactive,{forward:true})
    }
  }
  dispose() { if(this.timer)clearInterval(this.timer);this.timer=null }
}
