import { useState, useMemo } from 'react'
import { UTENTI_INIT, RUOLI, RUOLO_CFG, STATI_UTENTE, STATO_UTENTE_CFG, AUTH_TYPES, AUTH_TYPE_CFG } from '../../data/utenti'
import { FILIALI } from '../../data/filiali'
import MultiSelect from '../ui/MultiSelect'
import SortTh from '../ui/SortTh'
import Pagination from '../ui/Pagination'
import './Sections.css'
import './Utenti.css'

const PAGE_SIZE = 15

const RUOLI_OPT     = RUOLI.map(r => ({ value: r, label: RUOLO_CFG[r].label }))
const STATI_OPT     = STATI_UTENTE.map(s => ({ value: s, label: s }))
const FILIALI_OPT   = FILIALI.map(f => ({ value: f.id, label: f.nome }))
const AUTH_TYPE_OPT = AUTH_TYPES.map(t => ({ value: t, label: AUTH_TYPE_CFG[t].label }))

const EMPTY_FORM = {
  nome: '', email: '', authType: 'password',
  ruolo: 'user', filialiIds: [], permessi: 'read',
}

function avatar(nome) {
  return nome.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
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
  const [utenti,          setUtenti]          = useState(UTENTI_INIT)
  const [search,          setSearch]          = useState('')
  const [filterRuoli,     setFilterRuoli]     = useState([])
  const [filterStati,     setFilterStati]     = useState([])
  const [filterFiliali,   setFilterFiliali]   = useState([])
  const [filterAuthType,  setFilterAuthType]  = useState([])
  const [sortKey,         setSortKey]         = useState('nome')
  const [sortDir,         setSortDir]         = useState('asc')
  const [page,            setPage]            = useState(1)
  const [modal,           setModal]           = useState(null)   // { mode: 'add'|'edit', utente? }
  const [form,            setForm]            = useState(EMPTY_FORM)
  const [errors,          setErrors]          = useState({})
  const [deleteId,        setDeleteId]        = useState(null)
  const [resetModal,      setResetModal]      = useState(null)   // { utente, step: 'choose'|'portal'|'email', newPwd, confirmPwd, token }

  const isAdmin = currentUser?.ruolo === 'admin'

  // ── Sorting ────────────────────────────────────────────────
  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // ── Toggle stato Attivo/Inattivo direttamente in lista ─────
  function toggleStato(id) {
    setUtenti(prev => prev.map(u => {
      if (u.id !== id) return u
      const next = u.stato === 'Attivo' ? 'Inattivo' : 'Attivo'
      return { ...u, stato: next }
    }))
  }

  // ── Modal add/edit ─────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM); setErrors({}); setModal({ mode: 'add' })
  }

  function openEdit(u) {
    setForm({
      nome: u.nome, email: u.email, authType: u.authType ?? 'password',
      ruolo: u.ruolo, filialiIds: u.filialiIds ?? [], permessi: u.permessi ?? 'read',
    })
    setErrors({}); setModal({ mode: 'edit', utente: u })
  }

  function validate() {
    const e = {}
    if (!form.nome.trim())  e.nome = true
    if (!form.email.trim()) e.email = true
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const filialiIds = form.ruolo === 'admin' ? null : (form.filialiIds.length ? form.filialiIds : [])
    const payload = { nome: form.nome, email: form.email, authType: form.authType, ruolo: form.ruolo, filialiIds, permessi: form.ruolo === 'admin' ? null : form.permessi }

    if (modal.mode === 'add') {
      const maxId = utenti.length ? Math.max(...utenti.map(u => parseInt(u.id.slice(1)))) : 0
      const newId = `U${String(maxId + 1).padStart(3, '0')}`
      setUtenti(prev => [...prev, { id: newId, ...payload, dataCreazione: new Date().toISOString().slice(0, 10), ultimoAccesso: null }])
    } else {
      setUtenti(prev => prev.map(u => u.id === modal.utente.id ? { ...u, ...payload } : u))
    }
    setModal(null)
  }

  function handleDelete(id) {
    if (id === currentUser?.id) return
    setUtenti(prev => prev.filter(u => u.id !== id))
    setDeleteId(null)
  }

  // ── Reset password ─────────────────────────────────────────
  function openReset(u) {
    setResetModal({ utente: u, step: 'choose', newPwd: '', confirmPwd: '', token: generateToken() })
  }

  function handleResetPortal() {
    const { newPwd, confirmPwd } = resetModal
    if (!newPwd || newPwd !== confirmPwd) return
    setUtenti(prev => prev.map(u => u.id === resetModal.utente.id ? { ...u } : u))
    setResetModal(null)
  }

  // ── Filtered + sorted list ──────────────────────────────────
  const filtered = useMemo(() => {
    let list = utenti
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      )
    }
    if (filterRuoli.length)    list = list.filter(u => filterRuoli.includes(u.ruolo))
    if (filterStati.length)    list = list.filter(u => filterStati.includes(u.stato))
    if (filterFiliali.length)  list = list.filter(u =>
      u.filialiIds === null || filterFiliali.some(fid => u.filialiIds?.includes(fid))
    )
    if (filterAuthType.length) list = list.filter(u => filterAuthType.includes(u.authType ?? 'password'))
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [utenti, search, filterRuoli, filterStati, filterFiliali, filterAuthType, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // KPI
  const admins  = utenti.filter(u => u.ruolo === 'admin').length
  const attivi  = utenti.filter(u => u.stato === 'Attivo').length
  const ssoCnt  = utenti.filter(u => (u.authType ?? 'password') === 'sso').length

  // ── Reset modal helpers ────────────────────────────────────
  const resetPwdValid = resetModal &&
    resetModal.newPwd.length >= 8 &&
    resetModal.newPwd === resetModal.confirmPwd

  const resetLink = resetModal
    ? `${window.location.origin}/control-tower-demo/reset-password.html?token=${resetModal.token}&uid=${resetModal.utente?.id}`
    : ''

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
          <span className="utenti-kpi-val" style={{ color: '#6B21A8' }}>{ssoCnt}</span>
          <span className="utenti-kpi-label">Autenticati SSO</span>
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
          <MultiSelect placeholder="Tutti i ruoli"    options={RUOLI_OPT}     value={filterRuoli}    onChange={v => { setFilterRuoli(v);    setPage(1) }} />
          <MultiSelect placeholder="Tutti gli stati"  options={STATI_OPT}     value={filterStati}    onChange={v => { setFilterStati(v);    setPage(1) }} />
          <MultiSelect placeholder="Tipo autenticaz." options={AUTH_TYPE_OPT} value={filterAuthType} onChange={v => { setFilterAuthType(v); setPage(1) }} />
          <MultiSelect placeholder="Tutte le filiali" options={FILIALI_OPT}   value={filterFiliali}  onChange={v => { setFilterFiliali(v);  setPage(1) }} />
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortTh field="id"           sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>ID</SortTh>
                <SortTh field="nome"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Utente</SortTh>
                <SortTh field="ruolo"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Ruolo</SortTh>
                <SortTh field="authType"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Autenticazione</SortTh>
                <th>Accesso filiali</th>
                <th>Stato</th>
                <SortTh field="dataCreazione" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Creato il</SortTh>
                <SortTh field="ultimoAccesso" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Ultimo accesso</SortTh>
                {isAdmin && <th style={{ width: 100 }}></th>}
              </tr>
            </thead>
            <tbody>
              {pageData.map(u => {
                const ruoloCfg   = RUOLO_CFG[u.ruolo]              || {}
                const authCfg    = AUTH_TYPE_CFG[u.authType ?? 'password'] || {}
                const statoCfg   = STATO_UTENTE_CFG[u.stato]       || {}
                const isDel      = deleteId === u.id
                const isSelf     = u.id === currentUser?.id
                const isPwdUser  = (u.authType ?? 'password') === 'password'
                const isActive   = u.stato === 'Attivo'
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
                      <span className="status-badge" style={{ color: authCfg.color, background: authCfg.bg }}>
                        {authCfg.label}
                      </span>
                    </td>
                    <td><FilialeChips ids={u.filialiIds} /></td>
                    <td>
                      {/* Toggle attivo/inattivo inline */}
                      <div className="stato-toggle-wrap">
                        <button
                          className={`stato-toggle${isActive ? ' on' : ''}`}
                          onClick={() => isAdmin && !isSelf && u.stato !== 'Sospeso' && toggleStato(u.id)}
                          disabled={!isAdmin || isSelf || u.stato === 'Sospeso'}
                          title={
                            u.stato === 'Sospeso' ? 'Sospeso — modifica dal pannello modifica'
                            : isSelf ? 'Non puoi disattivare te stesso'
                            : isActive ? 'Clicca per disattivare' : 'Clicca per attivare'
                          }
                          aria-pressed={isActive}
                          aria-label={`Stato utente ${u.nome}`}
                        >
                          <span className="stato-knob" />
                        </button>
                        <span className="stato-label" style={{ color: statoCfg.color, fontWeight: 500 }}>
                          {u.stato}
                        </span>
                      </div>
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
                            {/* Reset password — solo per utenti password */}
                            {isPwdUser && (
                              <button
                                className="btn-icon btn-icon-key"
                                onClick={() => openReset(u)}
                                title="Reset password"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                              </button>
                            )}
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

      {/* ===== MODAL ADD/EDIT ===== */}
      {modal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={modal.mode === 'add' ? 'Nuovo utente' : 'Modifica utente'} onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Nuovo utente' : `Modifica — ${modal.utente.nome}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)} aria-label="Chiudi">×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">

                <div className="form-field">
                  <label className="form-label">Nome completo *</label>
                  <input className={`form-input${errors.nome ? ' error' : ''}`} value={form.nome} onChange={setF('nome')} placeholder="Nome Cognome" />
                </div>

                <div className="form-field">
                  <label className="form-label">Email *</label>
                  <input className={`form-input${errors.email ? ' error' : ''}`} value={form.email} onChange={setF('email')} placeholder="nome@fermopoint.it" readOnly={modal.mode === 'edit'} style={modal.mode === 'edit' ? { backgroundColor: 'var(--fp-bg)', color: 'var(--fp-gray-mid)', cursor: 'not-allowed' } : {}} />
                </div>

                {/* Tipo autenticazione */}
                <div className="form-field full">
                  <label className="form-label">Tipo autenticazione</label>
                  <div className="auth-type-picker">
                    {AUTH_TYPES.map(t => {
                      const cfg = AUTH_TYPE_CFG[t]
                      return (
                        <button
                          key={t}
                          type="button"
                          className={`auth-type-option${form.authType === t ? ' selected' : ''}`}
                          style={form.authType === t ? { borderColor: cfg.color, background: cfg.bg, color: cfg.color } : {}}
                          onClick={() => setForm(f => ({ ...f, authType: t }))}
                        >
                          <span className="auth-type-icon">{t === 'sso' ? '🔒' : '🔑'}</span>
                          <div>
                            <div className="auth-type-nome" style={form.authType === t ? { color: cfg.color } : {}}>{cfg.label}</div>
                            <div className="auth-type-desc">
                              {t === 'sso'
                                ? 'Accesso tramite SSO aziendale (es. Azure AD, Google)'
                                : 'Accesso tramite username e password del portale'}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
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
                        <span className="ruolo-icon">{r === 'admin' ? '🔑' : '👤'}</span>
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
                    <label className="form-label">Livello di accesso</label>
                    <div className="ruolo-picker">
                      {[
                        { value: 'read', label: 'Sola lettura', icon: '👁️', desc: 'Accesso in lettura ai dati delle filiali assegnate' },
                        { value: 'write', label: 'Lettura e scrittura', icon: '✏️', desc: 'Accesso completo alle filiali assegnate' },
                      ].map(p => (
                        <button
                          key={p.value}
                          type="button"
                          className={`ruolo-option${form.permessi === p.value ? ' selected' : ''}`}
                          style={form.permessi === p.value ? { borderColor: '#1565C0', background: '#E3F2FD', color: '#1565C0' } : {}}
                          onClick={() => setForm(f => ({ ...f, permessi: p.value }))}
                        >
                          <span className="ruolo-icon">{p.icon}</span>
                          <div>
                            <div className="ruolo-nome">{p.label}</div>
                            <div className="ruolo-desc">{p.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

      {/* ===== MODAL RESET PASSWORD ===== */}
      {resetModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Reset password" onClick={() => setResetModal(null)}>
          <div className="modal-box reset-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset password — {resetModal.utente.nome}</h3>
              <button className="modal-close" onClick={() => setResetModal(null)} aria-label="Chiudi">×</button>
            </div>
            <div className="modal-body">

              {/* Step 1: scegli metodo */}
              {resetModal.step === 'choose' && (
                <div className="reset-choose">
                  <p className="reset-desc">Scegli come reimpostare la password per <strong>{resetModal.utente.email}</strong>:</p>
                  <div className="reset-options">
                    <button className="reset-option" onClick={() => setResetModal(r => ({ ...r, step: 'portal' }))}>
                      <span className="reset-option-icon">🖥️</span>
                      <div>
                        <div className="reset-option-title">Reimposta da portale</div>
                        <div className="reset-option-desc">Inserisci direttamente la nuova password. L'utente riceverà la password dal suo responsabile.</div>
                      </div>
                    </button>
                    <button className="reset-option" onClick={() => setResetModal(r => ({ ...r, step: 'email' }))}>
                      <span className="reset-option-icon">📧</span>
                      <div>
                        <div className="reset-option-title">Invia link via email</div>
                        <div className="reset-option-desc">L'utente riceve un'email con un link sicuro per reimpostare autonomamente la password.</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2a: reset da portale */}
              {resetModal.step === 'portal' && (
                <div className="reset-portal">
                  <div className="form-grid">
                    <div className="form-field full">
                      <label className="form-label">Nuova password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Minimo 8 caratteri"
                        value={resetModal.newPwd}
                        onChange={e => setResetModal(r => ({ ...r, newPwd: e.target.value }))}
                        autoFocus
                      />
                    </div>
                    <div className="form-field full">
                      <label className="form-label">Conferma password</label>
                      <input
                        type="password"
                        className={`form-input${resetModal.confirmPwd && resetModal.newPwd !== resetModal.confirmPwd ? ' error' : ''}`}
                        placeholder="Ripeti la password"
                        value={resetModal.confirmPwd}
                        onChange={e => setResetModal(r => ({ ...r, confirmPwd: e.target.value }))}
                      />
                      {resetModal.confirmPwd && resetModal.newPwd !== resetModal.confirmPwd && (
                        <div className="form-hint" style={{ color: '#DC0032', marginTop: 4 }}>Le password non corrispondono</div>
                      )}
                    </div>
                  </div>
                  {resetModal.newPwd.length > 0 && resetModal.newPwd.length < 8 && (
                    <div className="form-hint" style={{ color: '#F57C00', marginBottom: 4 }}>⚠ La password deve essere di almeno 8 caratteri</div>
                  )}
                </div>
              )}

              {/* Step 2b: invia email */}
              {resetModal.step === 'email' && (
                <div className="reset-email-preview">
                  <div className="reset-email-sent">
                    <span className="reset-email-icon">✅</span>
                    <div>
                      <div className="reset-email-title">Email inviata a <strong>{resetModal.utente.email}</strong></div>
                      <div className="reset-email-sub">Il link è valido per <strong>24 ore</strong> e può essere utilizzato una sola volta.</div>
                    </div>
                  </div>
                  <div className="reset-email-box">
                    <div className="reset-email-label">Link di reset (demo):</div>
                    <code className="reset-email-link">{resetLink}</code>
                    <div className="reset-email-token">Token: <code>{resetModal.token}</code></div>
                  </div>
                  <div className="reset-email-note">
                    In produzione il link viene inviato automaticamente via email. Il token scade dopo 24h e viene invalidato dopo il primo utilizzo.
                  </div>
                </div>
              )}

            </div>
            <div className="modal-footer">
              {resetModal.step === 'choose' && (
                <button className="btn-secondary" onClick={() => setResetModal(null)}>Annulla</button>
              )}
              {resetModal.step === 'portal' && (
                <>
                  <button className="btn-secondary" onClick={() => setResetModal(r => ({ ...r, step: 'choose', newPwd: '', confirmPwd: '' }))}>← Indietro</button>
                  <button className="btn-primary" onClick={handleResetPortal} disabled={!resetPwdValid}>
                    Salva nuova password
                  </button>
                </>
              )}
              {resetModal.step === 'email' && (
                <button className="btn-primary" onClick={() => setResetModal(null)}>Chiudi</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
