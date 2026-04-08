import { useState, useMemo } from 'react'
import MultiSelect from '../../ui/MultiSelect'
import '../Sections.css'
import './Flotta.css'

const PAGE_SIZE = 15

const STATO_CFG = {
  'In servizio': { color: '#2E7D32', bg: '#e8f5e9' },
  'Disponibile': { color: '#1565C0', bg: '#e3f0fb' },
  'Ferie':       { color: '#F57C00', bg: '#fff3e0' },
  'Malattia':    { color: '#DC0032', bg: '#fff0f3' },
}

const STATI_OPT   = Object.keys(STATO_CFG).map(s => ({ value: s, label: s }))
const PATENTE_OPT = ['B', 'B+C', 'C', 'D'].map(p => ({ value: p, label: p }))
const EMPTY_FORM  = { nome: '', cognome: '', patente: 'B', telefono: '', email: '', dataNascita: '', stato: 'In servizio' }

function SortTh({ field, sk, sd, onSort, children, style }) {
  const active = sk === field
  return (
    <th className={`sortable ${active ? 'sort-active' : ''}`} onClick={() => onSort(field)} style={style}>
      {children}{active ? <span className="sort-arrow">{sd === 'asc' ? ' ↑' : ' ↓'}</span> : null}
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
      <button className="page-btn" onClick={() => onPage(1)} disabled={page === 1}>«</button>
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {pages.map((p, i) => p === '…'
        ? <span key={`e${i}`} className="page-ellipsis">…</span>
        : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === total}>›</button>
      <button className="page-btn" onClick={() => onPage(total)} disabled={page === total}>»</button>
      <span className="page-info">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total_items)} di {total_items}</span>
    </div>
  )
}

