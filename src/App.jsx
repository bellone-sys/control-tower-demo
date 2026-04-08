import { useState, useCallback, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Overview from './components/sections/Overview'
import Spedizioni from './components/sections/Spedizioni'
import DensitaPopolare from './components/sections/DensitaPopolare'
import Giri from './components/sections/Giri'
import Scenari from './components/sections/Scenari'
import PuntiRitiro from './components/sections/PuntiRitiro'
import Flotta from './components/sections/Flotta'
import Autisti from './components/sections/Autisti'
import Filiali from './components/sections/Filiali'
import FilialiBrt from './components/sections/FilialiBrt'
import Contratti from './components/sections/Contratti'
import Utenti from './components/sections/Utenti'
import Eccezioni from './components/sections/Eccezioni'
import Report from './components/sections/Report'
import ReleaseNotes from './components/sections/ReleaseNotes'
import Credits from './components/sections/Credits'
import EsecuzioneGiri from './components/sections/EsecuzioneGiri'
import Segnalazioni from './components/sections/Segnalazioni'
import AnalisiCoperturaPudo from './components/sections/AnalisiCoperturaPudo'
import MonitoraggioEconomics from './components/sections/MonitoraggioEconomics'
import MonitoraggioQuality from './components/sections/MonitoraggioQuality'
import MonitoraggioPerformance from './components/sections/MonitoraggioPerformance'
import ProgressToast from './components/ui/ProgressToast'
import VersionUpdateModal from './components/VersionUpdateModal'
import { seedDemoHistory } from './services/historyService'
import { useVersionCheck } from './hooks/useVersionCheck'
import { TutorialProvider } from './contexts/TutorialContext'
import { I18nProvider } from './contexts/I18nContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ECCEZIONI } from './data/stub'
import { SEGNALAZIONI_INIT } from './data/segnalazioni'
import { APP_VERSION } from './version'
import './App.css'

function PlaceholderSection({ title, icon, desc }) {
  return (
    <div className="section-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center', color: 'var(--fp-gray-mid)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fp-charcoal)', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, maxWidth: 380, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  )
}

const SESSION_KEY = 'fp_ct_user'
let _notifCounter = 1

function loadSavedUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function App() {
  const [user,          setUser]          = useState(() => loadSavedUser())
  const [page,          setPage]          = useState(() => loadSavedUser() ? 'app' : 'landing')
  const [section,       setSection]       = useState('overview')
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [notifications, setNotifications] = useState([])
  const [activeJob,     setActiveJob]     = useState(null)
  const [newRelease,    setNewRelease]    = useState(null)

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else       localStorage.removeItem(SESSION_KEY)
  }, [user])

  useEffect(() => { seedDemoHistory() }, [])

  // ── Version check ────────────────────────────────────────────────
  useVersionCheck((releaseInfo) => {
    if (releaseInfo) {
      setNewRelease(releaseInfo)
      addNotification('info', 'Nuova versione disponibile', `v${releaseInfo.version} è pronta per il download`)
    }
  })

  const eccezioniAperte   = ECCEZIONI.filter(e => e.stato === 'Aperta').length
  const segnalazioniNonLette = SEGNALAZIONI_INIT.filter(s => s.stato === 'Non letta').length

  // ── Notification helpers ────────────────────────────────────────
  const addNotification = useCallback((type, title, message) => {
    const n = { id: _notifCounter++, type, title, message, ts: new Date(), read: false, archived: false }
    setNotifications(prev => [n, ...prev])
  }, [])

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => n.archived ? n : { ...n, read: true }))
  }, [])

  const clearNotif = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const archiveNotif = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true, read: true } : n))
  }, [])

  // ── Background job simulation ───────────────────────────────────
  const startJob = useCallback((label, onDone) => {
    const jobId = Date.now()
    setActiveJob({ id: jobId, label, progress: 0, status: 'running', detail: 'Connessione al sistema AS/400…' })

    const steps = [
      { pct: 8,   detail: 'Autenticazione…' },
      { pct: 18,  detail: 'Recupero lista spedizioni…' },
      { pct: 32,  detail: 'Download dati provincia 1/4…' },
      { pct: 48,  detail: 'Download dati provincia 2/4…' },
      { pct: 62,  detail: 'Download dati provincia 3/4…' },
      { pct: 76,  detail: 'Download dati provincia 4/4…' },
      { pct: 88,  detail: 'Elaborazione e normalizzazione…' },
      { pct: 96,  detail: 'Validazione record…' },
      { pct: 100, detail: null },
    ]

    let stepIdx = 0
    const MIN_STEP = 600, MAX_STEP = 1800

    function tick() {
      if (stepIdx >= steps.length) {
        setActiveJob(j => ({ ...j, progress: 100, status: 'done', detail: 'Completato' }))
        setTimeout(() => {
          setActiveJob(null)
          addNotification('success', label, 'Importazione completata con successo.')
          onDone && onDone()
        }, 2200)
        return
      }
      const { pct, detail } = steps[stepIdx++]
      setActiveJob(j => j?.id === jobId ? { ...j, progress: pct, detail: detail ?? 'Finalizzazione…' } : j)
      setTimeout(tick, MIN_STEP + Math.random() * (MAX_STEP - MIN_STEP))
    }

    setTimeout(tick, 400)
  }, [addNotification])

  function handleLogin(u)  { setUser(u); setPage('app') }
  function handleLogout()  { setUser(null); setPage('landing'); setSection('overview') }
  function handleNav(id)   { setSection(id); setSidebarOpen(false) }

  const SECTIONS = {
    overview:     <Overview />,
    spedizioni:   <Spedizioni onStartJob={startJob} addNotification={addNotification} onNav={handleNav} />,
    densita:      <DensitaPopolare />,
    scenari:      <Scenari onStartJob={startJob} addNotification={addNotification} />,
    giri:         <Giri onStartJob={startJob} addNotification={addNotification} />,
    punti:        <PuntiRitiro />,
    autisti:      <Autisti />,
    flotta:       <Flotta />,
    filiali:      <Filiali />,
    filialiBrt:   <FilialiBrt />,
    contratti:    <Contratti />,
    utenti:       <Utenti currentUser={user} />,
    eccezioni:    <Eccezioni />,
    report:       <Report />,
    releaseNotes: <ReleaseNotes />,
    credits:      <Credits />,
    economics:      <MonitoraggioEconomics />,
    quality:        <MonitoraggioQuality />,
    performance:    <MonitoraggioPerformance />,
    analisiCopertura: <AnalisiCoperturaPudo />,
    esecuzioneGiri: <EsecuzioneGiri />,
    segnalazioni:   <Segnalazioni />,
  }

  return (
    <ThemeProvider>
    <I18nProvider>
    <TutorialProvider>

      {page === 'landing' && (
        <Landing
          isAuthenticated={!!user}
          onGoToDashboard={() => setPage('app')}
          onGoToLogin={() => setPage('login')}
        />
      )}

      {(page === 'login' || (page !== 'landing' && !user)) && (
        <Login onLogin={handleLogin} />
      )}

      {page === 'app' && user && (
        <div className="app-shell">
          <div className={`sidebar-backdrop${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />

          <Sidebar
            active={section}
            onNav={handleNav}
            eccezioniCount={eccezioniAperte}
            segnalazioniCount={segnalazioniNonLette}
            user={user}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="app-main">
            <Header
              user={user}
              section={section}
              onLogout={handleLogout}
              onMenuToggle={() => setSidebarOpen(o => !o)}
              notifications={notifications}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              onClearNotif={clearNotif}
              onArchiveNotif={archiveNotif}
            />
            <main className="app-content">
              {SECTIONS[section]}
            </main>
            <footer className="app-docs-footer">
              <div className="app-footer-section">
                <span className="app-footer-label">Documentazione</span>
                <div className="app-footer-links">
                  <a href="/control-tower-demo/manuale.html"    target="_blank" rel="noopener noreferrer">Manuale Utente ↗</a>
                  <a href="/control-tower-demo/requisiti.html"  target="_blank" rel="noopener noreferrer">Requisiti ↗</a>
                  <a href="/control-tower-demo/funzionale.html" target="_blank" rel="noopener noreferrer">Doc. Funzionale ↗</a>
                  <a href="/control-tower-demo/tecnica.html"    target="_blank" rel="noopener noreferrer">Doc. Tecnica ↗</a>
                  <a href="/control-tower-demo/api.html"        target="_blank" rel="noopener noreferrer">API Reference ↗</a>
                  <a href="/control-tower-demo/playbook.html"   target="_blank" rel="noopener noreferrer">Playbook Operativo ↗</a>
                </div>
              </div>
              <span className="app-footer-divider" />
              <div className="app-footer-section">
                <span className="app-footer-label">Piattaforma</span>
                <div className="app-footer-links">
                  <button className="app-footer-nav" onClick={() => handleNav('releaseNotes')}>Release Notes</button>
                  <button className="app-footer-nav" onClick={() => handleNav('credits')}>Credits</button>
                </div>
              </div>
            </footer>
          </div>

          <ProgressToast job={activeJob} />
        </div>
      )}

      <VersionUpdateModal release={newRelease} onClose={() => setNewRelease(null)} />

    </TutorialProvider>
    </I18nProvider>
    </ThemeProvider>
  )
}
