import { useEffect, useState } from 'react'
import { Droplet, Bell, UserRound, ArrowRight, Play, Check, RotateCcw, FolderLock, Info, X } from 'lucide-react'
import type { AppState } from '../../shared/api'
import { defaults } from '../../shared/preferences'
import { AvatarCustomizer } from '../components/AvatarCustomizer'
import { AvatarImport } from '../components/AvatarImport'
import { AvatarChooser } from '../components/AvatarChooser'
import { AvatarPreview } from '../components/AvatarPreview'
import { AboutDialog } from '../components/AboutDialog'

export function Settings({ state, onState }: { state: AppState; onState: (s: AppState) => void }) {
  const [draft, setDraft] = useState(state.preferences)
  const [choosing, setChoosing] = useState(!state.preferences.onboardingCompleted)
  const [tab, setTab] = useState<'buddy' | 'routine'>('buddy')
  const [source, setSource] = useState<'builtin' | 'custom'>(state.preferences.avatar.source)
  const [busy, setBusy] = useState(false), [importing, setImporting] = useState(false)
  const [notice, setNotice] = useState(''), [error, setError] = useState(''), [about, setAbout] = useState(false)
  const [now, setNow] = useState(Date.now())
  const onboarding = !state.preferences.onboardingCompleted
  // Active/next-visit updates do not replace unsaved edits.
  const savedPreferences = JSON.stringify(state.preferences)
  useEffect(() => {
    const preferences = JSON.parse(savedPreferences) as AppState['preferences']
    setDraft(preferences); setSource(preferences.avatar.source)
  }, [savedPreferences])
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  useEffect(() => { if (!notice) return; const id = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(id) }, [notice])
  const preview = { ...draft, avatar: { ...draft.avatar, source: source === 'custom' && draft.avatar.frontAsset ? 'custom' as const : 'builtin' as const } }
  const ready = !!draft.buddyName.trim() && !!draft.greeting.trim() && !(source === 'custom' && !draft.avatar.frontAsset)
  async function save(meet = false, test = false) {
    setBusy(true); setError('')
    try {
      const updated = await window.buddy.savePreferences({ ...preview, onboardingCompleted: true })
      onState(updated); setNotice('Saved. See you at the next sip.')
      if (meet || test) await window.buddy.testReminder()
      if (meet) window.buddy.closeSettings()
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error invoking remote method '[^']+': Error: /, '') : 'Could not save. Please try again.')
    } finally { setBusy(false) }
  }
  const minutes = state.nextReminderAt ? Math.max(1, Math.ceil((state.nextReminderAt - now) / 60000)) : null
  const disabled = busy || importing || !ready
  return <div className="studio">
    <header className="studio-header">
      <div className="wordmark"><span className="wordmark-drop"><Droplet size={25} strokeWidth={2.2}/><i/></span><span>hydro<span>buddy</span><small>DESKTOP COMPANY</small></span></div>
      <nav className="studio-tabs" aria-label="Settings sections">
        <button aria-current={tab === 'buddy' ? 'page' : undefined} onClick={() => setTab('buddy')}><UserRound size={16}/> Your buddy</button>
        <button aria-current={tab === 'routine' ? 'page' : undefined} onClick={() => setTab('routine')}><Bell size={16}/> Your routine</button>
      </nav>
      <button className="icon-button info-button" aria-label="About HydroBuddy" onClick={() => setAbout(true)}><Info size={19}/></button>
    </header>
    <div className="studio-workspace">
      <AvatarPreview preferences={preview}/>
      <main className="inspector">
        <div className="inspector-heading"><span className="chapter">{tab === 'buddy' ? '01 / THE FACE' : '02 / THE HABIT'}</span><h1>{tab === 'buddy' ? onboarding ? 'Make yourself at home.' : 'A buddy that feels like you.' : 'A rhythm that fits your day.'}</h1><p>{tab === 'buddy' ? 'Pick a character, or bring a little version of yourself.' : 'You set the pace. Your buddy takes it from here.'}</p></div>
        {tab === 'buddy' ? <>
          <label className="field-label" htmlFor="buddy-name">What should we call your buddy?</label>
          <div className="name-field"><input id="buddy-name" value={draft.buddyName} maxLength={24} onChange={e => setDraft({ ...draft, buddyName: e.target.value })} placeholder="Buddy"/><span>{draft.buddyName.length}/24</span></div>
          <div className="current-avatar-label"><span>{source === 'custom' ? 'Your own avatar' : 'Your character'}</span><button className="text-button" onClick={() => setChoosing(true)}>Change avatar →</button></div>
          {source === 'builtin' ? <><AvatarCustomizer value={draft.avatar} onChange={avatar => setDraft({ ...draft, avatar })}/><button className="text-button reset-button" onClick={() => setDraft({ ...draft, avatar: { ...draft.avatar, gender: defaults.avatar.gender, clothingColor: defaults.avatar.clothingColor, bottleColor: defaults.avatar.bottleColor } })}><RotateCcw size={13}/> Reset colors & character</button></> : <AvatarImport value={draft.avatar} onChange={avatar => setDraft({ ...draft, avatar })} onBusy={setImporting}/>}
          <div className="greeting-field"><label className="field-label" htmlFor="greeting">A reminder, in your words.</label><textarea id="greeting" rows={2} maxLength={110} value={draft.greeting} onChange={e => setDraft({ ...draft, greeting: e.target.value.replace(/[\r\n]/g, ' ') })}/><small>A ready-made hello, or make it your own.</small><button className="text-button greeting-reset" onClick={() => setDraft({ ...draft, greeting: defaults.greeting })}>Use the original greeting</button></div>
        </> : <div className="routine-settings">
          <div className="setting-row"><div><h2>Water reminders</h2><p>Pause whenever you need some space.</p></div><button role="switch" aria-checked={draft.remindersEnabled} aria-label="Enable reminders" className={`toggle ${draft.remindersEnabled ? 'on' : ''}`} onClick={() => setDraft({ ...draft, remindersEnabled: !draft.remindersEnabled })}><span/></button></div>
          <fieldset className="interval-field"><legend>A visit every</legend><div className="intervals">{[30,45,60,90].map(value => <button key={value} aria-label={`${value} minutes`} aria-pressed={draft.reminderInterval === value} className={draft.reminderInterval === value ? 'selected' : ''} onClick={() => setDraft({ ...draft, reminderInterval: value })}><strong>{value}</strong><span>min</span></button>)}</div></fieldset>
          <div className="setting-row startup"><div><h2>Be here when I log in</h2><p>Start quietly with your computer.</p>{!state.startupSupported && <small>Available after installing HydroBuddy.</small>}</div><button role="switch" aria-checked={draft.launchAtStartup} aria-label="Start HydroBuddy when I start my computer" disabled={!state.startupSupported} className={`toggle ${draft.launchAtStartup ? 'on' : ''}`} onClick={() => setDraft({ ...draft, launchAtStartup: !draft.launchAtStartup })}><span/></button></div>
          <div className="routine-note"><span className="note-pin"/><h3>A guest with good manners.</h3><p>No sound. No stolen keyboard focus.<br/>Close a visit whenever you like.</p><p>Closing this window keeps your buddy in the system tray. Use Quit there to finish for the day.</p></div>
          {state.fastMode && <p className="dev-note">Testing mode: a visit every 10 seconds.</p>}
        </div>}
      </main>
    </div>
    <footer className="studio-footer"><div className="footer-status"><span className={state.preferences.remindersEnabled ? 'status-dot' : 'status-dot paused'}/><div><strong>{onboarding ? 'Ready when you are.' : state.active ? 'Your buddy is visiting.' : minutes ? `Next visit in ${minutes} min` : 'Reminders are paused.'}</strong><small><FolderLock size={11}/> Saved on this computer. Always.</small></div></div><div className="footer-actions"><button className="secondary" disabled={disabled || state.active} onClick={() => void save(false, true)}><Play size={14}/> Test Reminder</button><button className="primary" disabled={disabled} onClick={() => void save(onboarding)}>{busy ? 'Saving…' : onboarding ? 'Meet My HydroBuddy' : 'Save changes'}{onboarding ? <ArrowRight size={16}/> : <Check size={16}/>}</button></div></footer>
    {(error || notice) && <div className={`toast ${error ? 'error-toast' : 'success'}`} role={error ? 'alert' : 'status'}>{error || notice}<button aria-label="Close message" onClick={() => { setError(''); setNotice('') }}><X size={15}/></button></div>}
    {choosing && <AvatarChooser value={draft.avatar} initial={onboarding} onClose={() => setChoosing(false)} onChoose={avatar => { setDraft({ ...draft, avatar }); setSource(avatar.source); setChoosing(false) }}/>}
    {about && <AboutDialog onClose={() => setAbout(false)}/>}
  </div>
}

