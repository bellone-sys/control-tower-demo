import { useState, useMemo } from 'react'
import { UTENTI_INIT, RUOLI, RUOLO_CFG, STATI_UTENTE, STATO_UTENTE_CFG } from '../../data/utenti'
import { FILIALI } from '../../data/filiali'
import MultiSelect from '../ui/MultiSelect'
import './Sections.css'
import './Utenti.css'

const PAGE_SIZE = 15

const RUOLI_OPT  = RUOLI.map(r => ({ value: r, label: RUOLO_CFG[r].label }))
const STATI_OPT  = STATI_UTENTE.map(s => ({ value: s, label: s }))
const FILIALI_OPT = FILIALI.map(f => ({ value: f.id, label: f.nome }))

const EMPTY_FORM = {
  nome: '', email: '', password: '', ruolo: 'user',
  filialiIds: [], stato: 'Attivo',
}

function avatar(nome) {
  return nome.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
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

function FilialeChips({ ids }) {
  if (!ids) return <span className="filiale-chip filiale-chip-all">Tutte le filiali</span>
  if (ids.length === 0) return <span className="td-small text-gray">—</span>
  return (
    <div className="filiale-chips">
      {ids.map(id => {
        const f = FILIALI.find(f => f.id === id)
        return <span key={id} className="filiale-chip">{f ? f.nome : id}</span>
      })}
    </div>
  )
}

export default function Utenti({ currentUser }) {
  const [utenti,       setUtenti]       = useState(UTENTI_INIT)
  const [search,       setSearch]       = useState('')
  const [filterRuoli,  setFilterRuoli]  = useState([])
  const [filterStati,  setFilterStati]  = useState([])
  const [filterFiliali,setFilterFiliali]= useState([])
  const [sortKey,      setSortKey]      = useState('nome')
  const [sortDir,      setSortDir]      = useState('asc')
  const [page,         setPage]         = useState(1)
  const [modal,        setModal]        = useState(null)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [errors,       setErrors]       = useState({})
  const [deleteId,     setDeleteId]     = useState(null)
  const [showPwd,      setShowPwd]      = useState(false)

  const isAdmin = currentUser?.ruolo === 'admin'

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function openAdd() {
    setForm(EMPTY_FORM); setErrors({}); setShowPwd(false); setModal({ mode: 'add' })
  }

  function openEdit(u) {
    setForm({
      nome: u.nome, email: u.email, password: u.password,
      ruolo: u.ruolo, filialiIds: u.filialiIds ?? [], stato: u.stato,
    })
    setErrors({}); setShowPwd(false); setModal({ mode: 'edit', utente: u })
  }

  function validate() {
    const e = {}
    if (!form.nome.trim())  e.nome = true
    if (!form.email.trim()) e.email = true
    if (modal?.mode === 'add' && !form.password.trim()) e.password = true
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    // filialiIds: null se admin (accesso totale), array se user
    const filialiIds = form.ruolo === 'admin' ? null : (form.filialiIds.length ? form.filialiIds : [])
    const payload = { ...form, filialiIds }

    if (modal.mode === 'add') {
      const maxId = utenti.length ? Math.max(...utenti.map(u => parseInt(u.id.slice(1)))) : 0
      const newId = `U${String(maxId + 1).padStart(3, '0')}`
      setUtenti(prev => [...prev, {
        id: newId,
        ...payload,
        dataCreazione: new Date().toISOString().slice(0, 10),
        ultimoAccesso: null,
      }])
    } else {
      setUtenti(prev => prev.map(u =>
        u.id === modal.utente.id
          ? { ...u, ...payload }
          : u
      ))
    }
    setModal(null)
  }

  function handleDelete(id) {
    if (id === currentUser?.id) return // non può eliminare se stesso
    setUtenti(prev => prev.filter(u => u.id !== id))
    setDeleteId(null)
  }

  const filtered = useMemo(() => {
    let list = utenti
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.nome.toLowerCase().includes(q)  ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      )
    }
    if (filterRuoli.length)   list = list.filter(u => filterRuoli.includes(u.ruolo))
    if (filterStati.length)   list = list.filter(u => filterStati.includes(u.stato))
    if (filterFiliali.length) list = list.filter(u =>
      u.filialiIds === null || filterFiliali.some(fid => u.filialiIds?.includes(fid))
    )
    return [...list].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [utenti, search, filterRuoli, filterStati, filterFiliali, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // KPI
  const admins   = utenti.filter(u => u.ruolo === 'admin').length
  const attivi   = utenti.filter(u => u.stato === 'Attivo').length
  const multiF   = utenti.filter(u => u.filialiIds && u.filialiIds.length > 1).length

  return (
    <div className="section-content">

      {/* KPI strip */}
      <div className="utenti-kpi-row">
        <div className="utenti-kpi">
          <span className="utenti-kpi-val">{utenti.length}</span>
          <span className="utenti-kpi-label">Utenti totali</span>
        </div>
        <div className="utenti-kpi">
          <span className="utenti-kpi-val" style={{ color: '#2E7D32' }}>{attivi}</span>
          <span className="utenti-kpi-label">Attivi</span>
        </div>
        <div className="utenti-kpi">
          <span className="utenti-kpi-val" style={{ color: '#DC0032' }}>{admins}</span>
          <span className="utenti-kpi-label">Admin</span>
        </div>
        <div className="utenti-kpi">
          <span className="utenti-kpi-val">{multiF}</span>
          <span className="utenti-kpi-label">Accesso multi-filiale</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Gestione utenti</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} di {utenti.length}</span>
            {isAdmin && (
              <button className="btn-primary" onClick={openAdd}>+ Aggiungi utente</button>
            )}
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca nome, email, ID…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            {search && <button className="search-clear" onClick={() => { setSearch(''); setPage(1) }}>×</button>}
          </div>
          <MultiSelect placeholder="Tutti i ruoli"   options={RUOLI_OPT}   value={filterRuoli}   onChange={v => { setFilterRuoli(v);   setPage(1) }} />
          <MultiSelect placeholder="Tutti gli stati" options={STATI_OPT}   value={filterStati}   onChange={v => { setFilterStati(v);   setPage(1) }} />
          <MultiSelect placeholder="Tutte le filiali" options={FILIALI_OPT} value={filterFiliali} onChange={v => { setFilterFiliali(v); setPage(1) }} />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortTh field="id"    sk={sortKey} sd={sortDir} onSort={handleSort}>ID</SortTh>
                <SortTh field="nome"  sk={sortKey} sd={sortDir} onSort={handleSort}>Utente</SortTh>
                <SortTh field="ruolo" sk={sortKey} sd={sortDir} onSort={handleSort}>Ruolo</SortTh>
                <th>Accesso filiali</th>
                <SortTh field="stato" sk={sortKey} sd={sortDir} onSort={handleSort}>Stato</SortTh>
                <SortTh field="dataCreazione"  sk={sortKey} sd={sortDir} onSort={handleSort}>Creato il</SortTh>
                <SortTh field="ultimoAccesso"  sk={sortKey} sd={sortDir} onSort={handleSort}>Ultimo accesso</SortTh>
                {isAdmin && <th style={{ width: 70 }}></th>}
              </tr>
            </thead>
            <tbody>
              {pageData.map(u => {
                const ruoloCfg  = RUOLO_CFG[u.ruolo]  || {}
                const statoCfg  = STATO_UTENTE_CFG[u.stato] || {}
                const isDel     = deleteId === u.id
                const isSelf    = u.id === currentUser?.id
                return (
                  <tr key={u.id} className={isDel ? 'row-deleting' : isSelf ? 'row-self' : ''}>
                    <td><code className="id-code">{u.id}</code></td>
                    <td>
                      <div className="utente-cell">
                        <div className="utente-avatar" style={{ background: u.ruolo === 'admin' ? 'var(--fp-red)' : 'var(--fp-charcoal)' }}>
                          {avatar(u.nome)}
                        </div>
                        <div>
                          <div className="utente-nome">
                            {u.nome}
                            {isSelf && <span className="self-badge">tu</span>}
                          </div>
                          <div className="td-small">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: ruoloCfg.color, background: ruoloCfg.bg, fontWeight: 600 }}>
                        {ruoloCfg.label}
                      </span>
                    </td>
                    <td>
                      <FilialeChips ids={u.filialiIds} />
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: statoCfg.color, background: statoCfg.bg }}>
                        {u.stato}
                      </span>
                    </td>
                    <td className="td-small">
                      {u.dataCreazione
                        ? new Date(u.dataCreazione).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="td-small">
                      {u.ultimoAccesso
                        ? new Date(u.ultimoAccesso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-gray">Mai</span>}
                    </td>
                    {isAdmin && (
                      <td>
                        {isDel ? (
                          <div className="row-confirm">
                            <span className="td-small text-gray">Elimina?</span>
                            <button className="btn-confirm-sm" onClick={() => handleDelete(u.id)}>Sì</button>
                            <button className="btn-cancel-sm"  onClick={() => setDeleteId(null)}>No</button>
                          </div>
                        ) : (
                          <div className="row-actions">
                            <button className="btn-icon" onClick={() => openEdit(u)} title="Modifica">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => setDeleteId(u.id)}
                              disabled={isSelf}
                              title={isSelf ? 'Non puoi eliminare il tuo account' : 'Elimina'}
                              style={isSelf ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {pageData.length === 0 && <div className="table-empty">Nessun utente trovato.</div>}
        </div>

        <Pagination page={page} total={totalPages} onPage={setPage} pageSize={PAGE_SIZE} total_items={filtered.length} />
      </div>

      {/* ===== MODAL ===== */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Nuovo utente' : `Modifica — ${modal.utente.nome}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">

                <div className="form-field">
                  <label className="form-label">Nome completo *</label>
                  <input className={`form-input${errors.nome ? ' error' : ''}`} value={form.nome} onChange={setF('nome')} placeholder="Nome Cognome" />
                </div>

                <div className="form-field">
                  <label className="form-label">Email *</label>
                  <input className={`form-input${errors.email ? ' error' : ''}`} value={form.email} onChange={setF('email')} placeholder="nome@fermopoint.it" />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Password {modal.mode === 'edit' && <span className="form-hint">(lascia vuoto per non modificare)</span>}
                    {modal.mode === 'add' && ' *'}
                  </label>
                  <div className="input-pwd-wrap">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className={`form-input${errors.password ? ' error' : ''}`}
                      value={form.password}
                      onChange={setF('password')}
                      placeholder="••••••••"
                    />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(s => !s)}>
                      {showPwd ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Stato</label>
                  <select className="form-select" value={form.stato} onChange={setF('stato')}>
                    {STATI_UTENTE.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-field full">
                  <label className="form-label">Ruolo</label>
                  <div className="ruolo-picker">
                    {RUOLI.map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`ruolo-option${form.ruolo === r ? ' selected' : ''}`}
                        style={form.ruolo === r ? { borderColor: RUOLO_CFG[r].color, background: RUOLO_CFG[r].bg, color: RUOLO_CFG[r].color } : {}}
                        onClick={() => setForm(f => ({ ...f, ruolo: r }))}
                      >
                        <span className="ruolo-icon">
                          {r === 'admin' ? '🔑' : '👤'}
                        </span>
                        <div>
                          <div className="ruolo-nome">{RUOLO_CFG[r].label}</div>
                          <div className="ruolo-desc">
                            {r === 'admin'
                              ? 'Accesso completo a tutte le funzionalità e filiali'
                              : 'Accesso limitato alle filiali assegnate'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {form.ruolo === 'user' && (
                  <div className="form-field full">
                    <label className="form-label">Filiali accessibili</label>
                    <div className="filiali-picker">
                      {FILIALI.map(f => {
                        const sel = form.filialiIds.includes(f.id)
                        return (
                          <label key={f.id} className={`filiale-pick-opt${sel ? ' selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={sel}
                              onChange={() => setForm(prev => ({
                                ...prev,
                                filialiIds: sel
                                  ? prev.filialiIds.filter(id => id !== f.id)
                                  : [...prev.filialiIds, f.id]
                              }))}
                            />
                            <div>
                              <div className="filiale-pick-nome">{f.nome}</div>
                              <div className="filiale-pick-addr">{f.citta} ({f.provincia})</div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    {form.filialiIds.length === 0 && (
                      <div className="form-hint" style={{ color: '#F57C00', marginTop: 6 }}>
                        ⚠ Nessuna filiale selezionata — l'utente non potrà accedere a dati compartimentati
                      </div>
                    )}
                  </div>
                )}

                {form.ruolo === 'admin' && (
                  <div className="form-field full">
                    <div className="admin-notice">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Gli utenti Admin hanno accesso a <strong>tutte le filiali</strong> e a tutte le funzionalità di gestione.
                    </div>
                  </div>
                )}

              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setModal(null)}>Annulla</button>
              <button className="btn-primary"   onClick={handleSave}>
                {modal.mode === 'add' ? 'Crea utente' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
