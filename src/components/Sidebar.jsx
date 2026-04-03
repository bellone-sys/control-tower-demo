import './Sidebar.css'

const NAV_ITEMS = [
  { id: 'overview',   label: 'Panoramica',    icon: IconGrid },
  { id: 'spedizioni', label: 'Spedizioni',     icon: IconBox },
  { id: 'punti',      label: 'Punti Ritiro',   icon: IconMap },
  { id: 'flotta',     label: 'Flotta',         icon: IconTruck },
  { id: 'eccezioni',  label: 'Eccezioni',      icon: IconAlert, badge: true },
  { id: 'report',     label: 'Report',         icon: IconChart },
]

export default function Sidebar({ active, onNav, eccezioniCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="4" fill="#DC0032"/>
          <text x="18" y="25" textAnchor="middle" fontSize="14" fontFamily="Inter,sans-serif" fontWeight="700" fill="white">FP</text>
          <text x="44" y="14" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="300" fill="rgba(255,255,255,.6)" letterSpacing="1.5">FERMOPOINT</text>
          <text x="44" y="27" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="500" fill="white">Control Tower</text>
        </svg>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNav(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
              {item.badge && eccezioniCount > 0 && (
                <span className="nav-badge">{eccezioniCount}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">v2.1 · Demo</div>
      </div>
    </aside>
  )
}

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
function IconTruck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 5v4h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}
