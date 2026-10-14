import type { AvatarAppearance } from '../../shared/preferences'
import { type AnimationState } from './HydroBuddyAvatar'
import { useAvatarAsset } from '../hooks/useAvatarAsset'
import type { Phase } from '../animations/reminder'
import { SuppliedAvatar } from './SuppliedAvatar'

export function BuddyFigure({ appearance, phase = 'rest', label = 'Your buddy' }: { appearance: AvatarAppearance; phase?: Phase | 'rest'; label?: string }) {
  const { asset: front } = useAvatarAsset(appearance.frontAsset)
  const custom = appearance.source === 'custom' && !!front
  const animated = !custom || front.motionPack === 'supplied-v1'
  const animation: AnimationState = phase === 'entering' ? 'walking' : phase === 'exiting' ? 'exiting' : phase === 'greeting' || phase === 'waving' ? 'waving' : phase === 'positive' ? 'celebrating' : phase === 'negative' ? 'sad' : 'idle'
  return <div className={`buddy-figure figure-${phase} ${custom ? 'custom-figure' : 'builtin-figure'} ${animated ? 'animated-figure' : ''}`} data-renderer={animated ? 'supplied-motion' : custom ? 'custom-flat' : 'builtin'} role="img" aria-label={label}>
    <div className="figure-front">
      {animated ? <SuppliedAvatar phase={phase} appearance={appearance}/> : custom ? <img className={`imported-art imported-${animation}`} src={front.dataUrl} alt="" draggable="false"/> : null}
    </div>
    {custom && <span className="imported-shadow"/>}
    {custom && !animated && phase === 'waving' && <span className="reaction-mark" aria-hidden="true">👋</span>}
    {phase === 'positive' && <span className="reaction-mark happy-mark" aria-hidden="true">♡</span>}
  </div>
}

