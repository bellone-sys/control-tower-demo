import { useState, useMemo } from 'react'
import MultiSelect from '../../ui/MultiSelect'
import '../Sections.css'
import './Flotta.css'

const PAGE_SIZE = 15

const TIPO_LABEL = { compact: 'Compact', medio: 'Medio', grande: 'Grande' }
const TIPO_CLASS  = { compact: 'tipo-compact', medio: 'tipo-medio', grande: 'tipo-grande' }
const CARB_CFG   = {
  'Diesel':    { color: '#414042', bg: '#f0f0f0' },
  'Elettrico': { color: '#1565C0', bg: '#e3f0fb' },
  'Ibrido':    { color: '#2E7D32', bg: '#e8f5e9' },
}

const TIPO_OPT = Object.keys(TIPO_LABEL).map(t => ({ value: t, label: TIPO_LABEL[t] }))
const CARB_OPT = Object.keys(CARB_CFG).map(c => ({ value: c, label: c }))

const EMPTY_FORM = {
  marca: '', modello: '', tipo: 'compact', carburante: 'Diesel',
  consumo: '', volumeM3: '', caricoKg: '', autonomiaKm: '', anno: new Date().getFullYear()
}

function SortTh({ field, sk, sd, onSort, children }) {
  const active = sk === field
  return (
    <th className={`sortable${active ? ' sort-active' : ''}`} onClick={() => onSort(field)}>
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
      <button className="page-btn" onClick={() => onPage(1)}        disabled={page === 1}>«</button>
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {pages.map((p, i) => p === '…'
        ? <span key={`e${i}`} className="page-ellipsis">…</span>
        : <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === total}>›</button>
      <button className="page-btn" onClick={() => onPage(total)}    disabled={page === total}>»</button>
      <span className="page-info">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total_items)} di {total_items}</span>
    </div>
  )
}

