import { useState, useMemo } from 'react'
import { FILIALI_BRT, PROVINCE_BRT, REGIONI_BRT } from '../../data/filialiBrt'
import MultiSelect from '../ui/MultiSelect'
import './Sections.css'
import './FilialiBrt.css'

const PAGE_SIZE = 20

const REGIONI_OPT  = REGIONI_BRT.map(r => ({ value: r, label: r }))
const PROVINCE_OPT = PROVINCE_BRT.map(p => ({ value: p, label: p }))

function SortTh({ field, sk, sd, onSort, children, style }) {
  const active = sk === field
  return (
    <th
      className={`sortable${active ? ' sort-active' : ''}`}
      onClick={() => onSort(field)}
      style={style}
    >
      {children}
      {active ? <span className="sort-arrow">{sd === 'asc' ? ' ↑' : ' ↓'}</span> : null}
    </th>
  )
}

function Pagination({ page, total, onPage, pageSize, total_items }) {
  if (total <= 1) return null
  const pages = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - 2 && i <= page + 2)) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(1)}        disabled={page === 1}>«</button>
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {pages.map((p, i) => p === '…'
        ? <span key={`e${i}`} className="page-ellipsis">…</span>
        : <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === total}>›</button>
      <button className="page-btn" onClick={() => onPage(total)}    disabled={page === total}>»</button>
      <span className="page-info">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total_items)} di {total_items}
      </span>
    </div>
  )
}

export default function FilialiBrt() {
  const [search,         setSearch]         = useState('')
  const [filterRegioni,  setFilterRegioni]  = useState([])
  const [filterProvince, setFilterProvince] = useState([])
  const [sortKey,        setSortKey]        = useState('nome')
  const [sortDir,        setSortDir]        = useState('asc')
  const [page,           setPage]           = useState(1)

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = FILIALI_BRT
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.nome.toLowerCase().includes(q) ||
        f.citta.toLowerCase().includes(q) ||
        f.indirizzo.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q)
      )
    }
    if (filterRegioni.length)  list = list.filter(f => filterRegioni.includes(f.regione))
    if (filterProvince.length) list = list.filter(f => filterProvince.includes(f.provincia))
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [search, filterRegioni, filterProvince, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const regioniUniche  = new Set(FILIALI_BRT.map(f => f.regione)).size
  const provinceUniche = new Set(FILIALI_BRT.map(f => f.provincia)).size

  return (
    <div className="section-content">

      {/* KPI strip */}
      <div className="brt-kpi-row">
        <div className="brt-kpi">
          <span className="brt-kpi-val">{FILIALI_BRT.length}</span>
          <span className="brt-kpi-label">Filiali BRT totali</span>
        </div>
        <div className="brt-kpi">
          <span className="brt-kpi-val" style={{ color: '#DC0032' }}>{regioniUniche}</span>
          <span className="brt-kpi-label">Regioni coperte</span>
        </div>
        <div className="brt-kpi">
          <span className="brt-kpi-val" style={{ color: '#1A237E' }}>{provinceUniche}</span>
          <span className="brt-kpi-label">Province coperte</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Filiali BRT</h3>
          <div className="card-actions">
            <span className="brt-badge">BRT</span>
            <span className="card-label">{filtered.length} di {FILIALI_BRT.length}</span>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca nome, città, indirizzo…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(''); setPage(1) }}>×</button>
            )}
          </div>
          <MultiSelect
            placeholder="Tutte le regioni"
            options={REGIONI_OPT}
            value={filterRegioni}
            onChange={v => { setFilterRegioni(v); setPage(1) }}
          />
          <MultiSelect
            placeholder="Tutte le province"
            options={PROVINCE_OPT}
            value={filterProvince}
            onChange={v => { setFilterProvince(v); setPage(1) }}
          />
        </div>

        <div className="table-wrap">
          <table className="data-table brt-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>ID</th>
                <SortTh field="nome"      sk={sortKey} sd={sortDir} onSort={handleSort}>Nome</SortTh>
                <th>Indirizzo</th>
                <th style={{ width: 60 }}>CAP</th>
                <SortTh field="citta"     sk={sortKey} sd={sortDir} onSort={handleSort}>Città</SortTh>
                <SortTh field="provincia" sk={sortKey} sd={sortDir} onSort={handleSort} style={{ width: 70 }}>Prov.</SortTh>
                <SortTh field="regione"   sk={sortKey} sd={sortDir} onSort={handleSort}>Regione</SortTh>
                <th style={{ width: 110 }}>Telefono</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(f => (
                <tr key={f.id}>
                  <td><code className="td-id">{f.id}</code></td>
                  <td className="td-nome">{f.nome}</td>
                  <td className="td-addr">{f.indirizzo}</td>
                  <td className="td-small">{f.cap}</td>
                  <td className="td-small">{f.citta}</td>
                  <td><span className="td-prov">{f.provincia}</span></td>
                  <td className="td-small">{f.regione}</td>
                  <td className="td-small">
                    {f.telefono
                      ? <a href={`tel:${f.telefono}`} style={{ color: 'inherit', textDecoration: 'none' }}>{f.telefono}</a>
                      : <span className="td-dash">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageData.length === 0 && (
            <div className="table-empty">Nessuna filiale trovata.</div>
          )}
        </div>

        <Pagination
          page={page}
          total={totalPages}
          onPage={setPage}
          pageSize={PAGE_SIZE}
          total_items={filtered.length}
        />
      </div>
    </div>
  )
}
