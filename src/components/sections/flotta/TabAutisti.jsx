import { useState, useMemo } from 'react'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../../data/flotta'
import '../Sections.css'
import './Flotta.css'

const STATO_CFG = {
  'In servizio':  { color: '#2E7D32', bg: '#e8f5e9' },
  'Disponibile':  { color: '#1565C0', bg: '#e3f0fb' },
  'Ferie':        { color: '#F57C00', bg: '#fff3e0' },
  'Malattia':     { color: '#DC0032', bg: '#fff0f3' },
}

function getMezzoLabel(mezzoId) {
  if (!mezzoId) return null
  const m = MEZZI.find(x => x.id === mezzoId)
  if (!m) return null
  const cat = MODELLI_MEZZI.find(c => c.catalogoId === m.catalogoId)
  return cat ? `${cat.marca} ${cat.modello.split(' ').slice(0,2).join(' ')} · ${m.targa}` : m.targa
}

export default function TabAutisti() {
  const [search, setSearch] = useState('')
  const [filterStato, setFilterStato] = useState('')

  const filtered = useMemo(() => {
    let list = DRIVERS
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.nome.toLowerCase().includes(q) ||
        d.cognome.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q)
      )
    }
    if (filterStato) list = list.filter(d => d.stato === filterStato)
    return list
  }, [search, filterStato])

  const stati = [...new Set(DRIVERS.map(d => d.stato))]

  return (
    <div className="card">
      <div className="card-header">
        <h3>Autisti</h3>
        <span className="card-label">{filtered.length} di {DRIVERS.length}</span>
      </div>

      <div className="table-toolbar">
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Cerca per nome, ID, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${!filterStato ? 'active' : ''}`} onClick={() => setFilterStato('')}>Tutti</button>
          {stati.map(s => (
            <button key={s} className={`filter-tab ${filterStato === s ? 'active' : ''}`} onClick={() => setFilterStato(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Autista</th>
              <th>Patente</th>
              <th>Contatti</th>
              <th>Data nascita</th>
              <th>Mezzo assegnato</th>
              <th>Km/anno</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => {
              const cfg = STATO_CFG[d.stato] || {}
              const mezzo = getMezzoLabel(d.mezzoId)
              return (
                <tr key={d.id}>
                  <td><code className="id-code">{d.id}</code></td>
                  <td>
                    <div className="driver-cell">
                      <div className="driver-avatar">{d.nome[0]}{d.cognome[0]}</div>
                      <div>
                        <div className="driver-name">{d.nome} {d.cognome}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="patente-badge">{d.patente}</span></td>
                  <td>
                    <div className="td-small">{d.telefono}</div>
                    <div className="td-small">{d.email}</div>
                  </td>
                  <td className="td-small">{d.dataNascita}</td>
                  <td>
                    {mezzo
                      ? <span className="mezzo-ref">{mezzo}</span>
                      : <span className="td-small text-gray">—</span>}
                  </td>
                  <td className="td-small">{d.km_anno.toLocaleString('it-IT')} km</td>
                  <td>
                    <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                      {d.stato}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="table-empty">Nessun autista trovato.</div>}
      </div>
    </div>
  )
}
