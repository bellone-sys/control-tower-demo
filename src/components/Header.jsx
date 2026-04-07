import { useState } from 'react'
import NotificationBell from './ui/NotificationBell'
import SettingsPanel from './SettingsPanel/SettingsPanel'
import { useI18n } from '../contexts/I18nContext'
import './Header.css'

// Mappa section id → chiave i18n (fallback: id stesso)
const SECTION_I18N = {
  overview:     'nav.overview',
  spedizioni:   'nav.spedizioni',
  scenari:      'nav.scenari',
  giri:         'nav.giri',
  punti:        'nav.punti',
  autisti:      'nav.autisti',
  flotta:       'nav.flotta',
  filiali:      'nav.filiali',
  filialiBrt:   'nav.filialiBrt',
  contratti:    'nav.contratti',
  utenti:       'nav.utenti',
  eccezioni:    'nav.eccezioni',
  report:       'nav.report',
  releaseNotes: 'nav.releaseNotes',
  credits:      'nav.credits',
}

export default function Header({
  user, section, onLogout, onMenuToggle,
  notifications = [], onMarkRead, onMarkAllRead, onClearNotif, onArchiveNotif,
}) {
  const { t, lang } = useI18n()
  const [showUserPanel, setShowUserPanel] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString(lang === 'it' ? 'it-IT' : lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const sectionTitle = t(SECTION_I18N[section] ?? section, section)

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger" onClick={onMenuToggle} aria-label="Apri menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 className="header-title">{sectionTitle}</h1>
        <span className="header-date">{dateStr}</span>
      </div>

      <div className="header-right">
        <NotificationBell
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onClear={onClearNotif}
          onArchive={onArchiveNotif}
        />

        <button className="header-user" onClick={() => setShowUserPanel(true)} title="Impostazioni utente" aria-label="Impostazioni">
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.ruolo}</span>
          </div>
        </button>

        <button className="btn-logout" onClick={onLogout} title={t('header.logout', 'Esci')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

      {showUserPanel && (
        <SettingsPanel
          hiddenTabs={['about']}
          onClose={() => setShowUserPanel(false)}
        />
      )}
    </header>
  )
}
