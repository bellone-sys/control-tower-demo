import { useState, useMemo, Fragment } from 'react'
import { SPEDIZIONI_INIT } from '../../data/spedizioni'
import pudosRoma from '../../data/pudosRoma.json'
import MultiSelect from '../ui/MultiSelect'
import ImportModal from './spedizioni/ImportModal'
import PudoDetailModal from './spedizioni/PudoDetailModal'
import TutorialOverlay from '../tutorials/TutorialOverlay'
import './Sections.css'

const PAGE_SIZE = 15

// ── PUDO lookup ──────────────────────────────────────────
const PUDOS_MAP = Object.fromEntries(pudosRoma.map(p => [p.id, p]))

function getPudoTipo(pudoId) {
  const p = PUDOS_MAP[pudoId]
  if (!p) return 'negozio'
  const name = (p.name || '').toLowerCase()
  return name.includes('locker') || name.includes('automatico') || name.includes('mail boxes')
    ? 'locker' : 'negozio'
}

// ── Filter options ───────────────────────────────────────
const TIPO_OPT = [
  { value: 'consegna', label: '📦 Consegna' },
  { value: 'ritiro',   label: '🔄 Ritiro' },
]

const TIPO_PUDO_OPT = [
  { value: 'negozio', label: '🏪 Negozio' },
  { value: 'locker',  label: '🔒 Locker'  },
]

// Unique PUDOs — label uses full name from pudosRoma, value is pudoId
const PUDO_OPT = [...new Map(SPEDIZIONI_INIT.map(s => [s.pudoId, s])).values()]
  .sort((a, b) => {
    const na = PUDOS_MAP[a.pudoId]?.name ?? a.pudoNome
    const nb = PUDOS_MAP[b.pudoId]?.name ?? b.pudoNome
    return na.localeCompare(nb)
  })
  .map(s => {
    const fullName = PUDOS_MAP[s.pudoId]?.name ?? s.pudoNome
    return { value: s.pudoId, label: `[${s.pudoId}] ${fullName}` }
  })

const SORT_OPT = [
  { value: 'data-desc',   label: 'Data (recente)' },
  { value: 'data-asc',    label: 'Data (vecchia)'  },
  { value: 'peso-desc',   label: 'Peso ↓' },
  { value: 'peso-asc',    label: 'Peso ↑' },
  { value: 'volume-desc', label: 'Volume ↓' },
  { value: 'volume-asc',  label: 'Volume ↑' },
]

const PERIODO_OPT = [
  { value: 'all',       label: 'Tutto il periodo'  },
  { value: 'today',     label: 'Oggi'              },
  { value: 'yesterday', label: 'Ieri'              },
  { value: 'week',      label: 'Ultimi 7 giorni'   },
  { value: 'month',     label: 'Ultimo mese'       },
  { value: 'custom',    label: 'Personalizzato…'   },
]

const TIPO_BADGE = {
  consegna: { color: '#1565C0', bg: '#e3f0fb' },
  ritiro:   { color: '#E65100', bg: '#fff3e0' },
}

const MODALITA_CFG = {
  api:    { label: 'API',         icon: '📡', color: '#6B21A8', bg: '#f3e8ff' },
  upload: { label: 'Upload file', icon: '📁', color: '#1565C0', bg: '#e3f0fb' },
}

