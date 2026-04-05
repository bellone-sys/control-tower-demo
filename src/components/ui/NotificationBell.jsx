import { useRef, useEffect, useState } from 'react'
import './NotificationBell.css'

const TYPE_COLORS = {
  success: '#2E7D32',
  error:   '#DC0032',
  info:    '#1565C0',
  warning: '#F57C00',
}

const TYPE_ICONS = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
}

function relativeTime(date) {
  const now  = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60)     return 'Adesso'
  if (diff < 3600)   return `${Math.floor(diff / 60)} min fa`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h fa`
  if (diff < 172800) return 'ieri'
  return `${Math.floor(diff / 86400)} giorni fa`
}

export default function NotificationBell({ notifications = [], onMarkRead, onMarkAllRead, onClear, onArchive }) {
  const [open,       setOpen]       = useState(false)
  const [activeTab,  setActiveTab]  = useState('active') // 'active' | 'archived'
  const wrapRef = useRef(null)

  // Separazione notifiche
  const active   = notifications.filter(n => !n.archived)
  const archived = notifications.filter(n =>  n.archived)
  const unread   = active.filter(n => !n.read)

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const shown = activeTab === 'active' ? active : archived

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifiche"
        title="Notifiche"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread.length > 0 && (
          <span className="notif-badge">{unread.length > 9 ? '9+' : unread.length}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          {/* Header */}
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifiche</span>
            {activeTab === 'active' && unread.length > 0 && (
              <button className="notif-mark-all-btn" onClick={() => onMarkAllRead && onMarkAllRead()}>
                Segna tutte lette
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="notif-tabs">
            <button
              className={`notif-tab${activeTab === 'active' ? ' active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Attive
              {active.length > 0 && <span className="notif-tab-count">{active.length}</span>}
            </button>
            <button
              className={`notif-tab${activeTab === 'archived' ? ' active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              Archiviate
              {archived.length > 0 && <span className="notif-tab-count notif-tab-count-gray">{archived.length}</span>}
            </button>
          </div>

          {/* Lista */}
          {shown.length === 0 ? (
            <div className="notif-empty">
              {activeTab === 'active' ? 'Nessuna notifica attiva' : 'Nessuna notifica archiviata'}
            </div>
          ) : (
            <ul className="notif-list">
              {shown.map(n => (
                <li
                  key={n.id}
                  className={`notif-item notif-${n.type}${n.read ? ' read' : ''}${n.archived ? ' archived' : ''}`}
                  style={{ borderLeftColor: TYPE_COLORS[n.type] }}
                  onClick={() => !n.archived && onMarkRead && onMarkRead(n.id)}
                >
                  <div className="notif-icon">{TYPE_ICONS[n.type]}</div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    {n.message && <div className="notif-msg">{n.message}</div>}
                    <div className="notif-time">{relativeTime(n.ts)}</div>
                  </div>
                  <div className="notif-actions">
                    {!n.archived && (
                      <button
                        className="notif-action-btn notif-archive-btn"
                        onClick={e => { e.stopPropagation(); onArchive && onArchive(n.id) }}
                        title="Archivia"
                        aria-label="Archivia notifica"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
                          <line x1="10" y1="12" x2="14" y2="12"/>
                        </svg>
                      </button>
                    )}
                    <button
                      className="notif-close"
                      onClick={e => { e.stopPropagation(); onClear && onClear(n.id) }}
                      aria-label="Rimuovi notifica"
                      title="Rimuovi"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Footer archiviate: pulsante svuota */}
          {activeTab === 'archived' && archived.length > 0 && (
            <div className="notif-panel-footer">
              <button
                className="notif-clear-all-btn"
                onClick={() => archived.forEach(n => onClear && onClear(n.id))}
              >
                Svuota archivio
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
