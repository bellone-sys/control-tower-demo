import { useState, useMemo } from 'react'
import { FILIALI as FILIALI_INIT, STATI_FILIALE, REGIONI } from '../../data/filiali'
import { FILIALI_BRT } from '../../data/filialiBrt'
import MultiSelect from '../ui/MultiSelect'
import EntityHistory from '../ui/EntityHistory'
import './Sections.css'
import './Filiali.css'
import '../sections/flotta/Flotta.css'

const PAGE_SIZE = 15

const STATO_CFG = {
  'Attiva':         { color: '#2E7D32', bg: '#e8f5e9' },
  'Inattiva':       { color: '#808285', bg: '#f0f0f0' },
  'In manutenzione':{ color: '#F57C00', bg: '#fff3e0' },
}

const STATI_OPT   = STATI_FILIALE.map(s => ({ value: s, label: s }))
const REGIONI_OPT = REGIONI.map(r => ({ value: r, label: r }))

const EMPTY_FORM = {
  nome: '', via: '', cap: '', citta: '', provincia: '', regione: '',
  lat: '', lng: '', telefono: '', email: '', responsabile: '',
  emailResponsabile: '', stato: 'Attiva', superficie: '', puntiRitiro: 0,
  dataApertura: '',
}

function SortTh({ field, sk, sd, onSort, children, style }) {
  const active = sk === field
  return (
    <th className={`sortable${active ? ' sort-active' : ''}`} onClick={() => onSort(field)} style={style}>
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

export default function Filiali() {
  const [filiali,       setFiliali]       = useState(FILIALI_INIT)
  const [search,        setSearch]        = useState('')
  const [filterStati,   setFilterStati]   = useState([])
  const [filterRegioni, setFilterRegioni] = useState([])
  const [sortKey,       setSortKey]       = useState('nome')
  const [sortDir,       setSortDir]       = useState('asc')
  const [page,          setPage]          = useState(1)
  const [modal,         setModal]         = useState(null)
  const [modalTab,      setModalTab]      = useState('form')
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [errors,        setErrors]        = useState({})
  const [deleteId,      setDeleteId]      = useState(null)
  // BRT import flow
  const [brtSearch,     setBrtSearch]     = useState('')
  const [brtSource,     setBrtSource]     = useState(null) // filiale BRT usata come sorgente

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setErrors({})
    setBrtSearch('')
    setBrtSource(null)
    setModal({ mode: 'add', step: 'source' })
  }

  function openEdit(f) {
    setForm({
      nome: f.nome, via: f.via, cap: f.cap, citta: f.citta,
      provincia: f.provincia, regione: f.regione,
      lat: f.lat, lng: f.lng,
      telefono: f.telefono, email: f.email,
      responsabile: f.responsabile, emailResponsabile: f.emailResponsabile,
      stato: f.stato, superficie: f.superficie,
      puntiRitiro: f.puntiRitiro, dataApertura: f.dataApertura,
    })
    setErrors({})
    setModal({ mode: 'edit', filiale: f })
  }

  // Importa i campi disponibili da una filiale BRT e avanza al form
  function importFromBrt(brt) {
    setForm({
      ...EMPTY_FORM,
      nome:      brt.nome,
      via:       brt.indirizzo,
      cap:       brt.cap,
      citta:     brt.citta,
      provincia: brt.provincia,
      regione:   brt.regione,
      telefono:  brt.telefono || '',
    })
    setBrtSource(brt)
    setModal(m => ({ ...m, step: 'form' }))
  }

  function validate() {
    const e = {}
    if (!form.nome.trim())   e.nome = true
    if (!form.via.trim())    e.via = true
    if (!form.cap.trim())    e.cap = true
    if (!form.citta.trim())  e.citta = true
    if (!form.email.trim())  e.email = true
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const payload = {
      ...form,
      lat:         parseFloat(form.lat)         || 0,
      lng:         parseFloat(form.lng)         || 0,
      superficie:  parseInt(form.superficie)    || 0,
      puntiRitiro: parseInt(form.puntiRitiro)   || 0,
    }

    if (modal.mode === 'add') {
      const maxId = filiali.length
        ? Math.max(...filiali.map(f => parseInt(f.id.slice(1))))
        : 0
      setFiliali(prev => [...prev, { id: `F${String(maxId + 1).padStart(3, '0')}`, ...payload }])
    } else {
      setFiliali(prev => prev.map(f => f.id === modal.filiale.id ? { ...f, ...payload } : f))
    }
    setModal(null)
  }

  function handleDelete(id) {
    setFiliali(prev => prev.filter(f => f.id !== id))
    setDeleteId(null)
  }

  // Filtra le filiali BRT per il picker
  const filteredBrt = useMemo(() => {
    if (!brtSearch.trim()) return FILIALI_BRT
    const q = brtSearch.toLowerCase()
    return FILIALI_BRT.filter(b =>
      b.nome.toLowerCase().includes(q)     ||
      b.citta.toLowerCase().includes(q)    ||
      b.provincia.toLowerCase().includes(q)||
      b.regione.toLowerCase().includes(q)  ||
      (b.cap && b.cap.includes(q))
    )
  }, [brtSearch])

  const filtered = useMemo(() => {
    let list = filiali
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.nome.toLowerCase().includes(q)        ||
        f.citta.toLowerCase().includes(q)       ||
        f.provincia.toLowerCase().includes(q)   ||
        f.id.toLowerCase().includes(q)          ||
        f.responsabile.toLowerCase().includes(q)||
        f.cap.includes(q)
      )
    }
    if (filterStati.length)   list = list.filter(f => filterStati.includes(f.stato))
    if (filterRegioni.length) list = list.filter(f => filterRegioni.includes(f.regione))

    return [...list].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (['superficie', 'puntiRitiro', 'lat', 'lng'].includes(sortKey)) { av = Number(av); bv = Number(bv) }
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filiali, search, filterStati, filterRegioni, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // Titolo header modale in base al passo
  function modalTitle() {
    if (modal.mode === 'edit') return `Modifica — ${modal.filiale.nome}`
    if (modal.step === 'brt-picker') return 'Importa da filiale BRT'
    if (modal.step === 'form' && brtSource) return `Nuova filiale — da ${brtSource.nome}`
    return 'Nuova filiale'
  }

  // Rendering del form (condiviso add-form + edit)
  function renderForm() {
    return (
      <>
        {/* Notice importazione BRT */}
        {modal.mode === 'add' && brtSource && (
          <div className="brt-import-notice">
            <span className="brt-import-icon">🔗</span>
            <div>
              <span className="brt-import-label">Importato da BRT · {brtSource.nome}</span>
              <span className="brt-import-sub"> — Completa i campi mancanti e verifica i dati prima di salvare.</span>
            </div>
          </div>
        )}

        <div className="modal-section-title">Anagrafica</div>
        <div className="form-grid form-grid-3">
          <div className="form-field full">
            <label className="form-label">Nome filiale *</label>
            <input className={`form-input${errors.nome ? ' error' : ''}`} value={form.nome} onChange={setF('nome')} placeholder="es. Milano Bovisa" />
          </div>
          <div className="form-field full">
            <label className="form-label">Via / Indirizzo *</label>
            <input className={`form-input${errors.via ? ' error' : ''}`} value={form.via} onChange={setF('via')} />
          </div>
          <div className="form-field">
            <label className="form-label">CAP *</label>
            <input className={`form-input${errors.cap ? ' error' : ''}`} value={form.cap} onChange={setF('cap')} maxLength={5} />
          </div>
          <div className="form-field">
            <label className="form-label">Città *</label>
            <input className={`form-input${errors.citta ? ' error' : ''}`} value={form.citta} onChange={setF('citta')} />
          </div>
          <div className="form-field">
            <label className="form-label">Provincia</label>
            <input className="form-input" value={form.provincia} onChange={setF('provincia')} maxLength={2} style={{ textTransform: 'uppercase' }} placeholder="MI" />
          </div>
          <div className="form-field">
            <label className="form-label">Regione</label>
            <select className="form-select" value={form.regione} onChange={setF('regione')}>
              <option value="">— Seleziona —</option>
              {REGIONI.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Latitudine</label>
            <input type="number" step="0.0001" className="form-input" value={form.lat} onChange={setF('lat')} placeholder="45.1234" />
          </div>
          <div className="form-field">
            <label className="form-label">Longitudine</label>
            <input type="number" step="0.0001" className="form-input" value={form.lng} onChange={setF('lng')} placeholder="9.5678" />
          </div>
          <div className="form-field">
            <label className="form-label">Stato</label>
            <select className="form-select" value={form.stato} onChange={setF('stato')}>
              {STATI_FILIALE.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="modal-section-title" style={{ marginTop: 20 }}>Contatti e responsabile</div>
        <div className="form-grid form-grid-3">
          <div className="form-field">
            <label className="form-label">Telefono</label>
            <input className="form-input" value={form.telefono} onChange={setF('telefono')} placeholder="+39 02 000 0000" />
          </div>
          <div className="form-field">
            <label className="form-label">Email filiale *</label>
            <input className={`form-input${errors.email ? ' error' : ''}`} value={form.email} onChange={setF('email')} placeholder="filiale@fermopoint.it" />
          </div>
          <div className="form-field">
            <label className="form-label">Responsabile</label>
            <input className="form-input" value={form.responsabile} onChange={setF('responsabile')} />
          </div>
          <div className="form-field">
            <label className="form-label">Email responsabile</label>
            <input className="form-input" value={form.emailResponsabile} onChange={setF('emailResponsabile')} placeholder="nome.cognome@fermopoint.it" />
          </div>
        </div>

        <div className="modal-section-title" style={{ marginTop: 20 }}>Dati operativi</div>
        <div className="form-grid form-grid-3">
          <div className="form-field">
            <label className="form-label">Superficie (m²)</label>
            <input type="number" className="form-input" value={form.superficie} onChange={setF('superficie')} min="0" />
          </div>
          <div className="form-field">
            <label className="form-label">PUDO gestiti</label>
            <input type="number" className="form-input" value={form.puntiRitiro} onChange={setF('puntiRitiro')} min="0" />
          </div>
          <div className="form-field">
            <label className="form-label">Data apertura</label>
            <input type="date" className="form-input" value={form.dataApertura} onChange={setF('dataApertura')} />
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="section-content">

      {/* KPI strip */}
      <div className="filiali-kpi-row">
        <div className="filiali-kpi">
          <span className="filiali-kpi-val">{filiali.length}</span>
          <span className="filiali-kpi-label">Filiali totali</span>
        </div>
        <div className="filiali-kpi">
          <span className="filiali-kpi-val" style={{ color: '#2E7D32' }}>
            {filiali.filter(f => f.stato === 'Attiva').length}
          </span>
          <span className="filiali-kpi-label">Attive</span>
        </div>
        <div className="filiali-kpi">
          <span className="filiali-kpi-val">{filiali.reduce((s, f) => s + f.puntiRitiro, 0).toLocaleString('it-IT')}</span>
          <span className="filiali-kpi-label">PUDO gestiti</span>
        </div>
        <div className="filiali-kpi">
          <span className="filiali-kpi-val">{filiali.reduce((s, f) => s + f.superficie, 0).toLocaleString('it-IT')} m²</span>
          <span className="filiali-kpi-label">Superficie totale</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Filiali</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} di {filiali.length}</span>
            <button className="btn-primary" onClick={openAdd}>+ Aggiungi</button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca nome, città, CAP, responsabile…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            {search && <button className="search-clear" onClick={() => { setSearch(''); setPage(1) }}>×</button>}
          </div>
          <MultiSelect placeholder="Tutti gli stati"   options={STATI_OPT}   value={filterStati}   onChange={v => { setFilterStati(v);   setPage(1) }} />
          <MultiSelect placeholder="Tutte le regioni"  options={REGIONI_OPT} value={filterRegioni} onChange={v => { setFilterRegioni(v); setPage(1) }} />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortTh field="id"          sk={sortKey} sd={sortDir} onSort={handleSort}>ID</SortTh>
                <SortTh field="nome"        sk={sortKey} sd={sortDir} onSort={handleSort}>Filiale</SortTh>
                <th>Indirizzo</th>
                <SortTh field="regione"     sk={sortKey} sd={sortDir} onSort={handleSort}>Regione</SortTh>
                <th>Responsabile</th>
                <SortTh field="puntiRitiro" sk={sortKey} sd={sortDir} onSort={handleSort} style={{ textAlign: 'right' }}>PUDO</SortTh>
                <SortTh field="superficie"  sk={sortKey} sd={sortDir} onSort={handleSort} style={{ textAlign: 'right' }}>Superficie</SortTh>
                <SortTh field="dataApertura"sk={sortKey} sd={sortDir} onSort={handleSort}>Apertura</SortTh>
                <SortTh field="stato"       sk={sortKey} sd={sortDir} onSort={handleSort}>Stato</SortTh>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(f => {
                const cfg   = STATO_CFG[f.stato] || {}
                const isDel = deleteId === f.id
                return (
                  <tr key={f.id} className={isDel ? 'row-deleting' : ''}>
                    <td><code className="id-code">{f.id}</code></td>
                    <td>
                      <div className="filiale-cell">
                        <div className="filiale-avatar">{f.nome.slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="filiale-nome">{f.nome}</div>
                          <div className="td-small">{f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="filiale-addr">{f.via}</div>
                      <div className="td-small">{f.cap} {f.citta} ({f.provincia})</div>
                    </td>
                    <td className="td-small">{f.regione}</td>
                    <td>
                      <div className="filiale-resp">{f.responsabile}</div>
                      <div className="td-small">{f.emailResponsabile}</div>
                    </td>
                    <td className="td-center">
                      <span className="spec-val">{f.puntiRitiro.toLocaleString('it-IT')}</span>
                    </td>
                    <td className="td-center">
                      <span className="spec-val">{f.superficie.toLocaleString('it-IT')}</span>
                      <span className="spec-unit"> m²</span>
                    </td>
                    <td className="td-small">
                      {f.dataApertura
                        ? new Date(f.dataApertura).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>{f.stato}</span>
                    </td>
                    <td>
                      {isDel ? (
                        <div className="row-confirm">
                          <span className="td-small text-gray">Elimina?</span>
                          <button className="btn-confirm-sm" onClick={() => handleDelete(f.id)}>Sì</button>
                          <button className="btn-cancel-sm"  onClick={() => setDeleteId(null)}>No</button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => openEdit(f)} title="Modifica">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="btn-icon btn-icon-danger" onClick={() => setDeleteId(f.id)} title="Elimina">
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
          {pageData.length === 0 && <div className="table-empty">Nessuna filiale trovata.</div>}
        </div>

        <Pagination page={page} total={totalPages} onPage={setPage} pageSize={PAGE_SIZE} total_items={filtered.length} />
      </div>

      {/* ===== MODAL ===== */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)} role="dialog" aria-modal="true"
          aria-label={modal.mode === 'add' ? 'Nuova filiale' : `Modifica filiale ${modal.filiale?.nome}`}>
          <div className="modal-box modal-wide" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="modal-header">
              <h3>{modalTitle()}</h3>
              <button className="modal-close" onClick={() => setModal(null)} aria-label="Chiudi">×</button>
            </div>

            {/* Tabs (solo edit) */}
            {modal.mode === 'edit' && (
              <div className="modal-tabs" role="tablist">
                <button role="tab" aria-selected={modalTab === 'form'}    className={`modal-tab${modalTab === 'form'    ? ' active' : ''}`} onClick={() => setModalTab('form')}>Dati</button>
                <button role="tab" aria-selected={modalTab === 'history'} className={`modal-tab${modalTab === 'history' ? ' active' : ''}`} onClick={() => setModalTab('history')}>🕐 Cronologia</button>
              </div>
            )}

            {/* ── STEP: sorgente ── */}
            {modal.mode === 'add' && modal.step === 'source' && (
              <div className="modal-body">
                <p className="add-source-subtitle">Come vuoi creare la nuova filiale Fermopoint?</p>
                <div className="add-source-options">

                  <button className="add-source-option" onClick={() => setModal(m => ({ ...m, step: 'brt-picker' }))}>
                    <span className="add-source-icon">🔗</span>
                    <div className="add-source-text">
                      <div className="add-source-title">Importa da filiale BRT</div>
                      <div className="add-source-desc">
                        Seleziona una delle {FILIALI_BRT.length} filiali BRT esistenti per pre-compilare
                        indirizzo, città e provincia. Potrai modificare e integrare tutti i dati prima di salvare.
                      </div>
                    </div>
                  </button>

                  <button className="add-source-option" onClick={() => setModal(m => ({ ...m, step: 'form' }))}>
                    <span className="add-source-icon">✏️</span>
                    <div className="add-source-text">
                      <div className="add-source-title">Crea da zero</div>
                      <div className="add-source-desc">
                        Inserisci manualmente tutti i dati della nuova filiale Fermopoint senza partire
                        da un'anagrafica BRT esistente.
                      </div>
                    </div>
                  </button>

                </div>
              </div>
            )}

            {/* ── STEP: BRT picker ── */}
            {modal.mode === 'add' && modal.step === 'brt-picker' && (
              <div className="modal-body brt-picker-body">
                <div className="brt-picker-search-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    className="brt-picker-search"
                    placeholder="Cerca filiale BRT per nome, città, provincia, regione…"
                    value={brtSearch}
                    onChange={e => setBrtSearch(e.target.value)}
                    autoFocus
                  />
                  {brtSearch && (
                    <button className="search-clear" onClick={() => setBrtSearch('')}>×</button>
                  )}
                </div>
                <div className="brt-picker-count">
                  {filteredBrt.length === FILIALI_BRT.length
                    ? `${FILIALI_BRT.length} filiali BRT disponibili`
                    : `${filteredBrt.length} risultati su ${FILIALI_BRT.length}`}
                </div>
                <div className="brt-picker-list">
                  {filteredBrt.length === 0 && (
                    <div className="brt-picker-empty">Nessuna filiale BRT trovata per "{brtSearch}".</div>
                  )}
                  {filteredBrt.map(b => (
                    <button key={b.id} className="brt-picker-item" onClick={() => importFromBrt(b)}>
                      <div className="brt-picker-item-inner">
                        <div className="brt-picker-avatar">{b.nome.slice(0, 2)}</div>
                        <div className="brt-picker-info">
                          <div className="brt-picker-nome">{b.nome}</div>
                          <div className="brt-picker-addr">
                            {b.indirizzo} · {b.cap} {b.citta} ({b.provincia}) · {b.regione}
                          </div>
                        </div>
                        <svg className="brt-picker-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP: form (add) + edit form ── */}
            {(modal.mode === 'edit' || (modal.mode === 'add' && modal.step === 'form')) && (
              <div className="modal-body">
                {(modal.mode === 'add' || modalTab === 'form') && renderForm()}
                {modal.mode === 'edit' && modalTab === 'history' && (
                  <EntityHistory entityType="filiale" entityId={modal.filiale.id} />
                )}
              </div>
            )}

            {/* ── Cronologia panel (edit, outside modal-body scroll) ── */}
            {modal.mode === 'edit' && modalTab === 'history' && (
              <div style={{ padding: '0 24px 16px' }}>
                {/* rendered inline above */}
              </div>
            )}

            {/* Footer */}
            {modal.mode === 'add' && modal.step === 'source' && (
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setModal(null)}>Annulla</button>
              </div>
            )}
            {modal.mode === 'add' && modal.step === 'brt-picker' && (
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setModal(m => ({ ...m, step: 'source' }))}>← Indietro</button>
              </div>
            )}
            {modal.mode === 'add' && modal.step === 'form' && (
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => {
                  setModal(m => ({ ...m, step: brtSource ? 'brt-picker' : 'source' }))
                }}>← Indietro</button>
                <button className="btn-primary" onClick={handleSave}>Aggiungi filiale</button>
              </div>
            )}
            {modal.mode === 'edit' && modalTab === 'form' && (
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setModal(null)}>Annulla</button>
                <button className="btn-primary"   onClick={handleSave}>Salva modifiche</button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
