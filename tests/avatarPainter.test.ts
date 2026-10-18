import { describe, expect, it } from 'vitest'
import { colorClothes } from '../src/renderer/animations/avatarPainter'
import { reactionArtwork } from '../src/renderer/animations/reactionArtwork'
import { defaults } from '../src/shared/preferences'

// Coordinates inside the sleeves that the old shared bottle rectangle covered.
const femaleSleeves = [179, 159, 147, 126]
const bottleOffsets = [0, -21, -36, -56]

describe('reaction clothing coverage', () => {
  for (const male of [false, true]) {
    for (let frame = 0; frame < 4; frame++) {
      it(`${male ? 'male' : 'female'} pose ${frame}: colors the sleeve and torso while protecting bottle highlights`, () => {
        const art = reactionArtwork(male, frame)
        const pixels = new Uint8ClampedArray(500 * 724 * 4)
        const location = (x: number, y: number) => (Math.round(y * 2) * 500 + Math.round(x * 2)) * 4
        const sleeve = location(art.dx + (male ? 113 : femaleSleeves[frame]) * art.scale, art.dy + (male ? 345 : 130) * art.scale)
        const torso = location(125, 150)
        const bottle = location(art.dx + (male ? 65 : 147 + bottleOffsets[frame]) * art.scale, art.dy + (male ? 282 : 105) * art.scale)
        for (const offset of [sleeve, torso, bottle]) pixels.set([240, 240, 240, 255], offset)
        const surface = {
          width: 500, height: 724,
          getContext: () => ({ getImageData: () => ({ data: pixels }), putImageData: () => {} }),
        } as unknown as HTMLCanvasElement
        colorClothes(surface, { ...defaults.avatar, shirtColor: '#6ba991' }, art.regions)
        for (const offset of [sleeve, torso]) expect([...pixels.slice(offset, offset + 4)]).toEqual([101, 159, 136, 255])
        expect([...pixels.slice(bottle, bottle + 4)]).toEqual([240, 240, 240, 255])
      })
    }
  }
})
