import { useState, useMemo } from 'react'
import { FILIALI } from '../../../data/filiali'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../../data/flotta'
import { getCiScenario, getCiGiro } from '../../../data/spedizioni'
import ScenarioWizard from './wizard/ScenarioWizard'
import ScenarioDetail from './ScenarioDetail'
import SchedModal from './SchedModal'
import RisorseModal from './RisorseModal'
import ErrorBoundary from '../../ui/ErrorBoundary'
import {
  getScenarioMeta,
  saveScenarioMeta,
  saveRisorseGiro,
  getAllRisorse,
  isActivoOggi,
  isInRange,
  getExtraScenari,
  addExtraScenario,
  deleteExtraScenario,
} from '../../../services/scenariService'
import './TabScenari.css'
import './wizard/ScenarioWizard.css'
import '../flotta/TabCarburanti.css'

const GIORNI_LABEL = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

function ciColor(ci) {
  if (ci >= 4)   return '#2E7D32'
  if (ci >= 2.5) return '#E65100'
  return '#1565C0'
}

function formatData(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatDurata(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  return `${h}h ${String(m).padStart(2, '0')}min`
}

function countRisorse(giri, risorseMap) {
  return giri.filter(g => {
    const r = risorseMap[g.id]
    return !!(r?.mezzoId ?? g.mezzoId) && !!(r?.autoreId ?? g.autoreId)
  }).length
}

function areRisorseComplete(giri, risorseMap) {
  return countRisorse(giri, risorseMap) === giri.length
}

function buildScenario(f, giriAll, metaVer) {
  const giriF = giriAll.filter(g => g.filialeId === f.id)
  if (!giriF.length) return null
  const allPudoIds = [...new Set(giriF.flatMap(g => g.tappe.map(t => t.pudoId)))]
  const ci = getCiScenario(giriF, 30)
  const kmTotali = +giriF.reduce((s, g) => s + (g.distanzaKm || 0), 0).toFixed(1)
  const tempoMin = giriF.reduce((s, g) => s + (g.durataMin || 0), 0)
  return {
    filiale: f,
    giri: giriF.map(g => ({ ...g, ci: getCiGiro(g, 30) })),
    pudoCount:  allPudoIds.length,
    tappeCount: giriF.reduce((s, g) => s + g.tappe.length, 0),
    ci, kmTotali, tempoMin,
  }
}

export default function TabScenari({ giri, onStartJob, addNotification }) {
  const [filter,         setFilter]         = useState('tutti')
  const [giriModalId,    setGiriModalId]    = useState(null)
  const [showWizard,     setShowWizard]     = useState(false)
  const [editScenario,   setEditScenario]   = useState(null)
  const [detailId,       setDetailId]       = useState(null)
  const [risorse,        setRisorse]        = useState(() => getAllRisorse())
  const [metaVer,        setMetaVer]        = useState(0)
  const [schedModalId,   setSchedModalId]   = useState(null)
  const [risorseModalId, setRisorseModalId] = useState(null)

  const scenari = useMemo(() => {
    // Base: one per filiale with giri
    const base = FILIALI.map(f => {
      const sc = buildScenario(f, giri, metaVer)
      if (!sc) return null
      const id = `SC_${f.id}`
      return { ...sc, id, label: null, isClone: false, meta: getScenarioMeta(id) }
    }).filter(Boolean)

    // Extra / cloned scenarios
    const extras = getExtraScenari().map(e => {
      const f = FILIALI.find(fl => fl.id === e.filialeId)
      if (!f) return null
      const sc = buildScenario(f, giri, metaVer)
      if (!sc) return null
      return { ...sc, id: e.id, label: e.label, isClone: true, meta: getScenarioMeta(e.id) }
    }).filter(Boolean)

    return [...base, ...extras]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giri, metaVer])

  const ciMedioGlobale = scenari.length
    ? +(scenari.reduce((s, sc) => s + sc.ci, 0) / scenari.length).toFixed(2)
    : 0
  const pudoTotali   = new Set(giri.flatMap(g => g.tappe.map(t => t.pudoId))).size
  const giriTotali   = scenari.reduce((s, sc) => s + sc.giri.length, 0)
  const attivatiOggi = scenari.filter(sc => isActivoOggi(sc.meta)).length
  const filtered     = filter === 'oggi' ? scenari.filter(sc => isActivoOggi(sc.meta)) : scenari

  function refreshMeta() { setMetaVer(v => v + 1) }

  function canActivate(sc) {
    return areRisorseComplete(sc.giri, risorse) && !!sc.meta.schedulazione
  }

  function handleToggle(sc) {
    if (!sc.meta.attivo && !canActivate(sc)) {
      const missingRisorse = !areRisorseComplete(sc.giri, risorse)
      const missingSched   = !sc.meta.schedulazione
      const msg = [
        missingRisorse && 'risorse incomplete',
        missingSched   && 'schedulazione non configurata',
      ].filter(Boolean).join(' e ')
      addNotification?.('warning', 'Scenario non attivabile',
        `Completa ${msg} prima di attivare lo scenario.`)
      return
    }
    saveScenarioMeta(sc.id, { attivo: !sc.meta.attivo })
    refreshMeta()
  }

  function handleMetaChange(scId, patch) {
    saveScenarioMeta(scId, patch)
    refreshMeta()
  }

  function handleRisorseChange(giroId, r) {
    saveRisorseGiro(giroId, r)
    setRisorse(getAllRisorse())
  }

  function handleRisorseSave(scId, risorseEdit) {
    Object.entries(risorseEdit).forEach(([giroId, r]) => handleRisorseChange(giroId, r))
    addNotification?.('info', 'Risorse assegnate', 'Mezzo e autista aggiornati per tutti i giri.')
  }

  function handleClone(sc) {
    const label = `${sc.filiale.nome} (copia)`
    const newId = addExtraScenario(sc.filiale.id, label)
    // copy current schedulazione to clone
    if (sc.meta.schedulazione) {
      saveScenarioMeta(newId, { schedulazione: { ...sc.meta.schedulazione } })
    }
    refreshMeta()
    addNotification?.('info', 'Scenario clonato', `"${label}" è stato aggiunto all'elenco.`)
  }

  function handleDeleteClone(sc) {
    deleteExtraScenario(sc.id)
    refreshMeta()
    addNotification?.('info', 'Scenario eliminato', `"${sc.label}" è stato rimosso.`)
  }

  function handleWizardConfirm(data) {
    setShowWizard(false)
    setEditScenario(null)
    const label = `Ottimizzazione OptimoRoute — ${data.nomeScenario} · ${data.pudoSelezionati.size} PUDO`
    onStartJob && onStartJob(label)
    addNotification?.('info', 'Scenario inviato',
      `"${data.nomeScenario}" è in elaborazione su OptimoRoute.`)
  }

  // Detail view (read-only)
  if (detailId) {
    const sc = scenari.find(s => s.id === detailId)
    if (sc) return (
      <ScenarioDetail
        scenario={sc}
        risorse={risorse}
        onBack={() => setDetailId(null)}
      />
    )
  }

  const schedModalSc   = schedModalId   ? scenari.find(s => s.id === schedModalId)   : null
  const risorseModalSc = risorseModalId ? scenari.find(s => s.id === risorseModalId) : null

  return (
    <div>
      {/* Toolbar */}
      <div className="scenari-toolbar">
        <span className="scenari-title">Scenari</span>
        <div className="scenari-filter-tabs">
          <button
            className={`scenari-ftab${filter === 'tutti' ? ' active' : ''}`}
            onClick={() => setFilter('tutti')}
          >Tutti ({scenari.length})</button>
          <button
            className={`scenari-ftab${filter === 'oggi' ? ' active' : ''}`}
            onClick={() => setFilter('oggi')}
          >Attivi oggi ({attivatiOggi})</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="scenari-kpi-row">
        {[
          { val: ciMedioGlobale.toFixed(2), label: 'CI medio globale' },
          { val: scenari.length,            label: 'Scenari totali' },
          { val: pudoTotali,                label: 'PUDO totali (unici)' },
          { val: giriTotali,                label: 'Giri totali' },
        ].map(({ val, label }) => (
          <div key={label} className="scenari-kpi">
            <div className="scenari-kpi-val">{val}</div>
            <div className="scenari-kpi-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="scenari-grid">
        {/* New scenario card */}
        <button
          className="scenario-card-new"
          onClick={() => { setEditScenario(null); setShowWizard(true) }}
        >
          <div className="scenario-card-new-icon">＋</div>
          <div className="scenario-card-new-label">Nuovo scenario</div>
          <div className="scenario-card-new-sub">
            Definisci area, filiale, PUDO e parametri OptimoRoute per calcolare nuovi giri
          </div>
        </button>

        {filtered.map(sc => {
          const initial     = sc.filiale.nome.charAt(0).toUpperCase()
          const color       = ciColor(sc.ci)
          const meta        = sc.meta
          const attivo      = !!meta.attivo
          const inRange     = isInRange(meta)
          const outOfRange  = attivo && !inRange
          const risorseOk   = areRisorseComplete(sc.giri, risorse)
          const assignedCnt = countRisorse(sc.giri, risorse)
          const totalGiri   = sc.giri.length
          const schedOk     = !!meta.schedulazione
          const canAct      = risorseOk && schedOk

          return (
            <div
              key={sc.id}
              className={[
                'scenario-card',
                attivo     ? 'sc-is-active'    : '',
                outOfRange ? 'sc-out-of-range' : '',
              ].filter(Boolean).join(' ')}
            >
              {/* Header */}
              <div className="scenario-card-header">
                <div className="scenario-avatar">{initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="scenario-nome">
                    {sc.label ?? sc.filiale.nome}
                    {sc.isClone && <span className="sc-clone-badge">copia</span>}
                  </div>
                  <div className="scenario-citta">{sc.filiale.citta}</div>
                </div>
                <div className="scenario-ci-wrap">
                  <div className="scenario-ci-val" style={{ color }}>{sc.ci.toFixed(2)}</div>
                  <div className="scenario-ci-label">CI / giorno</div>
                </div>
                <button
                  className={`sc-toggle${attivo ? ' on' : ''}`}
                  onClick={() => handleToggle(sc)}
                  title={attivo ? 'Disattiva scenario' : canAct ? 'Attiva scenario' : 'Completa schedulazione e risorse per attivare'}
                  aria-label={attivo ? 'Disattiva' : 'Attiva'}
                >
                  <span className="sc-toggle-knob" />
                </button>
              </div>

              {/* Out-of-range warning */}
              {outOfRange && (
                <div className="sc-oor-warn">
                  ⚠️ Attivo ma fuori dal periodo di schedulazione
                </div>
              )}

              {/* Scheduling block — clickable */}
              <button
                className={`sc-sched-block sc-sched-btn${schedOk ? '' : ' sc-sched-empty'}`}
                onClick={() => setSchedModalId(sc.id)}
                title="Modifica schedulazione"
              >
                {schedOk ? (
                  <>
                    <div className="sc-sched-row">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--fp-gray-mid)' }}>
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span className="sched-range-text">
                        {meta.schedulazione.dataInizio ? formatData(meta.schedulazione.dataInizio) : '—'}
                        {' → '}
                        {meta.schedulazione.dataFine ? formatData(meta.schedulazione.dataFine) : '∞'}
                      </span>
                      {meta.schedulazione.orarioInvio && (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--fp-gray-mid)' }}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span className="sched-invio-badge">{meta.schedulazione.orarioInvio}</span>
                        </>
                      )}
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="sched-edit-icon">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </div>
                    <div className="sched-giorni-chips">
                      {GIORNI_LABEL.map((g, i) => (
                        <span key={i} className={`sched-chip${meta.schedulazione.giorni?.includes(i) ? ' on' : ''}`}>
                          {g}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Imposta schedulazione</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="sched-edit-icon">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </>
                )}
              </button>

              {/* Resources block — clickable */}
              <button
                className={`sc-sched-block sc-sched-btn sc-risorse-block${risorseOk ? ' sc-risorse-ok' : assignedCnt > 0 ? ' sc-risorse-partial' : ' sc-sched-empty'}`}
                onClick={() => setRisorseModalId(sc.id)}
                title="Assegna risorse ai giri"
              >
                <div className="sc-sched-row">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  {risorseOk ? (
                    <span className="sc-risorse-text sc-risorse-text-ok">
                      {assignedCnt}/{totalGiri} giri con risorse complete
                    </span>
                  ) : assignedCnt > 0 ? (
                    <span className="sc-risorse-text sc-risorse-text-partial">
                      {assignedCnt}/{totalGiri} giri con risorse assegnate
                    </span>
                  ) : (
                    <span>Assegna risorse ai giri</span>
                  )}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="sched-edit-icon">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              </button>

              {/* Stats */}
              <div className="scenario-stats">
                <button className="scenario-stat scenario-stat-btn" onClick={() => setGiriModalId(sc.id)} title="Vedi dettaglio giri">
                  <span className="scenario-stat-val sc-stat-link">{sc.giri.length}</span>
                  <span className="scenario-stat-label">Giri</span>
                </button>
                <div className="scenario-stat">
                  <span className="scenario-stat-val">{sc.pudoCount}</span>
                  <span className="scenario-stat-label">PUDO</span>
                </div>
                <div className="scenario-stat">
                  <span className="scenario-stat-val">{sc.kmTotali}</span>
                  <span className="scenario-stat-label">km</span>
                </div>
                <div className="scenario-stat">
                  <span className="scenario-stat-val">{formatDurata(sc.tempoMin)}</span>
                  <span className="scenario-stat-label">Tempo</span>
                </div>
              </div>

              {/* Actions */}
              <div className="scenario-card-actions">
                {!canAct && !attivo && (
                  <span className="sc-res-warn">
                    {!schedOk && !risorseOk ? '⚠ Sched. + risorse' : !schedOk ? '⚠ Schedulazione' : '⚠ Risorse'}
                  </span>
                )}
                <button
                  className="scenario-action-btn"
                  onClick={() => handleClone(sc)}
                  title="Clona questo scenario"
                >Clona</button>
                {sc.isClone && (
                  <button
                    className="scenario-action-btn sc-btn-danger"
                    onClick={() => handleDeleteClone(sc)}
                    title="Elimina questo scenario clonato"
                  >Elimina</button>
                )}
                <button
                  className="scenario-action-btn"
                  onClick={() => {
                    setEditScenario({ nomeScenario: `${sc.label ?? sc.filiale.nome} — Modifica`, filialeId: sc.filiale.id })
                    setShowWizard(true)
                  }}
                >✏️ Modifica</button>
                <button
                  className="scenario-action-btn primary"
                  onClick={() => setDetailId(sc.id)}
                >Dettaglio →</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Giri modal */}
      {giriModalId && (() => {
        const sc = scenari.find(s => s.id === giriModalId)
        if (!sc) return null
        return (
          <div className="sc-modal-backdrop" onClick={() => setGiriModalId(null)}>
            <div className="sc-modal sc-modal-wide" onClick={e => e.stopPropagation()}>
              <div className="sc-modal-header">
                <div>
                  <div className="sc-modal-title">Giri dello scenario</div>
                  <div className="sc-modal-sub">{sc.label ?? sc.filiale.nome} · {sc.filiale.citta}</div>
                </div>
                <button className="sc-modal-close" onClick={() => setGiriModalId(null)}>×</button>
              </div>
              <div className="risorse-modal-body">
                <table className="risorse-table">
                  <thead>
                    <tr>
                      <th>Giro</th>
                      <th>Mezzo</th>
                      <th>Autista</th>
                      <th>km</th>
                      <th>Durata</th>
                      <th>CI atteso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sc.giri.map(g => {
                      const r      = risorse[g.id]
                      const mezzoId  = r?.mezzoId  ?? g.mezzoId
                      const autoreId = r?.autoreId ?? g.autoreId
                      const mezzo    = MEZZI.find(m => m.id === mezzoId)
                      const modello  = mezzo ? MODELLI_MEZZI.find(mm => mm.catalogoId === mezzo.catalogoId) : null
                      const driver   = DRIVERS.find(d => d.id === autoreId)
                      return (
                        <tr key={g.id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{g.nome}</div>
                            <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{g.id}</div>
                          </td>
                          <td>
                            {mezzo ? (
                              <>
                                <div style={{ fontWeight: 500 }}>{mezzo.targa}</div>
                                {modello && <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{modello.marca} {modello.modello.split(' ')[0]}</div>}
                              </>
                            ) : <span className="res-missing">Non assegnato</span>}
                          </td>
                          <td>
                            {driver
                              ? `${driver.cognome} ${driver.nome}`
                              : <span className="res-missing">Non assegnato</span>}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{g.distanzaKm ?? '—'} km</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{g.durataMin ? formatDurata(g.durataMin) : '—'}</td>
                          <td style={{ color: ciColor(g.ci), fontWeight: 700 }}>{g.ci.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="sc-modal-footer" style={{ justifyContent: 'flex-end' }}>
                <button className="btn-confirm-modal" onClick={() => setGiriModalId(null)}>Chiudi</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Scheduling modal */}
      {schedModalSc && (
        <SchedModal
          scenario={schedModalSc}
          onSave={patch => {
            handleMetaChange(schedModalSc.id, patch)
            addNotification?.('info', 'Schedulazione salvata', 'Le impostazioni sono state aggiornate.')
          }}
          onClose={() => setSchedModalId(null)}
        />
      )}

      {/* Risorse modal */}
      {risorseModalSc && (
        <RisorseModal
          scenario={risorseModalSc}
          risorse={risorse}
          onSave={risorseEdit => handleRisorseSave(risorseModalSc.id, risorseEdit)}
          onClose={() => setRisorseModalId(null)}
        />
      )}

      {/* Wizard */}
      {showWizard && (
        <ErrorBoundary key={`wizard-${editScenario?.filialeId ?? 'new'}`}>
          <ScenarioWizard
            existingScenario={editScenario}
            onClose={() => { setShowWizard(false); setEditScenario(null) }}
            onConfirm={handleWizardConfirm}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}
