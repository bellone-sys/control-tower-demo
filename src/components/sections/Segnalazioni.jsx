import { useState, useMemo, useEffect } from 'react'
import { SEGNALAZIONI_INIT } from '../../data/segnalazioni'
import MultiSelect from '../ui/MultiSelect'
import './Sections.css'
import './Segnalazioni.css'

// ── Configurazioni ──────────────────────────────────────────────────────────

const TIPO_CFG = {
  'PUDO chiuso':            { color: '#DC0032', bg: '#fff0f3', icon: '🔒' },
  'PUDO non raggiungibile': { color: '#E65100', bg: '#fff3e0', icon: '🚧' },
  'Locker non sbloccabile': { color: '#6A1B9A', bg: '#f3e5f5', icon: '📦' },
  'PUDO non convenzionato': { color: '#1565C0', bg: '#e3f0fb', icon: '❌' },
  'PUDO pieno':             { color: '#F57C00', bg: '#fff8e1', icon: '📫' },
  'Altro':                  { color: '#546E7A', bg: '#eceff1', icon: '⚠️' },
}

const STATO_CFG = {
  'Non letta':    { color: '#DC0032', bg: '#fff0f3' },
  'In revisione': { color: '#F57C00', bg: '#fff3e0' },
  'Inviata a FP': { color: '#2E7D32', bg: '#e8f5e9' },
  'Archiviata':   { color: '#808285', bg: '#f5f5f5' },
}

const FILIALE_NOME = { F001: 'Roma', F002: 'Napoli', F003: 'Milano', F004: 'Stezzano' }

const TIPI_OPTIONS  = Object.keys(TIPO_CFG).map(v => ({ value: v, label: v }))
const STATI_OPTIONS = Object.keys(STATO_CFG).map(v => ({ value: v, label: v }))
const FILIALI_OPTIONS = Object.entries(FILIALE_NOME).map(([v, label]) => ({ value: v, label }))

