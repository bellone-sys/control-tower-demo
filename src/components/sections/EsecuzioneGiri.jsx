import { useState, useMemo } from 'react'
import { GIRI_INIT } from '../../data/giri'
import { FILIALI } from '../../data/filiali'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../data/flotta'
import { getExtraScenari } from '../../services/scenariService'
import MultiSelect from '../ui/MultiSelect'
import './EsecuzioneGiri.css'

const PAGE_SIZE = 15

// ── Helpers ────────────────────────────────────────────────────────────────

function seededInt(seed, max) {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0
  return Math.abs(h) % (max + 1)
}

function addMinutes(timeStr, min) {
  const [h, m] = timeStr.split(':').map(Number)
  const tot = h * 60 + m + min
  return `${String(Math.floor(tot / 60) % 24).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`
}

function subMinutes(timeStr, min) {
  const [h, m] = timeStr.split(':').map(Number)
  const tot = Math.max(0, h * 60 + m - min)
  return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`
}

function formatDurata(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h === 0 ? `${m}min` : `${h}h ${String(m).padStart(2, '0')}min`
}

function formatData(iso) {
  if (!iso) return '—'
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function mapStato(stato) {
  if (stato === 'In corso')   return 'In esecuzione'
  if (stato === 'Completato') return 'Concluso'
  return stato
}

function getEsito(giro) {
  const total   = giro.tappe.length
  const falliti = seededInt(giro.id + 'f', Math.min(1, Math.floor(total * 0.1)))
  const saltati = seededInt(giro.id + 's', Math.min(2, Math.floor((total - falliti) * 0.15)))
  return { serviti: total - falliti - saltati, saltati, falliti, total }
}

function getPausaPranzo(giro) {
  // Orario pausa: deterministico tra 12:00 e 13:00
  const offsetMin = seededInt(giro.id + 'pp', 60)   // 0-60 min dopo le 12:00
  const durata    = seededInt(giro.id + 'ppd', 1) === 0 ? 30 : 45
  const oraInizio = addMinutes('12:00', offsetMin)
  return { oraInizio, durata }
}

function getOrari(giro) {
  const tappeOrd = [...giro.tappe].sort((a, b) => a.ordine - b.ordine)
  if (!tappeOrd.length) return { inizio: '—', fine: '—' }
  const inizio = subMinutes(tappeOrd[0].oraArrivo, 15)
  const fine   = addMinutes(tappeOrd[tappeOrd.length - 1].oraPartenza, 20)
  return { inizio, fine }
}

// ── Lookup maps ────────────────────────────────────────────────────────────

const FILIALI_MAP = Object.fromEntries(FILIALI.map(f => [f.id, f]))
const DRIVERS_MAP = Object.fromEntries(DRIVERS.map(d => [d.id, d]))
const MEZZI_MAP   = Object.fromEntries(MEZZI.map(m => [m.id, m]))
const MODELLI_MAP = Object.fromEntries(MODELLI_MEZZI.map(m => [m.catalogoId, m]))

const FILIALI_OPT = FILIALI.map(f => ({ value: f.id, label: f.nome }))
const DRIVERS_OPT = DRIVERS.map(d => ({ value: d.id, label: `${d.cognome} ${d.nome}` }))
const STATI_OPT   = [
  { value: 'Pianificato',   label: 'Pianificato' },
  { value: 'In esecuzione', label: 'In esecuzione' },
  { value: 'Concluso',      label: 'Concluso' },
  { value: 'Annullato',     label: 'Annullato' },
]

// ── Sub-components ─────────────────────────────────────────────────────────

function SortIcon({ dir }) {
  if (!dir) return <span className="sort-neutral">⇅</span>
  return <span className="sort-active">{dir === 'asc' ? '↑' : '↓'}</span>
}

function PudoBadge({ count, type }) {
  if (count === 0) return <span className="pudo-badge pudo-zero">—</span>
  return <span className={`pudo-badge pudo-${type}`}>{count}</span>
}

function StatoBadge({ stato }) {
  const cls = {
    'Pianificato':   'stato-pianificato',
    'In esecuzione': 'stato-in-corso',
    'Concluso':      'stato-completato',
    'Annullato':     'stato-annullato',
  }[stato] ?? ''
  return <span className={`status-badge ${cls}`}>{stato}</span>
}

function LiveModal({ giro, onClose }) {
  return (
    <div className="esec-modal-backdrop" onClick={onClose}>
      <div className="esec-modal" onClick={e => e.stopPropagation()}>
        <div className="esec-modal-header">
          <div className="esec-modal-title">
            <span className="live-dot" />
            Monitoraggio live — {giro.nome}
          </div>
          <button className="esec-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="esec-modal-body esec-modal-empty">
          <div className="esec-modal-empty-icon">📡</div>
          <div className="esec-modal-empty-title">Monitoraggio in tempo reale</div>
          <div className="esec-modal-empty-sub">
            La vista live è in sviluppo. Qui sarà disponibile la posizione GPS dell'autista,
            l'avanzamento tappa per tappa e lo stato delle consegne in tempo reale.
          </div>
        </div>
      </div>
    </div>
  )
}

function PaginationPages({ current, total, onPage }) {
  const pages = []
  const delta = 2
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="page-ellipsis">…</span>
          : <button key={p} className={`page-btn${p === current ? ' active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      )}
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function EsecuzioneGiri() {
  const [search,        setSearch]        = useState('')
  const [filterFiliale, setFilterFiliale] = useState([])
  const [filterAutista, setFilterAutista] = useState([])
  const [filterScen,    setFilterScen]    = useState([])
  const [filterStato,   setFilterStato]   = useState([])
  const [sortKey,       setSortKey]       = useState('data')
  const [sortDir,       setSortDir]       = useState('desc')
  const [page,          setPage]          = useState(1)
  const [liveGiro,      setLiveGiro]      = useState(null)

  const scenariOpt = useMemo(() => {
    const base   = FILIALI.map(f => ({ value: `SC_${f.id}`, label: f.nome, filialeId: f.id }))
    const extras = getExtraScenari().map(e => ({ value: e.id, label: e.label, filialeId: e.filialeId }))
    return [...base, ...extras]
  }, [])

  const rows = useMemo(() => GIRI_INIT.map(g => {
    const filiale  = FILIALI_MAP[g.filialeId]
    const driver   = DRIVERS_MAP[g.autoreId]
    const mezzo    = MEZZI_MAP[g.mezzoId]
    const modello  = mezzo ? MODELLI_MAP[mezzo.catalogoId] : null
    const scenario = scenariOpt.find(s => s.filialeId === g.filialeId)
    const esito    = getEsito(g)
    const pausa    = getPausaPranzo(g)
    const orari    = getOrari(g)
    const statoLabel = mapStato(g.stato)
    return {
      ...g,
      filiale,
      driver,
      mezzo,
      modello,
      scenarioLabel:  scenario?.label ?? filiale?.nome ?? g.filialeId,
      statoLabel,
      ...esito,
      pausa,
      orari,
      driverLabel: driver ? `${driver.cognome} ${driver.nome}` : g.autoreId,
      mezzoLabel:  mezzo  ? mezzo.targa + (modello ? ` · ${modello.marca}` : '') : g.mezzoId,
    }
  }), [scenariOpt])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r =>
        r.nome.toLowerCase().includes(q) ||
        r.driverLabel.toLowerCase().includes(q) ||
        (r.filiale?.nome ?? '').toLowerCase().includes(q) ||
        r.scenarioLabel.toLowerCase().includes(q)
      )
    }
    if (filterFiliale.length) list = list.filter(r => filterFiliale.includes(r.filialeId))
    if (filterAutista.length) list = list.filter(r => filterAutista.includes(r.autoreId))
    if (filterStato.length)   list = list.filter(r => filterStato.includes(r.statoLabel))
    if (filterScen.length) {
      const fids = new Set(scenariOpt.filter(o => filterScen.includes(o.value)).map(o => o.filialeId))
      list = list.filter(r => fids.has(r.filialeId))
    }
    return list
  }, [rows, search, filterFiliale, filterAutista, filterStato, filterScen, scenariOpt])

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'data':     return dir * a.data.localeCompare(b.data)
        case 'nome':     return dir * a.nome.localeCompare(b.nome)
        case 'stato':    return dir * a.statoLabel.localeCompare(b.statoLabel)
        case 'filiale':  return dir * ((a.filiale?.nome ?? '').localeCompare(b.filiale?.nome ?? ''))
        case 'scenario': return dir * a.scenarioLabel.localeCompare(b.scenarioLabel)
        case 'driver':   return dir * a.driverLabel.localeCompare(b.driverLabel)
        case 'km':       return dir * (a.distanzaKm - b.distanzaKm)
        case 'serviti':  return dir * (a.serviti - b.serviti)
        case 'saltati':  return dir * (a.saltati - b.saltati)
        case 'falliti':  return dir * (a.falliti - b.falliti)
        default:         return 0
      }
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData   = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(v) { setSearch(v); setPage(1) }
  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }
  function th(key, label, title) {
    const active = sortKey === key
    return (
      <th className={`sortable${active ? ' sort-on' : ''}`} onClick={() => handleSort(key)} title={title}>
        {label} <SortIcon dir={active ? sortDir : null} />
      </th>
    )
  }

  // KPI
  const totServiti = filtered.reduce((s, r) => s + r.serviti, 0)
  const totSaltati = filtered.reduce((s, r) => s + r.saltati, 0)
  const totFalliti = filtered.reduce((s, r) => s + r.falliti, 0)
  const totKm      = filtered.reduce((s, r) => s + (r.distanzaKm || 0), 0).toFixed(1)
  const totPudo    = totServiti + totSaltati + totFalliti
  const pctOk      = totPudo > 0 ? Math.round(totServiti / totPudo * 100) : 0

  return (
    <div className="section-content esec-wrap">

      {/* KPI strip */}
      <div className="esec-kpi-row">
        {[
          { val: filtered.length, label: 'Giri' },
          { val: `${totKm} km`,   label: 'Km totali' },
          { val: `${pctOk}%`,     label: 'Tasso successo' },
          { val: totServiti, label: 'PUDO serviti', cls: 'esec-kpi-ok' },
          { val: totSaltati, label: 'PUDO saltati', cls: 'esec-kpi-warn' },
          { val: totFalliti, label: 'PUDO falliti', cls: 'esec-kpi-err' },
        ].map(({ val, label, cls }) => (
          <div key={label} className="esec-kpi">
            <div className={`esec-kpi-val${cls ? ' ' + cls : ''}`}>{val}</div>
            <div className="esec-kpi-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Giri eseguiti</h3>
          <span className="card-label">{filtered.length} giri</span>
        </div>

        {/* Toolbar */}
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca giro, autista, filiale…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {search && <button className="search-clear" onClick={() => handleSearch('')}>×</button>}
          </div>
          <MultiSelect placeholder="Tutte le filiali"  options={FILIALI_OPT} value={filterFiliale} onChange={v => { setFilterFiliale(v); setPage(1) }} />
          <MultiSelect placeholder="Tutti gli autisti" options={DRIVERS_OPT} value={filterAutista} onChange={v => { setFilterAutista(v); setPage(1) }} />
          <MultiSelect placeholder="Tutti gli stati"   options={STATI_OPT}   value={filterStato}   onChange={v => { setFilterStato(v);   setPage(1) }} />
          <MultiSelect placeholder="Tutti gli scenari" options={scenariOpt}   value={filterScen}    onChange={v => { setFilterScen(v);    setPage(1) }} />
        </div>

        {/* Tabella */}
        <div className="table-wrap">
          <table className="data-table esec-table">
            <thead>
              <tr>
                {th('data',    'Data')}
                {th('stato',   'Stato')}
                {th('nome',    'Giro')}
                {th('scenario','Scenario')}
                {th('filiale', 'Filiale')}
                {th('driver',  'Autista')}
                <th>Mezzo</th>
                <th title="Orario inizio stimato">Inizio</th>
                <th title="Orario fine stimato">Fine</th>
                <th title="Durata stimata">Durata</th>
                <th title="Pausa pranzo pianificata">Pranzo</th>
                <th title="PUDO totali">Tot.</th>
                {th('serviti', '✓')}
                {th('saltati', '⚠')}
                {th('falliti', '✗')}
                {th('km',      'Km')}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(r => (
                <tr key={r.id}>
                  <td className="td-small">{formatData(r.data)}</td>
                  <td><StatoBadge stato={r.statoLabel} /></td>
                  <td className="esec-nome">{r.nome}</td>
                  <td className="td-small">{r.scenarioLabel}</td>
                  <td className="td-small">{r.filiale?.nome ?? r.filialeId}</td>
                  <td className="td-small">{r.driverLabel}</td>
                  <td className="td-small esec-mezzo">{r.mezzoLabel}</td>
                  <td className="td-small esec-time">{r.orari.inizio}</td>
                  <td className="td-small esec-time">{r.orari.fine}</td>
                  <td className="td-small">{formatDurata(r.durataMin)}</td>
                  <td className="td-small esec-pausa">{r.pausa.oraInizio} · {r.pausa.durata}min</td>
                  <td className="td-center">
                    <span className="pudo-badge pudo-total">{r.total}</span>
                  </td>
                  <td className="td-center"><PudoBadge count={r.serviti} type="ok"   /></td>
                  <td className="td-center"><PudoBadge count={r.saltati} type="warn" /></td>
                  <td className="td-center"><PudoBadge count={r.falliti} type="err"  /></td>
                  <td className="td-small">{r.distanzaKm} km</td>
                  <td className="td-actions">
                    <button
                      className="esec-live-btn"
                      title="Monitoraggio live"
                      onClick={() => setLiveGiro(r)}
                    >
                      <span className="live-dot-sm" />
                      Live
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageData.length === 0 && (
            <div className="table-empty">Nessun giro trovato con i filtri correnti.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            <PaginationPages current={page} total={totalPages} onPage={setPage} />
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            <span className="page-info">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} di {filtered.length}
            </span>
          </div>
        )}
      </div>

      {/* Live modal */}
      {liveGiro && <LiveModal giro={liveGiro} onClose={() => setLiveGiro(null)} />}
    </div>
  )
}
