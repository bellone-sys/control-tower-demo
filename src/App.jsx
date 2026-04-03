import { useState } from 'react'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Overview from './components/sections/Overview'
import Spedizioni from './components/sections/Spedizioni'
import PuntiRitiro from './components/sections/PuntiRitiro'
import Flotta from './components/sections/Flotta'
import Eccezioni from './components/sections/Eccezioni'
import Report from './components/sections/Report'
import { ECCEZIONI } from './data/stub'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [section, setSection] = useState('overview')

  const eccezioniAperte = ECCEZIONI.filter(e => e.stato === 'Aperta').length

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const SECTIONS = {
    overview:   <Overview />,
    spedizioni: <Spedizioni />,
    punti:      <PuntiRitiro />,
    flotta:     <Flotta />,
    eccezioni:  <Eccezioni />,
    report:     <Report />,
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={section}
        onNav={setSection}
        eccezioniCount={eccezioniAperte}
      />
      <div className="app-main">
        <Header
          user={user}
          section={section}
          onLogout={() => setUser(null)}
        />
        <main className="app-content">
          {SECTIONS[section]}
        </main>
      </div>
    </div>
  )
}
