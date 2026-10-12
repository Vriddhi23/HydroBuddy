import { nativeImage } from 'electron'
import { mkdir, open, readFile, writeFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { imageSize } from 'image-size'
import { assetIdPattern } from '../shared/preferences'
import type { AvatarAsset } from '../shared/api'

export class AvatarAssets {
  private directory: string
  constructor(userData: string) { this.directory = join(userData, 'avatars') }
  async import(filePath: string, motionPack?: 'supplied-v1'): Promise<AvatarAsset> {
    // Paths come only from the native file picker, never renderer-controlled IPC.
    const file = await open(filePath, 'r')
    let bytes: Buffer
    try {
      const stat = await file.stat()
      if (!stat.isFile() || stat.size > 8 * 1024 * 1024) throw new Error('Choose a PNG or WebP smaller than 8 MB.')
      bytes = await file.readFile()
    } finally { await file.close() }
    const asset = await this.importBytes(bytes)
    if (motionPack) await writeFile(join(this.directory, `${asset.id}.json`), JSON.stringify({ motionPack }))
    return { ...asset, motionPack }
  }
  async importBytes(bytes: Buffer): Promise<AvatarAsset> {
    if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new Error('Choose a PNG or WebP smaller than 8 MB.')
    let dimensions: ReturnType<typeof imageSize>
    try { dimensions = imageSize(bytes) } catch { throw new Error('This file is not a readable PNG or WebP image.') }
    if (!['png', 'webp'].includes(dimensions.type ?? '') || !dimensions.width || !dimensions.height) throw new Error('Please choose a PNG or WebP image.')
    if (dimensions.width > 4096 || dimensions.height > 4096 || dimensions.width * dimensions.height > 12000000) throw new Error('Choose an image no larger than 4096 pixels per side (12 megapixels).')
    let decoded = nativeImage.createFromBuffer(bytes)
    if (decoded.isEmpty()) throw new Error('This image could not be opened. Try exporting it as a PNG.')
    const scale = Math.min(1, 768 / Math.max(dimensions.width, dimensions.height))
    decoded = decoded.resize({ width: Math.max(1, Math.round(dimensions.width * scale)), height: Math.max(1, Math.round(dimensions.height * scale)), quality: 'best' })
    const { width, height } = decoded.getSize(), bitmap = decoded.toBitmap()
    let left = width, top = height, right = -1, bottom = -1
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (bitmap[(y * width + x) * 4 + 3] > 8) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y) }
    }
    if (right < left) throw new Error('This image is completely transparent. Choose an avatar with visible artwork.')
    // Trim only transparent padding. Opaque backgrounds remain unchanged.
    decoded = decoded.crop({ x: left, y: top, width: right - left + 1, height: bottom - top + 1 })
    const id = randomUUID()
    await mkdir(this.directory, { recursive: true })
    await writeFile(join(this.directory, `${id}.png`), decoded.toPNG(), { flag: 'wx' })
    return { id, dataUrl: decoded.toDataURL(), hasTransparency: this.hasTransparency(decoded.toBitmap()) }
  }
  async read(id: string): Promise<AvatarAsset | null> {
    if (!assetIdPattern.test(id)) throw new Error('Invalid avatar reference')
    try {
      const decoded = nativeImage.createFromBuffer(await readFile(join(this.directory, `${id}.png`)))
      if (decoded.isEmpty()) return null
      let motionPack: 'supplied-v1' | undefined
      try { const metadata = JSON.parse(await readFile(join(this.directory, `${id}.json`), 'utf8')); if (metadata.motionPack === 'supplied-v1') motionPack = 'supplied-v1' } catch { /* Ordinary imports have no animation pack. */ }
      return { id, dataUrl: decoded.toDataURL(), hasTransparency: this.hasTransparency(decoded.toBitmap()), motionPack }
    } catch { return null }
  }
  async remove(id: string) {
    if (!assetIdPattern.test(id)) throw new Error('Invalid avatar reference')
    await unlink(join(this.directory, `${id}.png`)).catch(() => {})
    await unlink(join(this.directory, `${id}.json`)).catch(() => {})
  }
  private hasTransparency(bitmap: Buffer) {
    for (let i = 3; i < bitmap.length; i += 4) if (bitmap[i] < 250) return true
    return false
  }
}
