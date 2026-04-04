import { useState, useMemo } from 'react'
import { SPEDIZIONI_INIT } from '../../data/spedizioni'
import MultiSelect from '../ui/MultiSelect'
import ImportModal from './spedizioni/ImportModal'
import './Sections.css'

const PAGE_SIZE = 15

const TIPO_OPT = [
  { value: 'consegna', label: '📦 Consegna' },
  { value: 'ritiro',   label: '🔄 Ritiro' },
]

const TIPO_BADGE = {
  consegna: { color: '#1565C0', bg: '#e3f0fb' },
  ritiro:   { color: '#E65100', bg: '#fff3e0' },
}

function formatData(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function PaginationPages({ current, total, onPage }) {
  const pages = []
  const delta = 2
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }
  return (
    <>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === current ? 'active' : ''}`}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        )
      )}
    </>
  )
}

// KPI pre-calcolate sull'intero dataset
const KPI_TOTALI   = SPEDIZIONI_INIT.length
const KPI_CONSEGNE = SPEDIZIONI_INIT.filter(s => s.tipo === 'consegna').length
const KPI_RITIRI   = SPEDIZIONI_INIT.filter(s => s.tipo === 'ritiro').length
const KPI_PESO     = +(SPEDIZIONI_INIT.reduce((s, sp) => s + sp.peso, 0).toFixed(1))

export default function Spedizioni({ onStartJob }) {
  const [search,     setSearch]     = useState('')
  const [filterTipo, setFilterTipo] = useState([])
  const [page,       setPage]       = useState(1)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => {
    let list = SPEDIZIONI_INIT
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.destinatario.toLowerCase().includes(q) ||
        s.pudoNome.toLowerCase().includes(q)
      )
    }
    if (filterTipo.length) {
      list = list.filter(s => filterTipo.includes(s.tipo))
    }
    return [...list].sort((a, b) => {
      if (b.data !== a.data) return b.data.localeCompare(a.data)
      return a.id.localeCompare(b.id)
    })
  }, [search, filterTipo])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(v) { setSearch(v);     setPage(1) }
  function handleTipo(v)   { setFilterTipo(v); setPage(1) }

  function handleImportConfirm(params) {
    setShowImport(false)
    const label = params.mode === 'api'
      ? `Sincronizzazione AS/400 — ${params.mesi} ${params.mesi === 1 ? 'mese' : 'mesi'} · ${params.province.length} province`
      : `Importazione file — ${params.fileName}`
    onStartJob && onStartJob(label)
  }

  return (
    <div className="section-content">
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { val: KPI_TOTALI,        label: 'Spedizioni totali' },
          { val: KPI_CONSEGNE,      label: 'Consegne' },
          { val: KPI_RITIRI,        label: 'Ritiri' },
          { val: `${KPI_PESO} kg`,  label: 'Peso totale' },
        ].map(({ val, label }) => (
          <div key={label} style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow)',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--fp-charcoal)', lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--fp-gray-mid)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabella */}
      <div className="card">
        <div className="card-header">
          <h3>Spedizioni</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} risultati</span>
            <button className="btn-primary" onClick={() => setShowImport(true)}>
              <svg
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ marginRight: 5 }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Importa spedizioni
            </button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca per ID, destinatario, PUDO…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => handleSearch('')}>×</button>
            )}
          </div>

          <MultiSelect
            placeholder="Tutti i tipi"
            options={TIPO_OPT}
            value={filterTipo}
            onChange={handleTipo}
          />
        </div>

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
              </tr>
            </thead>
            <tbody>
              {pageData.map(s => {
                const badge = TIPO_BADGE[s.tipo] || {}
                const vol   = (s.volume / 1_000_000).toFixed(4)
                return (
                  <tr key={s.id} className={s.priorita === 'high' ? 'row-high' : ''}>
                    <td><code className="id-code">{s.id}</code></td>
                    <td>
                      <span className="status-badge" style={{ color: badge.color, background: badge.bg }}>
                        {s.tipo === 'consegna' ? '📦 Consegna' : '🔄 Ritiro'}
                      </span>
                    </td>
                    <td>{s.destinatario}</td>
                    <td className="td-small">{s.pudoNome}</td>
                    <td className="td-small">{formatData(s.data)}</td>
                    <td className="td-small">{s.peso.toFixed(1)} kg</td>
                    <td className="td-small">{s.dimensioni.l}×{s.dimensioni.h}×{s.dimensioni.p} cm</td>
                    <td className="td-small">{vol} m³</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {pageData.length === 0 && (
            <div className="table-empty">Nessun risultato trovato.</div>
          )}
        </div>

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

      {/* Modal importazione */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onConfirm={handleImportConfirm}
        />
      )}
    </div>
  )
}
