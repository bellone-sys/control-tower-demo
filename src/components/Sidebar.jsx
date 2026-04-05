import './Sidebar.css'
import { useState, useEffect } from 'react'
import { APP_VERSION } from '../version'
import { getVisibleMenuGroups, getMenuGroupState, setMenuGroupState } from '../config/menuStructure'
import { useI18n } from '../contexts/I18nContext'

// Mappa item.id → chiave i18n
const SECTION_KEYS = {
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

// Mappa group.id → chiave i18n
const GROUP_KEYS = {
  operazioni:   'nav.group.operations',
  gestione:     'nav.group.management',
  monitoraggio: 'nav.group.monitoring',
  info:         'nav.group.info',
}

const ICON_MAP = {
  IconGrid:      IconGrid,
  IconBox:       IconBox,
  IconRoute:     IconRoute,
  IconMap:       IconMap,
  IconAlert:     IconAlert,
  IconChart:     IconChart,
  IconUsers:     IconUsers,
  IconBuilding:  IconBuilding,
  IconTruck:     IconTruck,
  IconCog:       IconCog,
  IconBriefcase: IconBriefcase,
  IconDocument:  IconDocument,
  IconInfo:      IconInfo,
  IconTag:       IconTag,
  IconHeart:     IconHeart,
  IconScenario:  IconScenario,
  IconPerson:    IconPerson,
}

export default function Sidebar({ active, onNav, eccezioniCount, user, open, onClose }) {
  const { t } = useI18n()
  const isAdmin = user?.ruolo === 'admin'
  const visibleGroups = getVisibleMenuGroups(isAdmin)
  const [groupStates, setGroupStates] = useState({})

  useEffect(() => {
    const states = {}
    visibleGroups.forEach(group => {
      const stored = getMenuGroupState(group.id)
      states[group.id] = stored !== null ? stored : group.collapsed
    })
    setGroupStates(states)
  }, [visibleGroups])

  const toggleGroup = (groupId) => {
    const newState = !groupStates[groupId]
    setGroupStates(prev => ({ ...prev, [groupId]: newState }))
    setMenuGroupState(groupId, newState)
  }

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <svg viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="4" fill="#DC0032"/>
          <text x="18" y="25" textAnchor="middle" fontSize="14" fontFamily="Inter,sans-serif" fontWeight="700" fill="white">FP</text>
          <text x="44" y="14" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="300" fill="rgba(255,255,255,.6)" letterSpacing="1.5">FERMOPOINT</text>
          <text x="44" y="27" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="500" fill="white">Control Tower</text>
        </svg>
        <button className="sidebar-close" onClick={onClose} aria-label="Chiudi menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {visibleGroups.map(group => {
          const isCollapsed = groupStates[group.id]

          if (!group.collapsible || group.label === null) {
            return (
              <div key={group.id} className="nav-group">
                {group.items.map(item => {
                  const Icon = ICON_MAP[item.icon]
                  const isActive = active === item.section
                  return (
                    <button key={item.id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => onNav(item.section)}>
                      {Icon && <Icon />}
                      <span>{t(SECTION_KEYS[item.id], item.label)}</span>
                      {item.badge && eccezioniCount > 0 && <span className="nav-badge">{eccezioniCount}</span>}
                    </button>
                  )
                })}
              </div>
            )
          }

          const GroupIcon = group.icon ? ICON_MAP[group.icon] : null
          return (
            <div key={group.id} className="nav-group-collapsible">
              <button className="nav-group-header" onClick={() => toggleGroup(group.id)}>
                {GroupIcon && <GroupIcon />}
                <span>{t(GROUP_KEYS[group.id], group.label)}</span>
                <svg className={`group-chevron${isCollapsed ? '' : ' open'}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {!isCollapsed && (
                <div className="nav-group-items">
                  {group.items.map(item => {
                    const Icon = ICON_MAP[item.icon]
                    const isActive = active === item.section
                    return (
                      <button key={item.id} className={`nav-item nav-subitem ${isActive ? 'active' : ''}`} onClick={() => onNav(item.section)}>
                        {Icon && <Icon />}
                        <span>{t(SECTION_KEYS[item.id], item.label)}</span>
                        {item.badge && eccezioniCount > 0 && <span className="nav-badge">{eccezioniCount}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-docs-section">
        <a href="/control-tower-demo/manuale.html"   target="_blank" rel="noopener noreferrer" className="nav-item sidebar-docs-link">
          <IconBook /><span>Manuale Utente</span><span style={{ marginLeft: 'auto', fontSize: 10, opacity: .6 }}>↗</span>
        </a>
        <a href="/control-tower-demo/requisiti.html" target="_blank" rel="noopener noreferrer" className="nav-item sidebar-docs-link">
          <IconDocument /><span>Requisiti</span><span style={{ marginLeft: 'auto', fontSize: 10, opacity: .6 }}>↗</span>
        </a>
        <a href="/control-tower-demo/funzionale.html" target="_blank" rel="noopener noreferrer" className="nav-item sidebar-docs-link">
          <IconDocument /><span>Doc. Funzionale</span><span style={{ marginLeft: 'auto', fontSize: 10, opacity: .6 }}>↗</span>
        </a>
        <a href="/control-tower-demo/tecnica.html"   target="_blank" rel="noopener noreferrer" className="nav-item sidebar-docs-link">
          <IconDocument /><span>Doc. Tecnica</span><span style={{ marginLeft: 'auto', fontSize: 10, opacity: .6 }}>↗</span>
        </a>
        <a href="/control-tower-demo/api.html"       target="_blank" rel="noopener noreferrer" className="nav-item sidebar-docs-link">
          <IconDocument /><span>API Reference</span><span style={{ marginLeft: 'auto', fontSize: 10, opacity: .6 }}>↗</span>
        </a>
        <a href="/control-tower-demo/playbook.html"  target="_blank" rel="noopener noreferrer" className="nav-item sidebar-docs-link">
          <IconClipboard /><span>Playbook Operativo</span><span style={{ marginLeft: 'auto', fontSize: 10, opacity: .6 }}>↗</span>
        </a>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-version">v{APP_VERSION} · Demo</div>
      </div>
    </aside>
  )
}

// ─── ICONE ────────────────────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}
function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}
function IconMap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/>
    </svg>
  )
}
function IconRoute() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3"/>
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
      <circle cx="18" cy="5" r="3"/>
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 5v4h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  )
}
/** Ghiera (cog) — usata per il gruppo Impostazioni / header button */
function IconCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
/** Valigetta — Gestione */
function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <path d="M2 12h20"/>
    </svg>
  )
}
function IconDocument() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
  )
}
function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  )
}
function IconTag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}
function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}
/** Scenario / ottimizzazione — grafo a 3 nodi */
function IconScenario() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5"  cy="12" r="2"/>
      <circle cx="19" cy="5"  r="2"/>
      <circle cx="19" cy="19" r="2"/>
      <path d="M7 12h4l4.5-5.5"/>
      <path d="M7 12h4l4.5 5.5"/>
    </svg>
  )
}
/** Persona / autista */
function IconPerson() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
    </svg>
  )
}
