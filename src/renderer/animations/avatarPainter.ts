import type { AvatarAppearance } from '../../shared/preferences'

const pictures = new Map<string, Promise<HTMLImageElement>>()
export function loadPicture(url: string) {
  if (!pictures.has(url)) pictures.set(url, new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = () => { pictures.delete(url); reject(new Error('Avatar artwork could not load.')) }; image.src = url
  }))
  return pictures.get(url)!
}
type Box = [number, number, number, number]
export type PaintRegions = { shirt: Box; pants: Box; bottle?: Box; bottleOutline?: number[][] }
const contains = ([x,y,w,h]: Box, px: number, py: number) => px >= x && px <= x+w && py >= y && py <= y+h
const rgb = (hex: string) => [1,3,5].map(offset => parseInt(hex.slice(offset, offset+2),16))
function inPolygon(points: number[][], x: number, y: number) {
  let inside = false
  for (let i=0,j=points.length-1;i<points.length;j=i++) {
    const [xi,yi]=points[i], [xj,yj]=points[j]
    if ((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside
  }
  return inside
}

// Runtime customization works on a registered pose, never changes its geometry.
// Region + source-color masks protect skin, hair, bottle, shoes and ink outlines.
export function colorClothes(surface: HTMLCanvasElement, appearance: AvatarAppearance, regions: PaintRegions) {
  const shirt = appearance.shirtColor ?? '#ffffff', pants = appearance.pantsColor ?? '#99c5e5'
  if (shirt === '#ffffff' && pants === '#99c5e5') return
  const ctx = surface.getContext('2d')!, pixels = ctx.getImageData(0,0,surface.width,surface.height), data = pixels.data
  const shirtRGB = rgb(shirt), pantsRGB = rgb(pants), ratio = surface.width / 250
  for (let i=0;i<data.length;i+=4) {
    if (data[i+3] < 100) continue
    const px=(i/4)%surface.width/ratio, py=Math.floor(i/4/surface.width)/ratio
    if (regions.bottleOutline ? inPolygon(regions.bottleOutline,px,py) : regions.bottle && contains(regions.bottle,px,py)) continue
    const r=data[i],g=data[i+1],b=data[i+2]
    const neutral = Math.max(r,g,b)-Math.min(r,g,b) < 40
    if (shirt !== '#ffffff' && contains(regions.shirt,px,py) && neutral && r > 90) {
      const shade = (r+g+b)/3/255
      for (let c=0;c<3;c++) data[i+c] = shirtRGB[c]*shade
    } else if (pants !== '#99c5e5' && contains(regions.pants,px,py) && b-r>15 && g-r>7 && b-g<65) {
      const shade = (r*.2126+g*.7152+b*.0722)/188
      for (let c=0;c<3;c++) data[i+c] = Math.min(255,pantsRGB[c]*shade)
    }
  }
  ctx.putImageData(pixels,0,0)
}
