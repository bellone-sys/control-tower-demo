import { useState, useEffect, useCallback } from 'react'
import { getEntityHistory } from '../../services/historyService'
import './EntityHistory.css'

const ACTION_META = {
  create:        { icon: '✦', label: 'Creato',          color: 'var(--fp-success)' },
  update:        { icon: '✎', label: 'Modificato',       color: 'var(--fp-info)'    },
  delete:        { icon: '✕', label: 'Eliminato',        color: 'var(--fp-danger)'  },
  status_change: { icon: '⇄', label: 'Stato cambiato',  color: 'var(--fp-warning)' },
}

function formatTs(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function formatValue(val) {
  if (val === null || val === undefined) return '–'
  if (typeof val === 'boolean') return val ? 'Sì' : 'No'
  return String(val)
}

/**
 * EntityHistory — Tab cronologia riutilizzabile per qualsiasi entità
 *
 * @param {string} entityType  — 'giro' | 'pudo' | 'filiale' | 'scenario'
 * @param {string} entityId    — ID dell'entità
 * @param {number} [limit=50]
 */
export default function EntityHistory({ entityType, entityId, limit = 50 }) {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    // In produzione: fetch('/api/history/:entityType/:entityId')
    const data = getEntityHistory(entityType, entityId, limit)
    setEvents(data)
    setLoading(false)
  }, [entityType, entityId, limit])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="eh-loading" role="status" aria-live="polite">
        <div className="eh-spinner" aria-hidden="true" />
        <span>Caricamento cronologia…</span>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="eh-empty" role="status">
        <div className="eh-empty-icon" aria-hidden="true">🕐</div>
        <p>Nessuna modifica registrata per questa entità.</p>
        <p className="eh-empty-hint">Le modifiche appariranno qui non appena verranno eseguite.</p>
      </div>
    )
  }

  // Group events by date
  const grouped = events.reduce((acc, ev) => {
    const { date } = formatTs(ev.timestamp)
    if (!acc[date]) acc[date] = []
    acc[date].push(ev)
    return acc
  }, {})

  return (
    <section className="eh-root" aria-label="Cronologia modifiche">
      <div className="eh-header">
        <span className="eh-count">{events.length} {events.length === 1 ? 'evento' : 'eventi'}</span>
        <button className="eh-refresh-btn" onClick={load} aria-label="Aggiorna cronologia">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Aggiorna
        </button>
      </div>

      <ol className="eh-timeline" aria-label="Timeline eventi">
        {Object.entries(grouped).map(([date, dayEvents]) => (
          <li key={date} className="eh-day-group">
            <div className="eh-day-label" aria-label={`Modifiche del ${date}`}>{date}</div>
            <ol className="eh-day-events">
              {dayEvents.map(ev => {
                const meta = ACTION_META[ev.action] || ACTION_META.update
                const { time } = formatTs(ev.timestamp)
                return (
                  <li key={ev.id} className="eh-event">
                    <div
                      className="eh-event-dot"
                      style={{ color: meta.color, borderColor: meta.color }}
                      aria-hidden="true"
                    >
                      {meta.icon}
                    </div>
                    <div className="eh-event-body">
                      <div className="eh-event-header">
                        <span className="eh-event-label">{ev.label}</span>
                        <time className="eh-event-time" dateTime={ev.timestamp}>{time}</time>
                      </div>

                      {ev.field && ev.oldValue !== null && (
                        <div className="eh-event-diff" aria-label="Dettaglio modifica">
                          <span className="eh-diff-field">{ev.field}:</span>
                          <span className="eh-diff-old" aria-label="valore precedente">{formatValue(ev.oldValue)}</span>
                          <span className="eh-diff-arrow" aria-hidden="true">→</span>
                          <span className="eh-diff-new" aria-label="nuovo valore">{formatValue(ev.newValue)}</span>
                        </div>
                      )}

                      <div className="eh-event-meta">
                        <span className={`eh-action-badge eh-action-${ev.action}`}>{meta.label}</span>
                        <span className="eh-user" aria-label={`Modificato da ${ev.userName}`}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {ev.userName}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  )
}