export default function TabAutisti({ drivers, setDrivers, mezzi, setMezzi, modelli }) {
  const [search,       setSearch]       = useState('')
  const [filterStati,  setFilterStati]  = useState([])
  const [filterPatente,setFilterPatente]= useState([])
  const [sortKey,      setSortKey]      = useState('cognome')
  const [sortDir,      setSortDir]      = useState('asc')
  const [page,         setPage]         = useState(1)
  const [modal,        setModal]        = useState(null)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [errors,       setErrors]       = useState({})
  const [deleteId,     setDeleteId]     = useState(null)

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function openAdd() {
    setForm(EMPTY_FORM); setErrors({}); setModal({ mode: 'add' })
  }

  function openEdit(driver) {
    setForm({
      nome: driver.nome, cognome: driver.cognome, patente: driver.patente,
      telefono: driver.telefono, email: driver.email, dataNascita: driver.dataNascita,
      stato: driver.stato
    })
    setErrors({})
    setModal({ mode: 'edit', driver })
  }

  function validate() {
    const e = {}
    if (!form.nome.trim()) e.nome = true
    if (!form.cognome.trim()) e.cognome = true
    if (!form.email.trim()) e.email = true
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const payload = { ...form }

    if (modal.mode === 'add') {
      const maxId = drivers.length ? Math.max(...drivers.map(d => parseInt(d.id.slice(1)))) : 0
      const newId = `D${String(maxId + 1).padStart(3, '0')}`
      setDrivers(prev => [...prev, { id: newId, ...payload }])
    } else {
      setDrivers(prev => prev.map(d => d.id === modal.driver.id ? { ...d, ...payload } : d))
    }
    setModal(null)
  }

  function handleDelete(id) {
    setDrivers(prev => prev.filter(d => d.id !== id))
    setDeleteId(null)
  }

  const filtered = useMemo(() => {
    let list = drivers
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.nome.toLowerCase().includes(q) || d.cognome.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)   || d.email.toLowerCase().includes(q) ||
        d.telefono.includes(q)
      )
    }
    if (filterStati.length)   list = list.filter(d => filterStati.includes(d.stato))
    if (filterPatente.length) list = list.filter(d => filterPatente.includes(d.patente))
    return [...list].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [drivers, search, filterStati, filterPatente, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Autisti</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} di {drivers.length}</span>
            <button className="btn-primary" onClick={openAdd}>+ Aggiungi</button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Cerca nome, ID, email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
            {search && <button className="search-clear" onClick={() => { setSearch(''); setPage(1) }}>×</button>}
          </div>
          <MultiSelect placeholder="Tutti gli stati"   options={STATI_OPT}   value={filterStati}   onChange={v => { setFilterStati(v);   setPage(1) }} />
          <MultiSelect placeholder="Tutte le patenti"  options={PATENTE_OPT} value={filterPatente} onChange={v => { setFilterPatente(v); setPage(1) }} />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortTh field="id"          sk={sortKey} sd={sortDir} onSort={handleSort}>ID</SortTh>
                <SortTh field="cognome"      sk={sortKey} sd={sortDir} onSort={handleSort}>Autista</SortTh>
                <SortTh field="patente"      sk={sortKey} sd={sortDir} onSort={handleSort}>Patente</SortTh>
                <th>Contatti</th>
                <SortTh field="dataNascita" sk={sortKey} sd={sortDir} onSort={handleSort}>Nascita</SortTh>
                <SortTh field="stato"       sk={sortKey} sd={sortDir} onSort={handleSort}>Stato</SortTh>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(d => {
                const cfg   = STATO_CFG[d.stato] || {}
                const isDel = deleteId === d.id
                return (
                  <tr key={d.id} className={isDel ? 'row-deleting' : ''}>
                    <td><code className="id-code">{d.id}</code></td>
                    <td>
                      <div className="driver-cell">
                        <div className="driver-avatar">{d.nome[0]}{d.cognome[0]}</div>
                        <span className="driver-name">{d.nome} {d.cognome}</span>
                      </div>
                    </td>
                    <td><span className="patente-badge">{d.patente}</span></td>
                    <td>
                      <div className="td-small">{d.telefono}</div>
                      <div className="td-small">{d.email}</div>
                    </td>
                    <td className="td-small">{d.dataNascita}</td>
                    <td>
                      <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>{d.stato}</span>
                    </td>
                    <td>
                      {isDel ? (
                        <div className="row-confirm">
                          <span className="td-small text-gray">Elimina?</span>
                          <button className="btn-confirm-sm" onClick={() => handleDelete(d.id)}>Sì</button>
                          <button className="btn-cancel-sm"  onClick={() => setDeleteId(null)}>No</button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => openEdit(d)} title="Modifica">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="btn-icon btn-icon-danger" onClick={() => setDeleteId(d.id)} title="Elimina">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {pageData.length === 0 && <div className="table-empty">Nessun autista trovato.</div>}
        </div>

        <Pagination page={page} total={totalPages} onPage={setPage} pageSize={PAGE_SIZE} total_items={filtered.length} />
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Nuovo autista' : `Modifica — ${modal.driver.nome} ${modal.driver.cognome}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Nome *</label>
                  <input className={`form-input${errors.nome ? ' error' : ''}`} value={form.nome} onChange={setF('nome')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Cognome *</label>
                  <input className={`form-input${errors.cognome ? ' error' : ''}`} value={form.cognome} onChange={setF('cognome')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Patente</label>
                  <select className="form-select" value={form.patente} onChange={setF('patente')}>
                    {['B','B+C','C','D'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Data di nascita</label>
                  <input type="date" className="form-input" value={form.dataNascita} onChange={setF('dataNascita')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Telefono</label>
                  <input className="form-input" value={form.telefono} onChange={setF('telefono')} placeholder="+39 000 000 0000" />
                </div>
                <div className="form-field">
                  <label className="form-label">Email *</label>
                  <input className={`form-input${errors.email ? ' error' : ''}`} value={form.email} onChange={setF('email')} placeholder="nome.cognome@fermopoint.it" />
                </div>
                <div className="form-field">
                  <label className="form-label">Stato</label>
                  <select className="form-select" value={form.stato} onChange={setF('stato')}>
                    {Object.keys(STATO_CFG).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModal(null)}>Annulla</button>
              <button className="btn-primary"   onClick={handleSave}>
                {modal.mode === 'add' ? 'Aggiungi' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