// ── Helpers ──────────────────────────────────────────────
function formatData(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatDataOra(iso) {
  if (!iso) return '—'
  const [date, time] = iso.split('T')
  const [y, m, d]   = date.split('-')
  return `${d}/${m}/${y}${time ? ' ' + time.slice(0, 5) : ''}`
}

function toISO(date) { return date.toISOString().slice(0, 10) }

function getDateRange(period, dateFrom, dateTo) {
  const now   = new Date()
  const today = toISO(now)
  switch (period) {
    case 'today':     return [today, today]
    case 'yesterday': { const y = toISO(new Date(now - 86400000)); return [y, y] }
    case 'week':      return [toISO(new Date(now - 6 * 86400000)), today]
    case 'month':     return [toISO(new Date(now - 29 * 86400000)), today]
    case 'custom':    return [dateFrom || null, dateTo || null]
    default:          return [null, null]
  }
}

// ── KPI (full dataset) ───────────────────────────────────
const KPI_TOTALI   = SPEDIZIONI_INIT.length
const KPI_CONSEGNE = SPEDIZIONI_INIT.filter(s => s.tipo === 'consegna').length
const KPI_RITIRI   = SPEDIZIONI_INIT.filter(s => s.tipo === 'ritiro').length
const KPI_PESO     = +(SPEDIZIONI_INIT.reduce((s, sp) => s + sp.peso, 0).toFixed(1))

// ── Pagination component ─────────────────────────────────
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

// ── Main component ───────────────────────────────────────
export default function Spedizioni({ onStartJob }) {
  const [search,          setSearch]          = useState('')
  const [filterTipo,      setFilterTipo]      = useState([])
  const [filterTipoPudo,  setFilterTipoPudo]  = useState([])
  const [filterPudo,      setFilterPudo]      = useState([])
  const [periodo,         setPeriodo]         = useState('all')
  const [dateFrom,        setDateFrom]        = useState('')
  const [dateTo,          setDateTo]          = useState('')
  const [sort,            setSort]            = useState('data-desc')
  const [page,            setPage]            = useState(1)
  const [showImport,      setShowImport]      = useState(false)
  const [expandedRows,    setExpandedRows]    = useState(new Set())
  const [pudoModal,       setPudoModal]       = useState(null)

  const [rangeFrom, rangeTo] = getDateRange(periodo, dateFrom, dateTo)

  const filtered = useMemo(() => {
    let list = SPEDIZIONI_INIT
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.destinatario.toLowerCase().includes(q) ||
        s.pudoNome.toLowerCase().includes(q) ||
        s.pudoId.toLowerCase().includes(q)
      )
    }
    if (filterTipo.length)     list = list.filter(s => filterTipo.includes(s.tipo))
    if (filterTipoPudo.length) list = list.filter(s => filterTipoPudo.includes(getPudoTipo(s.pudoId)))
    if (filterPudo.length)     list = list.filter(s => filterPudo.includes(s.pudoId))
    if (rangeFrom)             list = list.filter(s => s.data >= rangeFrom)
    if (rangeTo)               list = list.filter(s => s.data <= rangeTo)

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'data-asc':    return a.data.localeCompare(b.data)    || a.id.localeCompare(b.id)
        case 'peso-desc':   return b.peso   - a.peso
        case 'peso-asc':    return a.peso   - b.peso
        case 'volume-desc': return b.volume - a.volume
        case 'volume-asc':  return a.volume - b.volume
        default:            return b.data.localeCompare(a.data)    || a.id.localeCompare(b.id)
      }
    })
  }, [search, filterTipo, filterTipoPudo, filterPudo, sort, rangeFrom, rangeTo])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetPage()              { setPage(1) }
  function handleSearch(v)          { setSearch(v);          resetPage() }
  function handleTipo(v)            { setFilterTipo(v);      resetPage() }
  function handleTipoPudo(v)        { setFilterTipoPudo(v);  resetPage() }
  function handlePudo(v)            { setFilterPudo(v);      resetPage() }
  function handleSort(v)            { setSort(v);            resetPage() }
  function handlePeriodo(v)         { setPeriodo(v);         resetPage() }
  function handleDateFrom(v)        { setDateFrom(v);        resetPage() }
  function handleDateTo(v)          { setDateTo(v);          resetPage() }
  function resetPeriod()            { setPeriodo('all'); setDateFrom(''); setDateTo(''); resetPage() }

  function toggleRow(id) {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openPudoModal(pudoId, e) {
    e.stopPropagation()
    const pudo = PUDOS_MAP[pudoId]
    if (!pudo) return
    setPudoModal({ pudo, tipo: getPudoTipo(pudoId) })
  }

  function handleImportConfirm(params) {
    setShowImport(false)
    const label = params.mode === 'api'
      ? `Sincronizzazione AS/400 — ${params.mesi} ${params.mesi === 1 ? 'mese' : 'mesi'} · ${params.province.length} province`
      : `Importazione file — ${params.fileName}`
    onStartJob && onStartJob(label)
  }

  return (
    <div className="section-content">
      <TutorialOverlay
        id="spedizioni_overview"
        title="📦 Gestione Spedizioni"
        description="Qui puoi importare, filtrare e visualizzare tutte le spedizioni. Usa i filtri e l'ordinamento per trovare rapidamente ciò che cerchi."
        position="bottom-right"
      />

      {/* ── KPI strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { val: KPI_TOTALI,       label: 'Spedizioni totali' },
          { val: KPI_CONSEGNE,     label: 'Consegne'          },
          { val: KPI_RITIRI,       label: 'Ritiri'            },
          { val: `${KPI_PESO} kg`, label: 'Peso totale'       },
        ].map(({ val, label }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow)', padding: '18px 20px',
          }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--fp-charcoal)', lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--fp-gray-mid)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div className="card">
        <div className="card-header">
          <h3>Spedizioni</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} risultati</span>
            <button className="btn-primary" onClick={() => setShowImport(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginRight: 5 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Importa spedizioni
            </button>
          </div>
        </div>

        {/* ── Toolbar riga 1: ricerca + tipo + pudo ── */}
        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca ID, destinatario, PUDO…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {search && <button className="search-clear" onClick={() => handleSearch('')}>×</button>}
          </div>

          <MultiSelect placeholder="Tipo spedizione"  options={TIPO_OPT}      value={filterTipo}     onChange={handleTipo}     />
          <MultiSelect placeholder="Tipologia PUDO"   options={TIPO_PUDO_OPT} value={filterTipoPudo} onChange={handleTipoPudo} />
          <MultiSelect placeholder="PUDO (ID / nome)" options={PUDO_OPT}      value={filterPudo}     onChange={handlePudo}     />
        </div>

        {/* ── Toolbar riga 2: data + ordinamento ── */}
        <div className="spd-date-toolbar">
          <span className="spd-date-label">Periodo</span>

          <select
            className="spd-periodo-select"
            value={periodo}
            onChange={e => handlePeriodo(e.target.value)}
          >
            {PERIODO_OPT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {periodo === 'custom' && (
            <>
              <input
                type="date" className="spd-date-input"
                value={dateFrom} onChange={e => handleDateFrom(e.target.value)}
                title="Data dal"
              />
              <span className="spd-date-arrow">→</span>
              <input
                type="date" className="spd-date-input"
                value={dateTo} onChange={e => handleDateTo(e.target.value)}
                title="Data al"
              />
            </>
          )}

          {periodo !== 'all' && (
            <button className="spd-reset-btn" onClick={resetPeriod}>× reset</button>
          )}

          <div className="spd-toolbar-spacer" />

          <select
            className="sort-select"
            value={sort}
            onChange={e => handleSort(e.target.value)}
            style={{
              height: 34, border: '1px solid var(--fp-border)', borderRadius: 'var(--radius)',
              padding: '0 10px', fontSize: 13, color: 'var(--fp-charcoal)',
              background: '#fff', cursor: 'pointer', outline: 'none', minWidth: 150,
            }}
          >
            {SORT_OPT.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Destinatario</th>
                <th>PUDO</th>
                <th>Data</th>
                <th>Peso</th>
                <th>Dimensioni</th>
                <th>Volume</th>
                <th style={{ width: 28 }} title="Dettagli" />
              </tr>
            </thead>
            <tbody>
              {pageData.map(s => {
                const badge    = TIPO_BADGE[s.tipo] || {}
                const vol      = (s.volume / 1_000_000).toFixed(4)
                const expanded = expandedRows.has(s.id)
                const pudoTipo = getPudoTipo(s.pudoId)
                const modCfg   = MODALITA_CFG[s.modalitaAggiornamento] || MODALITA_CFG.api

                return (
                  <Fragment key={s.id}>
                    {/* ── Main row ── */}
                    <tr
                      className={[
                        s.priorita === 'high' ? 'row-high' : '',
                        expanded ? 'spd-row-open' : '',
                      ].join(' ')}
                      onClick={() => toggleRow(s.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><code className="id-code">{s.id}</code></td>
                      <td>
                        <span className="status-badge" style={{ color: badge.color, background: badge.bg }}>
                          {s.tipo === 'consegna' ? '📦 Consegna' : '🔄 Ritiro'}
                        </span>
                      </td>
                      <td>{s.destinatario}</td>
                      <td className="td-small">
                        <div className="pudo-cell">
                          <span
                            className={`pudo-tipo-dot pudo-tipo-dot--${pudoTipo}`}
                            title={pudoTipo === 'locker' ? '🔒 Locker' : '🏪 Negozio'}
                          />
                          <button
                            className="pudo-link"
                            onClick={e => openPudoModal(s.pudoId, e)}
                            title={`Dettagli PUDO ${s.pudoId}`}
                          >
                            {s.pudoNome}
                          </button>
                        </div>
                      </td>
                      <td className="td-small">{formatData(s.data)}</td>
                      <td className="td-small">{s.peso.toFixed(1)} kg</td>
                      <td className="td-small">{s.dimensioni.l}×{s.dimensioni.h}×{s.dimensioni.p} cm</td>
                      <td className="td-small">{vol} m³</td>
                      <td className="spd-expand-cell">
                        <span className={`spd-expand-icon${expanded ? ' spd-expand-icon--open' : ''}`}>›</span>
                      </td>
                    </tr>

                    {/* ── Detail row ── */}
                    {expanded && (
                      <tr className="spd-detail-row">
                        <td colSpan={9}>
                          <div className="spd-detail-strip">

                            <div className="spd-detail-item">
                              <span className="spd-detail-icon">📥</span>
                              <span className="spd-detail-lbl">Importata il</span>
                              <span className="spd-detail-val">{formatData(s.dataImportazione)}</span>
                            </div>

                            <span className="spd-detail-sep" />

                            <div className="spd-detail-item">
                              <span className="spd-detail-icon">🕑</span>
                              <span className="spd-detail-lbl">Ultimo agg.</span>
                              <span className="spd-detail-val">{formatDataOra(s.dataUltimoAggiornamento)}</span>
                            </div>

                            <span className="spd-detail-sep" />

                            <div className="spd-detail-item">
                              <span className="spd-detail-icon">{modCfg.icon}</span>
                              <span className="spd-detail-lbl">Modalità</span>
                              <span
                                className="status-badge"
                                style={{ color: modCfg.color, background: modCfg.bg, fontSize: 11, padding: '1px 7px' }}
                              >
                                {modCfg.label}
                              </span>
                            </div>

                            <span className="spd-detail-sep" />

                            <div className="spd-detail-item">
                              <span className="spd-detail-icon">👤</span>
                              <span className="spd-detail-lbl">
                                {s.modalitaAggiornamento === 'api' ? 'Chiave API' : 'Utente'}
                              </span>
                              <code className="spd-detail-code">{s.utenteAggiornamento}</code>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>

          {pageData.length === 0 && (
            <div className="table-empty">Nessun risultato trovato.</div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(1)}        disabled={page === 1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>‹</button>
            <PaginationPages current={page} total={totalPages} onPage={setPage} />
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            <span className="page-info">
              {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} di {filtered.length}
            </span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onConfirm={handleImportConfirm} />
      )}

      {pudoModal && (
        <PudoDetailModal
          pudo={pudoModal.pudo}
          tipo={pudoModal.tipo}
          onClose={() => setPudoModal(null)}
        />
      )}
    </div>
  )
}
