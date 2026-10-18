import type { PaintRegions } from './avatarPainter'

const registration = [[224.5, 351], [205, 351], [214, 351], [202, 351]]
const bottleOffsets = [0, -21, -36, -56]
// Trace the bottle itself: a shared rectangular exclusion also hid the sleeve
// when the bottle moved left in the waving and celebrating artwork.
const femaleBottle = [[130, 69], [154, 69], [171, 78], [173, 100], [181, 153], [176, 163], [149, 167], [143, 158], [136, 109], [133, 94], [129, 80]]
const maleBottle = [[29, 228], [61, 223], [83, 243], [96, 244], [99, 269], [105, 281], [111, 370], [103, 383], [53, 388], [43, 377], [38, 283], [44, 268], [39, 252]]

export function reactionArtwork(male: boolean, index: number) {
  const scale = male ? 337 / 884 : 1
  const [headX, floor] = male ? [192, 960] : registration[index]
  const dx = 125 - headX * scale, dy = 354 - floor * scale
  const cellWidth = male ? 384 : 362
  const regions: PaintRegions = {
    shirt: [35, 94, 175, 88],
    pants: [55, 175, 145, 165],
    bottleOutline: (male ? maleBottle : femaleBottle).map(([x, y]) => [
      dx + (x + (male ? 0 : bottleOffsets[index])) * scale,
      dy + y * scale,
    ]),
  }
  return { scale, dx, dy, cellWidth, cellHeight: male ? 1024 : 362, sourceY: male ? 0 : 724, regions }
}
