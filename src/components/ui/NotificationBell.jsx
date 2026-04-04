import { useRef, useEffect, useState } from 'react'
import './NotificationBell.css'

const TYPE_COLORS = {
  success: '#2E7D32',
  error: '#DC0032',
  info: '#1565C0',
  warning: '#F57C00',
}

const TYPE_ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
}

function relativeTime(date) {
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Adesso'
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return `${m} min fa`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return `${h}h fa`
  }
  if (diff < 172800) return 'ieri'
  const d = Math.floor(diff / 86400)
  return `${d} giorni fa`
}

export default function NotificationBell({ notifications = [], onMarkRead, onMarkAllRead, onClear }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifiche"
        title="Notifiche"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifiche</span>
            {unreadCount > 0 && (
              <button
                className="notif-mark-all-btn"
                onClick={() => onMarkAllRead && onMarkAllRead()}
              >
                Segna tutte lette
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">Nessuna notifica</div>
          ) : (
            <ul className="notif-list">
              {notifications.map(n => (
                <li
                  key={n.id}
                  className={`notif-item notif-${n.type}${n.read ? ' read' : ''}`}
                  style={{ borderLeftColor: TYPE_COLORS[n.type] }}
                  onClick={() => onMarkRead && onMarkRead(n.id)}
                >
                  <div className="notif-icon">{TYPE_ICONS[n.type]}</div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    {n.message && <div className="notif-msg">{n.message}</div>}
                    <div className="notif-time">{relativeTime(n.ts)}</div>
                  </div>
                  <button
                    className="notif-close"
                    onClick={e => {
                      e.stopPropagation()
                      onClear && onClear(n.id)
                    }}
                    aria-label="Rimuovi notifica"
                    title="Rimuovi"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
