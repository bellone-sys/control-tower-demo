import { useState } from 'react'
import { SPEDIZIONI } from '../../data/stub'
import './Sections.css'

const STATUS_CONFIG = {
  'In custodia':  { color: '#1565C0', bg: '#e3f0fb' },
  'Consegnato':   { color: '#2E7D32', bg: '#e8f5e9' },
  'In transito':  { color: '#F57C00', bg: '#fff3e0' },
  'Scaduto':      { color: '#DC0032', bg: '#fff0f3' },
  'Eccezione':    { color: '#6a1b9a', bg: '#f3e5f5' },
}

export default function Spedizioni() {
  const [search, setSearch] = useState('')
  const [filterStato, setFilterStato] = useState('Tutti')

  const stati = ['Tutti', ...new Set(SPEDIZIONI.map(s => s.stato))]

  const filtered = SPEDIZIONI.filter(s => {
    const matchSearch = !search ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.destinatario.toLowerCase().includes(search.toLowerCase()) ||
      s.comune.toLowerCase().includes(search.toLowerCase())
    const matchStato = filterStato === 'Tutti' || s.stato === filterStato
    return matchSearch && matchStato
  })

  return (
    <div className="section-content">
      <div className="card">
        <div className="card-header">
          <h3>Spedizioni</h3>
          <span className="card-label">{filtered.length} risultati</span>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca per ID, destinatario, comune…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {stati.map(s => (
              <button
                key={s}
                className={`filter-tab ${filterStato === s ? 'active' : ''}`}
                onClick={() => setFilterStato(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Spedizione</th>
                <th>Destinatario</th>
                <th>Comune</th>
                <th>Punto Ritiro</th>
                <th>Data</th>
                <th>Giorni</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const cfg = STATUS_CONFIG[s.stato] || {}
                return (
                  <tr key={s.id} className={s.priorita === 'high' ? 'row-high' : ''}>
                    <td><code className="id-code">{s.id}</code></td>
                    <td>{s.destinatario}</td>
                    <td>{s.comune}</td>
                    <td className="td-small">{s.punto}</td>
                    <td className="td-small">{s.data}</td>
                    <td className="td-center">
                      {s.giorni != null ? (
                        <span className={s.giorni >= 5 ? 'days-alert' : 'days-ok'}>{s.giorni}g</span>
                      ) : '—'}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {s.stato}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="table-empty">Nessun risultato trovato.</div>
          )}
        </div>
      </div>
    </div>
  )
}
