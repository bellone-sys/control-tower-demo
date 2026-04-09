import { useState, useMemo } from 'react'
import MultiSelect from '../../ui/MultiSelect'
import Pagination from '../../ui/Pagination'
import '../Sections.css'
import './Flotta.css'

const PAGE_SIZE = 15

const STATO_CFG = {
  'In servizio':  { color: '#2E7D32', bg: '#e8f5e9' },
  'Disponibile':  { color: '#1565C0', bg: '#e3f0fb' },
  'Manutenzione': { color: '#DC0032', bg: '#fff0f3' },
}
const CARB_CFG = {
  'Diesel':    { color: '#414042', bg: '#f0f0f0' },
  'Elettrico': { color: '#1565C0', bg: '#e3f0fb' },
  'Ibrido':    { color: '#2E7D32', bg: '#e8f5e9' },
}
const TIPO_LABEL = { compact: 'Compact', medio: 'Medio', grande: 'Grande' }
const TIPO_CLASS  = { compact: 'tipo-compact', medio: 'tipo-medio', grande: 'tipo-grande' }

const STATI_OPT = Object.keys(STATO_CFG).map(s => ({ value: s, label: s }))
const TIPO_OPT  = Object.keys(TIPO_LABEL).map(t => ({ value: t, label: TIPO_LABEL[t] }))
const CARB_OPT  = ['Diesel', 'Elettrico', 'Ibrido'].map(c => ({ value: c, label: c }))

const EMPTY_FORM = { targa: '', catalogoId: '', stato: 'Disponibile', km: 0 }

function SortTh({ field, sk, sd, onSort, children, style }) {
  const active = sk === field
  return (
    <th className={`sortable${active ? ' sort-active' : ''}`} onClick={() => onSort(field)} style={style}>
      {children}{active ? <span className="sort-arrow">{sd === 'asc' ? ' ↑' : ' ↓'}</span> : null}
    </th>
  )
}

