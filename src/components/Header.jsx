import { useState } from 'react'
import NotificationBell from './ui/NotificationBell'
import SettingsPanel from './SettingsPanel/SettingsPanel'
import './Header.css'

const SECTION_LABELS = {
  overview:   'Panoramica',
  spedizioni: 'Spedizioni',
  giri:       'Giri',
  punti:      'PUDO',
  flotta:     'Flotta',
  filiali:    'Filiali',
  contratti:  'Contratti',
  utenti:     'Utenti',
  eccezioni:  'Eccezioni',
  report:     'Report',
}

export default function Header({
  user, section, onLogout, onMenuToggle,
  notifications = [], onMarkRead, onMarkAllRead, onClearNotif,
}) {
  const [showSettings, setShowSettings] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <header className="header">
      <div className="header-left">
        {/* Hamburger — nascosto su desktop, visibile su mobile via CSS */}
        <button className="hamburger" onClick={onMenuToggle} aria-label="Apri menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <h1 className="header-title">{SECTION_LABELS[section] ?? section}</h1>
        <span className="header-date">{dateStr}</span>
      </div>

      <div className="header-right">
        {/* Campanella notifiche */}
        <NotificationBell
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onClear={onClearNotif}
        />

        {/* Impostazioni */}
        <button
          className="btn-settings"
          onClick={() => setShowSettings(true)}
          title="Impostazioni"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24"/>
          </svg>
        </button>

        <div className="header-user">
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.ruolo}</span>
          </div>
        </div>

        <button className="btn-logout" onClick={onLogout} title="Esci">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Settings Panel Modal */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </header>
  )
}
