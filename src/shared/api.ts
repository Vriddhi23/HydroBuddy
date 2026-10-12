import type { Preferences } from './preferences'
export type AppState = { preferences: Preferences; nextReminderAt: number | null; active: boolean; fastMode: boolean; startupSupported: boolean }
export type AvatarAsset = { id: string; dataUrl: string; hasTransparency: boolean; motionPack?: 'supplied-v1' }
export type InteractionBounds = { x: number; y: number; width: number; height: number }
export type BuddyAPI = {
  getState(): Promise<AppState>; savePreferences(value: Preferences): Promise<AppState>;
  testReminder(): Promise<void>; finishReminder(): void; closeSettings(): void; setInteractionBounds(value: InteractionBounds | null): void;
  importAvatar(): Promise<AvatarAsset | null>; readAvatar(id: string): Promise<AvatarAsset | null>;
  importAvatarData(bytes: Uint8Array): Promise<AvatarAsset>; useSuppliedAvatar(): Promise<AvatarAsset>;
  onState(fn: (state: AppState) => void): () => void; onReminder(fn: () => void): () => void
}
declare global { interface Window { buddy: BuddyAPI } }
