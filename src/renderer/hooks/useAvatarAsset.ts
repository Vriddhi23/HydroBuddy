import { useEffect, useState } from 'react'
import type { AvatarAsset } from '../../shared/api'
const cache = new Map<string, AvatarAsset>()
export function rememberAvatar(asset: AvatarAsset) { cache.set(asset.id, asset) }
export function useAvatarAsset(id: string | null) {
  const [asset, setAsset] = useState<AvatarAsset | null>(id ? cache.get(id) ?? null : null)
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    let current = true
    setMissing(false)
    if (!id) { setAsset(null); return }
    const existing = cache.get(id)
    if (existing) { setAsset(existing); return }
    window.buddy.readAvatar(id).then(result => {
      if (!current) return
      if (result) rememberAvatar(result)
      setAsset(result); setMissing(!result)
    }).catch(() => { if (current) { setAsset(null); setMissing(true) } })
    return () => { current = false }
  }, [id])
  return { asset: asset?.id === id ? asset : null, missing }
}