export default function TabModelli({ modelli, setModelli, mezzi }) {
  const [search,      setSearch]      = useState('')
  const [filterTipo,  setFilterTipo]  = useState([])
  const [filterCarb,  setFilterCarb]  = useState([])
  const [filterMarca, setFilterMarca] = useState([])
  const [sortKey,     setSortKey]     = useState('marca')
  const [sortDir,    setSortDir]    = useState('asc')
  const [page,       setPage]       = useState(1)
  const [modal,      setModal]      = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [errors,     setErrors]     = useState({})
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleteErr,  setDeleteErr]  = useState(null)

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function openAdd() { setForm(EMPTY_FORM); setErrors({}); setModal({ mode: 'add' }) }
  function openEdit(mod) {
    setForm({
      marca: mod.marca, modello: mod.modello, tipo: mod.tipo, carburante: mod.carburante,
      consumo: mod.consumo, volumeM3: mod.volumeM3, caricoKg: mod.caricoKg,
      autonomiaKm: mod.autonomiaKm, anno: mod.anno
    })
    setErrors({}); setModal({ mode: 'edit', mod })
  }

  function validate() {
    const e = {}
    if (!form.marca.trim())   e.marca = true
    if (!form.modello.trim()) e.modello = true
    if (!form.consumo)        e.consumo = true
    if (!form.volumeM3)       e.volumeM3 = true
    if (!form.caricoKg)       e.caricoKg = true
    if (!form.autonomiaKm)    e.autonomiaKm = true
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const unitaConsumo = form.carburante === 'Elettrico' ? 'kWh/100km' : 'l/100km'
    const payload = {
      ...form,
      unitaConsumo,
      consumo:     Number(form.consumo),
      volumeM3:    Number(form.volumeM3),
      caricoKg:    Number(form.caricoKg),
      autonomiaKm: Number(form.autonomiaKm),
      anno:        Number(form.anno),
    }

    if (modal.mode === 'add') {
      const maxNum = modelli.length
        ? Math.max(...modelli.map(m => parseInt(m.catalogoId.replace('CAT', ''))))
        : 0
      const catalogoId = `CAT${String(maxNum + 1).padStart(3, '0')}`
      setModelli(prev => [...prev, { catalogoId, ...payload }])
    } else {
      setModelli(prev => prev.map(m => m.catalogoId === modal.mod.catalogoId ? { ...m, ...payload } : m))
    }
    setModal(null)
  }

  function tryDelete(id) {
    const inUse = mezzi.filter(m => m.catalogoId === id).length
    if (inUse > 0) {
      setDeleteErr(`Impossibile eliminare: ${inUse} veicol${inUse > 1 ? 'i usano' : 'o usa'} questo modello.`)
      setDeleteId(id)
    } else {
      setDeleteErr(null)
      setDeleteId(id)
    }
  }

  function handleDelete(id) {
    const inUse = mezzi.filter(m => m.catalogoId === id).length
    if (inUse > 0) return
    setModelli(prev => prev.filter(m => m.catalogoId !== id))
    setDeleteId(null)
  }

  const filtered = useMemo(() => {
    let list = modelli
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.marca.toLowerCase().includes(q)   ||
        m.modello.toLowerCase().includes(q) ||
        m.catalogoId.toLowerCase().includes(q)
      )
    }
    if (filterTipo.length) list = list.filter(m => filterTipo.includes(m.tipo))
    if (filterCarb.length) list = list.filter(m => filterCarb.includes(m.carburante))
    if (filterMarca.length) list = list.filter(m => filterMarca.includes(m.marca))
    return [...list].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (['consumo','volumeM3','caricoKg','autonomiaKm','anno'].includes(sortKey)) { av = Number(av); bv = Number(bv) }
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [modelli, search, filterTipo, filterCarb, filterMarca, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // Get unique marche for filter
  const marche = [...new Set(modelli.map(m => m.marca))].sort()
  const MARCA_OPT = marche.map(m => ({ value: m, label: m }))

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Modelli di veicoli</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} di {modelli.length}</span>
            <button className="btn-primary" onClick={openAdd}>+ Aggiungi</button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Cerca marca, modello, ID…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
            {search && <button className="search-clear" onClick={() => { setSearch(''); setPage(1) }}>×</button>}
          </div>
          <MultiSelect placeholder="Tutte le marche"     options={MARCA_OPT} value={filterMarca} onChange={v => { setFilterMarca(v); setPage(1) }} />
          <MultiSelect placeholder="Tutti i tipi"       options={TIPO_OPT} value={filterTipo} onChange={v => { setFilterTipo(v); setPage(1) }} />
          <MultiSelect placeholder="Tutti i carburanti" options={CARB_OPT} value={filterCarb} onChange={v => { setFilterCarb(v); setPage(1) }} />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortTh field="catalogoId"  sk={sortKey} sd={sortDir} onSort={handleSort}>ID</SortTh>
                <SortTh field="marca"       sk={sortKey} sd={sortDir} onSort={handleSort}>Marca / Modello</SortTh>
                <SortTh field="tipo"        sk={sortKey} sd={sortDir} onSort={handleSort}>Tipo</SortTh>
                <SortTh field="carburante"  sk={sortKey} sd={sortDir} onSort={handleSort}>Carburante</SortTh>
                <SortTh field="volumeM3"    sk={sortKey} sd={sortDir} onSort={handleSort} style={{ textAlign: 'right' }}>Vol. m³</SortTh>
                <SortTh field="caricoKg"    sk={sortKey} sd={sortDir} onSort={handleSort} style={{ textAlign: 'right' }}>Carico kg</SortTh>
                <SortTh field="autonomiaKm" sk={sortKey} sd={sortDir} onSort={handleSort} style={{ textAlign: 'right' }}>Autonomia</SortTh>
                <SortTh field="consumo"     sk={sortKey} sd={sortDir} onSort={handleSort} style={{ textAlign: 'right' }}>Consumo</SortTh>
                <SortTh field="anno"        sk={sortKey} sd={sortDir} onSort={handleSort}>Anno</SortTh>
                <th>In uso</th>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(mod => {
                const carb    = CARB_CFG[mod.carburante] || {}
                const inUse   = mezzi.filter(m => m.catalogoId === mod.catalogoId).length
                const isDel   = deleteId === mod.catalogoId
                const hasErr  = isDel && deleteErr
                return (
                  <tr key={mod.catalogoId} className={isDel && !hasErr ? 'row-deleting' : ''}>
                    <td><code className="id-code">{mod.catalogoId}</code></td>
                    <td>
                      <div>
                        <span className="mezzo-marca">{mod.marca}</span>
                        <span className="td-small">{mod.modello}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tipo-badge ${TIPO_CLASS[mod.tipo]}`}>{TIPO_LABEL[mod.tipo]}</span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: carb.color, background: carb.bg }}>
                        {mod.carburante}
                      </span>
                    </td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{mod.volumeM3}</span><span className="spec-unit">m³</span>
                    </td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{mod.caricoKg.toLocaleString('it-IT')}</span><span className="spec-unit">kg</span>
                    </td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{mod.autonomiaKm}</span><span className="spec-unit">km</span>
                    </td>
                    <td className="td-center spec-cell">
                      <span className="spec-val">{mod.consumo}</span><span className="spec-unit">{mod.unitaConsumo}</span>
                    </td>
                    <td className="td-small">{mod.anno}</td>
                    <td>
                      {inUse > 0
                        ? <span className="status-badge" style={{ color: '#2E7D32', background: '#e8f5e9' }}>{inUse} veicol{inUse > 1 ? 'i' : 'o'}</span>
                        : <span className="td-small text-gray">—</span>}
                    </td>
                    <td>
                      {isDel ? (
                        hasErr ? (
                          <div className="row-confirm" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                            <span className="td-small" style={{ color: '#f44336' }}>{deleteErr}</span>
                            <button className="btn-cancel-sm" onClick={() => { setDeleteId(null); setDeleteErr(null) }}>Ok</button>
                          </div>
                        ) : (
                          <div className="row-confirm">
                            <span className="td-small text-gray">Elimina?</span>
                            <button className="btn-confirm-sm" onClick={() => handleDelete(mod.catalogoId)}>Sì</button>
                            <button className="btn-cancel-sm"  onClick={() => { setDeleteId(null); setDeleteErr(null) }}>No</button>
                          </div>
                        )
                      ) : (
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => openEdit(mod)} title="Modifica">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="btn-icon btn-icon-danger" onClick={() => tryDelete(mod.catalogoId)} title="Elimina">
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
          {pageData.length === 0 && <div className="table-empty">Nessun modello trovato.</div>}
        </div>

        <Pagination page={page} total={totalPages} onPage={setPage} pageSize={PAGE_SIZE} total_items={filtered.length} />
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Nuovo modello' : `Modifica — ${modal.mod.marca} ${modal.mod.modello.split(' ').slice(0,2).join(' ')}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Marca *</label>
                  <input className={`form-input${errors.marca ? ' error' : ''}`} value={form.marca} onChange={setF('marca')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Anno</label>
                  <input type="number" className="form-input" value={form.anno} onChange={setF('anno')} min="2000" max="2030" />
                </div>
                <div className="form-field full">
                  <label className="form-label">Modello (nome completo) *</label>
                  <input className={`form-input${errors.modello ? ' error' : ''}`} value={form.modello} onChange={setF('modello')} placeholder="es. Transit Custom 2.0 EcoBlue 130" />
                </div>
                <div className="form-field">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={form.tipo} onChange={setF('tipo')}>
                    {Object.keys(TIPO_LABEL).map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Carburante</label>
                  <select className="form-select" value={form.carburante} onChange={setF('carburante')}>
                    {Object.keys(CARB_CFG).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Volume (m³) *</label>
                  <input type="number" className={`form-input${errors.volumeM3 ? ' error' : ''}`} value={form.volumeM3} onChange={setF('volumeM3')} step="0.1" min="0" />
                </div>
                <div className="form-field">
                  <label className="form-label">Carico max (kg) *</label>
                  <input type="number" className={`form-input${errors.caricoKg ? ' error' : ''}`} value={form.caricoKg} onChange={setF('caricoKg')} min="0" />
                </div>
                <div className="form-field">
                  <label className="form-label">Autonomia (km) *</label>
                  <input type="number" className={`form-input${errors.autonomiaKm ? ' error' : ''}`} value={form.autonomiaKm} onChange={setF('autonomiaKm')} min="0" />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Consumo ({form.carburante === 'Elettrico' ? 'kWh/100km' : 'l/100km'}) *
                  </label>
                  <input type="number" className={`form-input${errors.consumo ? ' error' : ''}`} value={form.consumo} onChange={setF('consumo')} step="0.1" min="0" />
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