const PAGE_SIZE = 10

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDataOra(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh   = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

function nowIso() {
  return new Date().toISOString().slice(0, 19)
}

// ── Componente Panel segnalazione ────────────────────────────────────────────

function SegnalazionePanel({ sgn, open, onClose, onUpdate }) {
  useEffect(() => {
    if (!open) return
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!sgn) return null

  const tipoCfg  = TIPO_CFG[sgn.tipo]  || TIPO_CFG['Altro']
  const statoCfg = STATO_CFG[sgn.stato] || {}

  const canAct = sgn.stato !== 'Archiviata' && sgn.stato !== 'Inviata a FP'

  function handlePrendiInCarico() {
    const newAudit = [
      ...sgn.audit,
      { ts: nowIso(), autore: 'Alessandro Bellone', azione: 'Presa in carico — stato aggiornato a In revisione' },
    ]
    onUpdate({ ...sgn, stato: 'In revisione', audit: newAudit })
  }

  function handleInviaFP() {
    const newAudit = [
      ...sgn.audit,
      { ts: nowIso(), autore: 'Alessandro Bellone', azione: 'Inviata a Fermopoint per verifica' },
    ]
    onUpdate({ ...sgn, stato: 'Inviata a FP', audit: newAudit })
  }

  function handleArchivia() {
    const newAudit = [
      ...sgn.audit,
      { ts: nowIso(), autore: 'Alessandro Bellone', azione: 'Archiviata dal moderatore' },
    ]
    onUpdate({ ...sgn, stato: 'Archiviata', audit: newAudit })
  }

  const mapsUrl = `https://maps.google.com/?q=${sgn.gps.lat},${sgn.gps.lng}`

  return (
    <>
      <div
        className={`audit-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`audit-panel sgn-panel${open ? ' open' : ''}`}
        aria-label="Dettaglio segnalazione"
        aria-hidden={!open}
        role="complementary"
      >
        <div className="audit-panel-header">
          <div className="audit-panel-title">
            <span style={{ marginRight: 6 }}>{tipoCfg.icon}</span>
            <span>{sgn.tipo}</span>
          </div>
          <span className="audit-panel-entity">{sgn.pudoNome}</span>
          <button className="audit-panel-close" onClick={onClose} aria-label="Chiudi pannello">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="audit-panel-body">
          {/* Badge stato */}
          <div style={{ marginBottom: 16 }}>
            <span
              className="sgn-stato-badge"
              style={{ color: statoCfg.color, background: statoCfg.bg }}
            >
              {sgn.stato}
            </span>
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--fp-gray-mid)' }}>{sgn.id}</span>
          </div>

          {/* Griglia info */}
          <div className="sgn-panel-info-grid">
            <span className="sgn-info-label">Driver</span>
            <span>{sgn.driverNome}</span>

            <span className="sgn-info-label">PUDO</span>
            <span>{sgn.pudoId} — {sgn.pudoNome}</span>

            <span className="sgn-info-label">Giro</span>
            <span>{sgn.giroNome}</span>

            <span className="sgn-info-label">Scenario</span>
            <span>{sgn.scenarioId}</span>

            <span className="sgn-info-label">Filiale</span>
            <span>{FILIALE_NOME[sgn.filialeId] || sgn.filialeId}</span>

            <span className="sgn-info-label">Data/Ora</span>
            <span>{formatDataOra(sgn.dataOra)}</span>

            <span className="sgn-info-label">GPS</span>
            <span>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fp-red)' }}>
                {sgn.gps.lat}, {sgn.gps.lng} ↗
              </a>
            </span>
          </div>

          {/* Note */}
          <div style={{ marginTop: 16, marginBottom: 4, fontSize: 12, fontWeight: 600, color: 'var(--fp-gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Note</div>
          <div className="sgn-panel-note">{sgn.note}</div>

          {/* Foto */}
          {sgn.nImmagini > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Foto allegate ({sgn.nImmagini})
              </div>
              <div className="sgn-thumbs">
                {Array.from({ length: sgn.nImmagini }).map((_, i) => (
                  <div key={i} className="sgn-thumb">
                    📷
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Azioni moderatore */}
          {canAct && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                Azioni moderatore
              </div>
              <div className="sgn-actions">
                {sgn.stato === 'Non letta' && (
                  <button className="sgn-btn-review" onClick={handlePrendiInCarico}>
                    Prendi in carico
                  </button>
                )}
                <button className="sgn-btn-fp" onClick={handleInviaFP}>
                  Invia a Fermopoint
                </button>
                <button className="sgn-btn-archive" onClick={handleArchivia}>
                  Archivia
                </button>
              </div>
            </div>
          )}

          {/* Audit timeline */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-gray-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Cronologia
            </div>
            <ul className="sgn-audit-list">
              {[...sgn.audit].reverse().map((ev, i) => (
                <li key={i} className="sgn-audit-item">
                  <span className="sgn-audit-ts">{formatDataOra(ev.ts)}</span>
                  <span className="sgn-audit-body">
                    <strong>{ev.autore}</strong> — {ev.azione}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  )
}

// ── Componente principale ────────────────────────────────────────────────────

export default function Segnalazioni() {
  const [segnalazioni, setSegnalazioni] = useState(() =>
    SEGNALAZIONI_INIT.map(s => ({ ...s, audit: [...s.audit] }))
  )
  const [search,       setSearch]       = useState('')
  const [filterTipo,   setFilterTipo]   = useState([])
  const [filterStato,  setFilterStato]  = useState([])
  const [filterFiliale, setFilterFiliale] = useState([])
  const [sortCol,      setSortCol]      = useState('dataOra')
  const [sortDir,      setSortDir]      = useState('desc')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(null)

  // KPI
  const kpi = useMemo(() => ({
    nonLette:   segnalazioni.filter(s => s.stato === 'Non letta').length,
    revisione:  segnalazioni.filter(s => s.stato === 'In revisione').length,
    inviateFP:  segnalazioni.filter(s => s.stato === 'Inviata a FP').length,
    archiviate: segnalazioni.filter(s => s.stato === 'Archiviata').length,
  }), [segnalazioni])

  // Filtro
  const filtered = useMemo(() => {
    let list = [...segnalazioni]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(s =>
        s.tipo.toLowerCase().includes(q) ||
        s.driverNome.toLowerCase().includes(q) ||
        s.pudoId.toLowerCase().includes(q) ||
        s.pudoNome.toLowerCase().includes(q) ||
        s.note.toLowerCase().includes(q)
      )
    }
    if (filterTipo.length)    list = list.filter(s => filterTipo.includes(s.tipo))
    if (filterStato.length)   list = list.filter(s => filterStato.includes(s.stato))
    if (filterFiliale.length) list = list.filter(s => filterFiliale.includes(s.filialeId))
    return list
  }, [segnalazioni, search, filterTipo, filterStato, filterFiliale])

  // Sort
  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol]
      if (typeof va === 'string') return va.localeCompare(vb) * dir
      return (va - vb) * dir
    })
  }, [filtered, sortCol, sortDir])

  // Paginazione
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageClamp  = Math.min(page, totalPages)
  const pageItems  = sorted.slice((pageClamp - 1) * PAGE_SIZE, pageClamp * PAGE_SIZE)
  const startIdx   = (pageClamp - 1) * PAGE_SIZE + 1
  const endIdx     = Math.min(pageClamp * PAGE_SIZE, sorted.length)

  function handleSort(col) {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
    setPage(1)
  }

  function sortClass(col) {
    if (col !== sortCol) return 'sortable sort-neutral'
    return `sortable sort-active sort-${sortDir === 'asc' ? 'on' : 'on'}`
  }

  function sortIndicator(col) {
    if (col !== sortCol) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  function handleUpdate(updated) {
    setSegnalazioni(prev => prev.map(s => s.id === updated.id ? updated : s))
    setSelected(updated)
  }

  function handleRowClick(sgn) {
    setSelected(sgn)
  }

  // Reset pagina quando cambiano i filtri
  function handleSearchChange(v) { setSearch(v); setPage(1) }
  function handleFilterTipo(v)   { setFilterTipo(v); setPage(1) }
  function handleFilterStato(v)  { setFilterStato(v); setPage(1) }
  function handleFilterFiliale(v){ setFilterFiliale(v); setPage(1) }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2 className="section-title">Segnalazioni</h2>
        <p className="section-subtitle">Segnalazioni inviate dai driver durante l'esecuzione dei giri</p>
      </div>

      {/* KPI strip */}
      <div className="mini-kpi-row sgn-kpi-row">
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#DC0032' }}>{kpi.nonLette}</span>
          <span className="mini-kpi-label">Non lette</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#F57C00' }}>{kpi.revisione}</span>
          <span className="mini-kpi-label">In revisione</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#2E7D32' }}>{kpi.inviateFP}</span>
          <span className="mini-kpi-label">Inviate a FP</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#808285' }}>{kpi.archiviate}</span>
          <span className="mini-kpi-label">Archiviate</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sgn-toolbar">
        <input
          className="sgn-search"
          type="text"
          placeholder="Cerca per tipo, driver, PUDO, note…"
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
        />
        <MultiSelect
          options={TIPI_OPTIONS}
          value={filterTipo}
          onChange={handleFilterTipo}
          placeholder="Tutti i tipi"
        />
        <MultiSelect
          options={STATI_OPTIONS}
          value={filterStato}
          onChange={handleFilterStato}
          placeholder="Tutti gli stati"
        />
        <MultiSelect
          options={FILIALI_OPTIONS}
          value={filterFiliale}
          onChange={handleFilterFiliale}
          placeholder="Tutte le filiali"
        />
      </div>

      {/* Tabella */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 24 }}></th>
              <th className={sortClass('tipo')} onClick={() => handleSort('tipo')}>
                Tipo{sortIndicator('tipo')}
              </th>
              <th className={sortClass('driverNome')} onClick={() => handleSort('driverNome')}>
                Driver{sortIndicator('driverNome')}
              </th>
              <th className={sortClass('pudoNome')} onClick={() => handleSort('pudoNome')}>
                PUDO{sortIndicator('pudoNome')}
              </th>
              <th className={sortClass('giroNome')} onClick={() => handleSort('giroNome')}>
                Giro{sortIndicator('giroNome')}
              </th>
              <th className={sortClass('dataOra')} onClick={() => handleSort('dataOra')}>
                Data/Ora{sortIndicator('dataOra')}
              </th>
              <th>GPS</th>
              <th>Foto</th>
              <th className={sortClass('stato')} onClick={() => handleSort('stato')}>
                Stato{sortIndicator('stato')}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: 'var(--fp-gray-mid)', fontStyle: 'italic' }}>
                  Nessuna segnalazione trovata
                </td>
              </tr>
            )}
            {pageItems.map(sgn => {
              const tipoCfg  = TIPO_CFG[sgn.tipo]  || TIPO_CFG['Altro']
              const statoCfg = STATO_CFG[sgn.stato] || {}
              const isUnread = sgn.stato === 'Non letta'
              const mapsUrl  = `https://maps.google.com/?q=${sgn.gps.lat},${sgn.gps.lng}`
              return (
                <tr
                  key={sgn.id}
                  className={isUnread ? 'sgn-row-unread' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(sgn)}
                >
                  <td style={{ textAlign: 'center', padding: '0 4px' }}>
                    {isUnread && <span className="sgn-unread-dot" title="Non letta" />}
                  </td>
                  <td>
                    <span
                      className="sgn-tipo-badge"
                      style={{ color: tipoCfg.color, background: tipoCfg.bg }}
                    >
                      {tipoCfg.icon} {sgn.tipo}
                    </span>
                  </td>
                  <td>{sgn.driverNome}</td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{sgn.pudoId}</span>
                    <br />
                    <span>{sgn.pudoNome}</span>
                  </td>
                  <td>{sgn.giroNome}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDataOra(sgn.dataOra)}</td>
                  <td>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      title={`${sgn.gps.lat}, ${sgn.gps.lng}`}
                    >
                      📍
                    </a>
                  </td>
                  <td>
                    {sgn.nImmagini > 0
                      ? <span title={`${sgn.nImmagini} foto`}>📷 {sgn.nImmagini}</span>
                      : <span style={{ color: 'var(--fp-gray-mid)' }}>—</span>
                    }
                  </td>
                  <td>
                    <span
                      className="sgn-stato-badge"
                      style={{ color: statoCfg.color, background: statoCfg.bg }}
                    >
                      {sgn.stato}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-btn"
                      title="Dettaglio"
                      onClick={e => { e.stopPropagation(); handleRowClick(sgn) }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginazione */}
      <div className="sgn-pagination">
        <span style={{ color: 'var(--fp-gray-mid)' }}>
          {sorted.length === 0
            ? 'Nessun risultato'
            : `Risultati ${startIdx}–${endIdx} di ${sorted.length}`
          }
        </span>
        <button
          className="sgn-page-btn"
          disabled={pageClamp <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          ← Prec
        </button>
        <span style={{ fontSize: 12 }}>Pag. {pageClamp} / {totalPages}</span>
        <button
          className="sgn-page-btn"
          disabled={pageClamp >= totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          Succ →
        </button>
      </div>

      {/* Panel laterale */}
      <SegnalazionePanel
        sgn={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