export default function TabMezzi({ mezzi, setMezzi, modelli, drivers }) {
  const [search,      setSearch]      = useState('')
  const [filterTipo,  setFilterTipo]  = useState([])
  const [filterCarb,  setFilterCarb]  = useState([])
  const [filterStati, setFilterStati] = useState([])
  const [sortKey,     setSortKey]     = useState('id')
  const [sortDir,     setSortDir]     = useState('asc')
  const [page,        setPage]        = useState(1)
  const [modal,       setModal]       = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [errors,      setErrors]      = useState({})
  const [deleteId,    setDeleteId]    = useState(null)

  function getCat(catalogoId) { return modelli.find(m => m.catalogoId === catalogoId) }
  function getAutista(autoreId) {
    if (!autoreId) return null
    const d = drivers.find(d => d.id === autoreId)
    return d ? `${d.nome} ${d.cognome}` : null
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function openAdd() { setForm(EMPTY_FORM); setErrors({}); setModal({ mode: 'add' }) }
  function openEdit(mezzo) {
    setForm({ targa: mezzo.targa, catalogoId: mezzo.catalogoId, stato: mezzo.stato, km: mezzo.km })
    setErrors({}); setModal({ mode: 'edit', mezzo })
  }

  function validate() {
    const e = {}
    if (!form.targa.trim()) e.targa = true
    if (!form.catalogoId)   e.catalogoId = true
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const payload = { ...form, km: Number(form.km) || 0 }
    if (modal.mode === 'add') {
      const maxId = mezzi.length ? Math.max(...mezzi.map(m => parseInt(m.id.slice(1)))) : 0
      const newId = `M${String(maxId + 1).padStart(3, '0')}`
      setMezzi(prev => [...prev, { id: newId, autoreId: null, ...payload }])
    } else {
      setMezzi(prev => prev.map(m => m.id === modal.mezzo.id ? { ...m, ...payload } : m))
    }
    setModal(null)
  }

  function handleDelete(id) {
    // Release driver assignment if any
    const mezzo = mezzi.find(m => m.id === id)
    if (mezzo?.autoreId) {
      // Note: driver's mezzoId should ideally be cleared too, but requires setDrivers.
      // Managed from autisti tab; here we just remove the vehicle.
    }
    setMezzi(prev => prev.filter(m => m.id !== id))
    setDeleteId(null)
  }

  const filtered = useMemo(() => {
    let list = mezzi.map(m => ({ ...m, cat: getCat(m.catalogoId) }))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.id.toLowerCase().includes(q)          ||
        m.targa.toLowerCase().includes(q)       ||
        m.cat?.marca.toLowerCase().includes(q)  ||
        m.cat?.modello.toLowerCase().includes(q)
      )
    }
    if (filterTipo.length)  list = list.filter(m => filterTipo.includes(m.cat?.tipo))
    if (filterCarb.length)  list = list.filter(m => filterCarb.includes(m.cat?.carburante))
    if (filterStati.length) list = list.filter(m => filterStati.includes(m.stato))
    return [...list].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (sortKey === 'km') { av = Number(av); bv = Number(bv) }
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [mezzi, search, filterTipo, filterCarb, filterStati, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Mezzi</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} di {mezzi.length}</span>
            <button className="btn-primary" onClick={openAdd}>+ Aggiungi</button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Cerca targa, marca, modello…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
            {search && <button className="search-clear" onClick={() => { setSearch(''); setPage(1) }}>×</button>}
          </div>
          <MultiSelect placeholder="Tutti i tipi"       options={TIPO_OPT}  value={filterTipo}  onChange={v => { setFilterTipo(v);  setPage(1) }} />
          <MultiSelect placeholder="Tutti i carburanti" options={CARB_OPT}  value={filterCarb}  onChange={v => { setFilterCarb(v);  setPage(1) }} />
          <MultiSelect placeholder="Tutti gli stati"    options={STATI_OPT} value={filterStati} onChange={v => { setFilterStati(v); setPage(1) }} />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortTh field="id"    sk={sortKey} sd={sortDir} onSort={handleSort}>ID</SortTh>
                <SortTh field="targa" sk={sortKey} sd={sortDir} onSort={handleSort}>Targa</SortTh>
                <th>Marca / Modello</th>
                <th>Tipo</th>
                <th>Carburante</th>
                <SortTh field="km" sk={sortKey} sd={sortDir} onSort={handleSort}>Km</SortTh>
                <th className="td-center">Vol.</th>
                <th className="td-center">Carico</th>
                <th className="td-center">Autonomia</th>
                <th className="td-center">Consumo</th>
                <th>Autista</th>
                <SortTh field="stato" sk={sortKey} sd={sortDir} onSort={handleSort}>Stato</SortTh>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(m => {
                const cfg     = STATO_CFG[m.stato] || {}
                const carb    = CARB_CFG[m.cat?.carburante] || {}
                const autista = getAutista(m.autoreId)
                const isDel   = deleteId === m.id
                return (
                  <tr key={m.id} className={isDel ? 'row-deleting' : ''}>
                    <td><code className="id-code">{m.id}</code></td>
                    <td><strong className="targa">{m.targa}</strong></td>
                    <td>
                      <div className="mezzo-modello">
                        <span className="mezzo-marca">{m.cat?.marca}</span>
                        <span className="td-small">{m.cat?.modello}</span>
                      </div>
                    </td>
                    <td>
                      {m.cat?.tipo && (
                        <span className={`tipo-badge ${TIPO_CLASS[m.cat.tipo]}`}>{TIPO_LABEL[m.cat.tipo]}</span>
                      )}
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: carb.color, background: carb.bg }}>
                        {m.cat?.carburante}
                      </span>
                    </td>
                    <td className="td-small">{m.km.toLocaleString('it-IT')} km</td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{m.cat?.volumeM3}</span><span className="spec-unit">m³</span>
                    </td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{m.cat?.caricoKg?.toLocaleString('it-IT')}</span><span className="spec-unit">kg</span>
                    </td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{m.cat?.autonomiaKm}</span><span className="spec-unit">km</span>
                    </td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{m.cat?.consumo}</span><span className="spec-unit">{m.cat?.unitaConsumo}</span>
                    </td>
                    <td>
                      {autista
                        ? <span className="mezzo-ref">{autista}</span>
                        : <span className="td-small text-gray">—</span>}
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>{m.stato}</span>
                    </td>
                    <td>
                      {isDel ? (
                        <div className="row-confirm">
                          <span className="td-small text-gray">Elimina?</span>
                          <button className="btn-confirm-sm" onClick={() => handleDelete(m.id)}>Sì</button>
                          <button className="btn-cancel-sm"  onClick={() => setDeleteId(null)}>No</button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => openEdit(m)} title="Modifica">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="btn-icon btn-icon-danger" onClick={() => setDeleteId(m.id)} title="Elimina">
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
          {pageData.length === 0 && <div className="table-empty">Nessun mezzo trovato.</div>}
        </div>

        <Pagination page={page} total={totalPages} onPage={setPage} pageSize={PAGE_SIZE} total_items={filtered.length} />
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Nuovo mezzo' : `Modifica — ${modal.mezzo.targa}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Targa *</label>
                  <input className={`form-input${errors.targa ? ' error' : ''}`} value={form.targa}
                    onChange={setF('targa')} placeholder="AA 000 BB" style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-field">
                  <label className="form-label">Stato</label>
                  <select className="form-select" value={form.stato} onChange={setF('stato')}>
                    {Object.keys(STATO_CFG).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-field full">
                  <label className="form-label">Modello *</label>
                  <select className={`form-select${errors.catalogoId ? ' error' : ''}`} value={form.catalogoId} onChange={setF('catalogoId')}>
                    <option value="">— Seleziona modello —</option>
                    {modelli.map(mod => (
                      <option key={mod.catalogoId} value={mod.catalogoId}>
                        [{mod.catalogoId}] {mod.marca} {mod.modello} — {TIPO_LABEL[mod.tipo]} · {mod.carburante}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Km percorsi</label>
                  <input type="number" className="form-input" value={form.km} onChange={setF('km')} min="0" />
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
