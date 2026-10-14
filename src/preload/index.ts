import { contextBridge, ipcRenderer } from 'electron'
import type { BuddyAPI, AppState, BubbleContent, BubbleAction } from '../shared/api'
const api: BuddyAPI = {
  showBubble: value => ipcRenderer.send('bubble:show', value), getBubble: () => ipcRenderer.invoke('bubble:get'),
  answerBubble: action => ipcRenderer.send('bubble:answer', action),
  onBubble: fn => { const listener = (_: unknown, value: BubbleContent | null) => fn(value); ipcRenderer.on('bubble:changed', listener); return () => ipcRenderer.removeListener('bubble:changed', listener) },
  onBubbleAction: fn => { const listener = (_: unknown, action: BubbleAction) => fn(action); ipcRenderer.on('bubble:action', listener); return () => ipcRenderer.removeListener('bubble:action', listener) },
  getState: () => ipcRenderer.invoke('state:get'), savePreferences: value => ipcRenderer.invoke('preferences:save', value),
  testReminder: () => ipcRenderer.invoke('reminder:test'), finishReminder: () => ipcRenderer.send('reminder:finished'),
  closeSettings: () => ipcRenderer.send('settings:close'), setInteractionBounds: value => ipcRenderer.send('companion:bounds', value),
  importAvatar: () => ipcRenderer.invoke('avatar:import'), readAvatar: id => ipcRenderer.invoke('avatar:read', id),
  importAvatarData: bytes => ipcRenderer.invoke('avatar:drop', bytes), useSuppliedAvatar: () => ipcRenderer.invoke('avatar:supplied'),
  onState: fn => { const listener = (_: unknown, state: AppState) => fn(state); ipcRenderer.on('state:changed', listener); return () => ipcRenderer.removeListener('state:changed', listener) },
  onReminder: fn => { const listener = () => fn(); ipcRenderer.on('reminder:start', listener); return () => ipcRenderer.removeListener('reminder:start', listener) }
}
contextBridge.exposeInMainWorld('buddy', api)
