import { useState, useCallback, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Overview from './components/sections/Overview'
import Spedizioni from './components/sections/Spedizioni'
import Giri from './components/sections/Giri'
import PuntiRitiro from './components/sections/PuntiRitiro'
import Flotta from './components/sections/Flotta'
import Filiali from './components/sections/Filiali'
import Contratti from './components/sections/Contratti'
import Utenti from './components/sections/Utenti'
import Eccezioni from './components/sections/Eccezioni'
import Report from './components/sections/Report'
import Documentazione from './components/sections/Documentazione'
import ProgressToast from './components/ui/ProgressToast'
import { seedDemoHistory } from './services/historyService'
import { TutorialProvider } from './contexts/TutorialContext'
import { I18nProvider } from './contexts/I18nContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ECCEZIONI } from './data/stub'
import './App.css'

const SESSION_KEY = 'fp_ct_user'

let _notifCounter = 1

function loadSavedUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [user, setUser]               = useState(() => loadSavedUser())
  // page: 'landing' | 'login' | 'app'
  const [page, setPage]               = useState(() => loadSavedUser() ? 'app' : 'landing')
  const [section, setSection]         = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [activeJob, setActiveJob]     = useState(null)

  // Sincronizza user su localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [user])

  // Seed demo history events on first load
  useEffect(() => { seedDemoHistory() }, [])

  const eccezioniAperte = ECCEZIONI.filter(e => e.stato === 'Aperta').length

  // ── Notification helpers ────────────────────────────────────────
  const addNotification = useCallback((type, title, message) => {
    const n = { id: _notifCounter++, type, title, message, ts: new Date(), read: false }
    setNotifications(prev => [n, ...prev])
  }, [])

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotif = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // ── Background job simulation ───────────────────────────────────
  const startJob = useCallback((label, onDone) => {
    const jobId = Date.now()
    setActiveJob({ id: jobId, label, progress: 0, status: 'running', detail: 'Connessione al sistema AS/400…' })

    const steps = [
      { pct: 8,  detail: 'Autenticazione…' },
      { pct: 18, detail: 'Recupero lista spedizioni…' },
      { pct: 32, detail: 'Download dati provincia 1/4…' },
      { pct: 48, detail: 'Download dati provincia 2/4…' },
      { pct: 62, detail: 'Download dati provincia 3/4…' },
      { pct: 76, detail: 'Download dati provincia 4/4…' },
      { pct: 88, detail: 'Elaborazione e normalizzazione…' },
      { pct: 96, detail: 'Validazione record…' },
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
      const delay = MIN_STEP + Math.random() * (MAX_STEP - MIN_STEP)
      setTimeout(tick, delay)
    }

    setTimeout(tick, 400)
  }, [addNotification])

  // ── Auth handlers ──────────────────────────────────────────────
  function handleLogin(u) {
    setUser(u)
    setPage('app')
  }

  function handleLogout() {
    setUser(null)
    setPage('landing')
    setSection('overview')
  }

  // ── Routing ────────────────────────────────────────────────────
  if (page === 'landing') {
    return (
      <Landing
        isAuthenticated={!!user}
        onGoToDashboard={() => setPage('app')}
        onGoToLogin={() => setPage('login')}
      />
    )
  }

  if (page === 'login' || !user) {
    return <Login onLogin={handleLogin} />
  }

  // page === 'app'
  function handleNav(id) {
    setSection(id)
    setSidebarOpen(false)
  }

  const SECTIONS = {
    overview:   <Overview />,
    spedizioni: <Spedizioni onStartJob={startJob} addNotification={addNotification} />,
    giri:       <Giri onStartJob={startJob} addNotification={addNotification} />,
    punti:      <PuntiRitiro />,
    flotta:     <Flotta />,
    filiali:    <Filiali />,
    contratti:  <Contratti />,
    utenti:     <Utenti currentUser={user} />,
    eccezioni:  <Eccezioni />,
    report:     <Report />,
    docs:       <Documentazione />,
  }

  return (
    <ThemeProvider>
    <I18nProvider>
    <TutorialProvider>
      <div className="app-shell">
        {/* Backdrop mobile */}
        <div
          className={`sidebar-backdrop${sidebarOpen ? ' show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <Sidebar
          active={section}
          onNav={handleNav}
          eccezioniCount={eccezioniAperte}
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
          />
          <main className="app-content">
            {SECTIONS[section]}
          </main>
        </div>

        {/* Global progress toast */}
        <ProgressToast job={activeJob} />
      </div>
    </TutorialProvider>
    </I18nProvider>
    </ThemeProvider>
  )
}
