import { useState, useMemo } from 'react'
import { MEZZI, MODELLI_MEZZI, DRIVERS } from '../../../data/flotta'
import '../Sections.css'
import './Flotta.css'

const STATO_CFG = {
  'In servizio':  { color: '#2E7D32', bg: '#e8f5e9' },
  'Disponibile':  { color: '#1565C0', bg: '#e3f0fb' },
  'Manutenzione': { color: '#DC0032', bg: '#fff0f3' },
}

const CARB_CFG = {
  'Diesel':    { color: '#414042', bg: '#f0f0f0',   icon: '⛽' },
  'Elettrico': { color: '#1565C0', bg: '#e3f0fb',   icon: '⚡' },
  'Ibrido':    { color: '#2E7D32', bg: '#e8f5e9',   icon: '🌿' },
}

const TIPO_LABEL = { compact: 'Compact', medio: 'Medio', grande: 'Grande' }

function getCatalog(catalogoId) {
  return MODELLI_MEZZI.find(m => m.catalogoId === catalogoId)
}

function getAutista(autoreId) {
  if (!autoreId) return null
  const d = DRIVERS.find(d => d.id === autoreId)
  return d ? `${d.nome} ${d.cognome}` : null
}

export default function TabMezzi() {
  const [search, setSearch]       = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterCarb, setFilterCarb] = useState('')
  const [filterStato, setFilterStato] = useState('')
  const [sortField, setSortField] = useState('id')
  const [expandedId, setExpandedId] = useState(null)

  const tipi  = ['compact','medio','grande']
  const carbs = ['Diesel','Elettrico']
  const stati = ['In servizio','Disponibile','Manutenzione']

  const filtered = useMemo(() => {
    let list = MEZZI.map(m => ({ ...m, cat: getCatalog(m.catalogoId) }))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.id.toLowerCase().includes(q) ||
        m.targa.toLowerCase().includes(q) ||
        m.cat?.marca.toLowerCase().includes(q) ||
        m.cat?.modello.toLowerCase().includes(q)
      )
    }
    if (filterTipo)  list = list.filter(m => m.cat?.tipo === filterTipo)
    if (filterCarb)  list = list.filter(m => m.cat?.carburante === filterCarb)
    if (filterStato) list = list.filter(m => m.stato === filterStato)
    list.sort((a, b) => String(a[sortField] ?? '').localeCompare(String(b[sortField] ?? '')))
    return list
  }, [search, filterTipo, filterCarb, filterStato, sortField])

  return (
    <div className="card">
      <div className="card-header">
        <h3>Mezzi</h3>
        <span className="card-label">{filtered.length} di {MEZZI.length}</span>
      </div>

      <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Cerca per targa, marca, modello…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${!filterTipo ? 'active' : ''}`} onClick={() => setFilterTipo('')}>Tutti</button>
          {tipi.map(t => <button key={t} className={`filter-tab ${filterTipo===t?'active':''}`} onClick={() => setFilterTipo(t)}>{TIPO_LABEL[t]}</button>)}
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${!filterCarb ? 'active' : ''}`} onClick={() => setFilterCarb('')}>Tutti carburanti</button>
          {carbs.map(c => <button key={c} className={`filter-tab ${filterCarb===c?'active':''}`} onClick={() => setFilterCarb(c)}>{c}</button>)}
        </div>
        <div className="filter-tabs">
          <button className={`filter-tab ${!filterStato ? 'active' : ''}`} onClick={() => setFilterStato('')}>Tutti stati</button>
          {stati.map(s => <button key={s} className={`filter-tab ${filterStato===s?'active':''}`} onClick={() => setFilterStato(s)}>{s}</button>)}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Targa</th>
              <th>Marca / Modello</th>
              <th>Tipo</th>
              <th>Carburante</th>
              <th>Volume</th>
              <th>Carico max</th>
              <th>Autonomia</th>
              <th>Consumo</th>
              <th>Km percorsi</th>
              <th>Autista</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const cfg  = STATO_CFG[m.stato] || {}
              const carb = CARB_CFG[m.cat?.carburante] || {}
              const autista = getAutista(m.autoreId)
              return (
                <tr key={m.id}>
                  <td><code className="id-code">{m.id}</code></td>
                  <td><strong className="targa">{m.targa}</strong></td>
                  <td>
                    <div className="mezzo-modello">
                      <span className="mezzo-marca">{m.cat?.marca}</span>
                      <span className="td-small">{m.cat?.modello}</span>
                    </div>
                  </td>
                  <td className="td-small">{TIPO_LABEL[m.cat?.tipo]}</td>
                  <td>
                    <span className="status-badge" style={{ color: carb.color, background: carb.bg }}>
                      {carb.icon} {m.cat?.carburante}
                    </span>
                  </td>
                  <td className="td-center spec-cell">
                    <span className="spec-val">{m.cat?.volumeM3}</span>
                    <span className="spec-unit">m³</span>
                  </td>
                  <td className="td-center spec-cell">
                    <span className="spec-val">{m.cat?.caricoKg.toLocaleString('it-IT')}</span>
                    <span className="spec-unit">kg</span>
                  </td>
                  <td className="td-center spec-cell">
                    <span className="spec-val">{m.cat?.autonomiaKm}</span>
                    <span className="spec-unit">km</span>
                  </td>
                  <td className="td-center spec-cell">
                    <span className="spec-val">{m.cat?.consumo}</span>
                    <span className="spec-unit">{m.cat?.unitaConsumo}</span>
                  </td>
                  <td className="td-small">{m.km.toLocaleString('it-IT')} km</td>
                  <td>
                    {autista
                      ? <span className="mezzo-ref">{autista}</span>
                      : <span className="td-small text-gray">—</span>}
                  </td>
                  <td>
                    <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                      {m.stato}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="table-empty">Nessun mezzo trovato.</div>}
      </div>
    </div>
  )
}
