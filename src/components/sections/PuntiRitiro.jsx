import { useState, useMemo } from 'react'
import pudosRoma from '../../data/pudosRoma.json'
import PuntiRitiroDetail from './PuntiRitiroDetail'
import './Sections.css'
import './PuntiRitiro.css'

const PAGE_SIZE = 25

const CAPS = [...new Set(pudosRoma.map(p => p.cap))].sort()

const SORT_OPTIONS = [
  { value: 'name-asc',  label: 'Nome A→Z' },
  { value: 'name-desc', label: 'Nome Z→A' },
  { value: 'id-asc',   label: 'Codice A→Z' },
  { value: 'cap-asc',  label: 'CAP ↑' },
]

export default function PuntiRitiro() {
  const [search, setSearch]     = useState('')
  const [filterCap, setFilterCap] = useState('')
  const [sort, setSort]         = useState('name-asc')
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let list = pudosRoma
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.cap.includes(q)
      )
    }
    if (filterCap) list = list.filter(p => p.cap === filterCap)

    const [field, dir] = sort.split('-')
    list = [...list].sort((a, b) => {
      const av = a[field] ?? '', bv = b[field] ?? ''
      return dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return list
  }, [search, filterCap, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(v) { setSearch(v); setPage(1) }
  function handleCap(v)    { setFilterCap(v); setPage(1) }
  function handleSort(v)   { setSort(v); setPage(1) }

  if (selected) {
    return <PuntiRitiroDetail pudo={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="section-content">
      <div className="card">
        <div className="card-header">
          <h3>Punti Ritiro — Roma</h3>
          <span className="card-label">{filtered.length} punti su {pudosRoma.length}</span>
        </div>

        {/* Toolbar */}
        <div className="table-toolbar pr-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca per nome, codice o CAP…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => handleSearch('')}>×</button>
            )}
          </div>

          <select className="pr-select" value={filterCap} onChange={e => handleCap(e.target.value)}>
            <option value="">Tutti i CAP</option>
            {CAPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="pr-select" value={sort} onChange={e => handleSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Codice</th>
                <th>Nome</th>
                <th>CAP</th>
                <th>Civico</th>
                <th>Coordinate</th>
                <th>Orari</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(p => {
                const oggi = ['dom','lun','mar','mer','gio','ven','sab'][new Date().getDay()]
                const orariOggi = p.hours[oggi]
                return (
                  <tr key={p.id} className="pr-row" onClick={() => setSelected(p)}>
                    <td><code className="id-code">{p.id}</code></td>
                    <td className="pr-name">{p.name}</td>
                    <td>{p.cap}</td>
                    <td className="td-small">{p.civico || '—'}</td>
                    <td className="td-small coord-cell">
                      {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                    </td>
                    <td>
                      {orariOggi && orariOggi.length > 0 ? (
                        <span className="orari-oggi">
                          {orariOggi.map(s => `${s.o}–${s.c}`).join(' / ')}
                        </span>
                      ) : orariOggi === null ? (
                        <span className="orari-chiuso">Chiuso oggi</span>
                      ) : (
                        <span className="orari-chiuso">—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-detail" onClick={e => { e.stopPropagation(); setSelected(p) }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Dettaglio
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {pageData.length === 0 && (
            <div className="table-empty">Nessun punto ritiro trovato.</div>
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
    </div>
  )
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
