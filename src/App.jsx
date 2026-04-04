import { useState } from 'react'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Overview from './components/sections/Overview'
import Spedizioni from './components/sections/Spedizioni'
import Giri from './components/sections/Giri'
import PuntiRitiro from './components/sections/PuntiRitiro'
import Flotta from './components/sections/Flotta'
import Filiali from './components/sections/Filiali'
import Utenti from './components/sections/Utenti'
import Eccezioni from './components/sections/Eccezioni'
import Report from './components/sections/Report'
import { ECCEZIONI } from './data/stub'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [section, setSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const eccezioniAperte = ECCEZIONI.filter(e => e.stato === 'Aperta').length

  if (!user) {
    return <Login onLogin={setUser} />
  }

  function handleNav(id) {
    setSection(id)
    setSidebarOpen(false)
  }

  const SECTIONS = {
    overview:   <Overview />,
    spedizioni: <Spedizioni />,
    giri:       <Giri />,
    punti:      <PuntiRitiro />,
    flotta:     <Flotta />,
    filiali:    <Filiali />,
    utenti:     <Utenti currentUser={user} />,
    eccezioni:  <Eccezioni />,
    report:     <Report />,
  }

  return (
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
          onLogout={() => setUser(null)}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />
        <main className="app-content">
          {SECTIONS[section]}
        </main>
      </div>
    </div>
  )
}
