import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { AppState } from '../shared/api'
import { Settings } from './screens/Settings'
import { Companion } from './screens/Companion'
import './styles.css'
const companion = window.location.hash === '#/companion'
document.body.className = companion ? 'companion-body' : 'settings-body'
function App() {
  const [state, setState] = useState<AppState | null>(null), [error, setError] = useState('')
  useEffect(() => { const unsubscribe = window.buddy.onState(setState); window.buddy.getState().then(setState).catch(() => setError('HydroBuddy could not load. Please quit from the tray and reopen the app.')); return unsubscribe }, [])
  if (error) return <p className="error">{error}</p>
  if (!state) return null
  return companion ? <Companion state={state}/> : <Settings state={state} onState={setState}/>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
