import { useState, useMemo } from 'react'
import { FILIALI } from '../../../data/filiali'
import { DRIVERS, MEZZI } from '../../../data/flotta'
import { getCiScenario, getCiGiro } from '../../../data/spedizioni'
import ScenarioWizard from './wizard/ScenarioWizard'
import ScenarioDetail from './ScenarioDetail'
import ErrorBoundary from '../../ui/ErrorBoundary'
import {
  getScenarioMeta,
  saveScenarioMeta,
  saveRisorseGiro,
  getAllRisorse,
  isActivoOggi,
  isInRange,
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

function areRisorseComplete(giri, risorseMap) {
  return giri.every(g => {
    const r = risorseMap[g.id]
    const mezzoId  = r?.mezzoId  ?? g.mezzoId
    const autoreId = r?.autoreId ?? g.autoreId
    return !!(mezzoId && autoreId)
  })
}

export default function TabScenari({ giri, onStartJob, addNotification }) {
  const [filter,       setFilter]       = useState('tutti') // 'tutti' | 'oggi'
  const [expandedId,   setExpandedId]   = useState(null)
  const [showWizard,   setShowWizard]   = useState(false)
  const [editScenario, setEditScenario] = useState(null)
  const [detailId,     setDetailId]     = useState(null)
  const [risorse,      setRisorse]      = useState(() => getAllRisorse())
  const [metaVer,      setMetaVer]      = useState(0)

  const scenari = useMemo(() => {
    return FILIALI.map(f => {
      const giriF = giri.filter(g => g.filialeId === f.id)
      if (!giriF.length) return null
      const allPudoIds = [...new Set(giriF.flatMap(g => g.tappe.map(t => t.pudoId)))]
      const ci = getCiScenario(giriF, 30)
      const kmTotali = +giriF.reduce((s, g) => s + (g.distanzaKm || 0), 0).toFixed(1)
      const tempoMin = giriF.reduce((s, g) => s + (g.durataMin || 0), 0)
      const id = `SC_${f.id}`
      const meta = getScenarioMeta(id)
      return {
        id,
        filiale: f,
        giri: giriF.map(g => ({ ...g, ci: getCiGiro(g, 30) })),
        pudoCount:  allPudoIds.length,
        tappeCount: giriF.reduce((s, g) => s + g.tappe.length, 0),
        ci,
        kmTotali,
        tempoMin,
        meta,
      }
    }).filter(Boolean)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giri, metaVer])

  const ciMedioGlobale = scenari.length
    ? +(scenari.reduce((s, sc) => s + sc.ci, 0) / scenari.length).toFixed(2)
    : 0
  const pudoTotali = new Set(giri.flatMap(g => g.tappe.map(t => t.pudoId))).size
  const giriTotali = scenari.reduce((s, sc) => s + sc.giri.length, 0)
  const attivatiOggi = scenari.filter(sc => isActivoOggi(sc.meta)).length

  const filtered = filter === 'oggi'
    ? scenari.filter(sc => isActivoOggi(sc.meta))
    : scenari

  function refreshMeta() { setMetaVer(v => v + 1) }

  function handleToggle(sc) {
    const risorseOk = areRisorseComplete(sc.giri, risorse)
    if (!risorseOk && !sc.meta.attivo) {
      addNotification?.('warning', 'Risorse mancanti',
        'Assegna mezzo e autista a tutti i giri prima di attivare lo scenario.')
      return
    }
    saveScenarioMeta(sc.id, { attivo: !sc.meta.attivo })
    refreshMeta()
  }

  function handleRisorseChange(giroId, r) {
    saveRisorseGiro(giroId, r)
    setRisorse(getAllRisorse())
  }

  function handleMetaChange(scId, patch) {
    saveScenarioMeta(scId, patch)
    refreshMeta()
  }

  function handleWizardConfirm(data) {
    setShowWizard(false)
    setEditScenario(null)
    const label = `Ottimizzazione OptimoRoute — ${data.nomeScenario} · ${data.pudoSelezionati.size} PUDO`
    onStartJob && onStartJob(label)
    addNotification?.('info', 'Scenario inviato',
      `"${data.nomeScenario}" è in elaborazione su OptimoRoute.`)
  }

  // Detail view
  if (detailId) {
    const sc = scenari.find(s => s.id === detailId)
    if (sc) return (
      <ScenarioDetail
        scenario={sc}
        risorse={risorse}
        onBack={() => setDetailId(null)}
        onMetaChange={patch => handleMetaChange(sc.id, patch)}
        onRisorseChange={handleRisorseChange}
        addNotification={addNotification}
      />
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="scenari-toolbar">
        <span className="scenari-title">Scenari per filiale</span>
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
          { val: scenari.length,            label: 'Scenari attivi' },
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
          const isOpen     = expandedId === sc.id
          const initial    = sc.filiale.nome.charAt(0).toUpperCase()
          const color      = ciColor(sc.ci)
          const meta       = sc.meta
          const attivo     = !!meta.attivo
          const inRange    = isInRange(meta)
          const outOfRange = attivo && !inRange
          const risorseOk  = areRisorseComplete(sc.giri, risorse)

          return (
            <div
              key={sc.id}
              className={[
                'scenario-card',
                attivo    ? 'sc-is-active'    : '',
                outOfRange ? 'sc-out-of-range' : '',
              ].filter(Boolean).join(' ')}
            >
              {/* Header */}
              <div className="scenario-card-header">
                <div className="scenario-avatar">{initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="scenario-nome">{sc.filiale.nome}</div>
                  <div className="scenario-citta">{sc.filiale.citta}</div>
                </div>
                <div className="scenario-ci-wrap">
                  <div className="scenario-ci-val" style={{ color }}>{sc.ci.toFixed(2)}</div>
                  <div className="scenario-ci-label">CI / giorno</div>
                </div>
                {/* Toggle switch */}
                <button
                  className={`sc-toggle${attivo ? ' on' : ''}`}
                  onClick={() => handleToggle(sc)}
                  title={attivo ? 'Disattiva scenario' : risorseOk ? 'Attiva scenario' : 'Assegna risorse prima di attivare'}
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

              {/* Scheduling block */}
              {meta.schedulazione ? (
                <div className="sc-sched-block">
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
                  </div>
                  <div className="sched-giorni-chips">
                    {GIORNI_LABEL.map((g, i) => (
                      <span
                        key={i}
                        className={`sched-chip${meta.schedulazione.giorni?.includes(i) ? ' on' : ''}`}
                      >{g}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="sc-sched-block sc-sched-empty">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Nessuna schedulazione
                </div>
              )}

              {/* Stats */}
              <div className="scenario-stats">
                <div className="scenario-stat">
                  <span className="scenario-stat-val">{sc.giri.length}</span>
                  <span className="scenario-stat-label">Giri</span>
                </div>
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

              {/* Expand */}
              <button className="scenario-expand-btn" onClick={() => setExpandedId(prev => prev === sc.id ? null : sc.id)}>
                {isOpen ? '▲ Nascondi giri' : '▼ Mostra giri'}
              </button>

              {isOpen && (
                <div className="scenario-giri-list">
                  {sc.giri.map(g => {
                    const r = risorse[g.id]
                    const mezzoId  = r?.mezzoId  ?? g.mezzoId
                    const autoreId = r?.autoreId ?? g.autoreId
                    const mezzo  = MEZZI.find(m => m.id === mezzoId)
                    const driver = DRIVERS.find(d => d.id === autoreId)
                    const giroRisorseOk = !!(mezzoId && autoreId)
                    return (
                      <div key={g.id} className="scenario-giro-row">
                        <div>
                          <div className="sgiro-nome">{g.nome}</div>
                          <div className="sgiro-data">
                            {mezzo ? mezzo.targa : <span style={{ color: '#DC0032' }}>Mezzo —</span>}
                            {' · '}
                            {driver ? `${driver.cognome} ${driver.nome[0]}.` : <span style={{ color: '#DC0032' }}>Autista —</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {!giroRisorseOk && (
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC0032', display: 'inline-block' }} title="Risorse mancanti" />
                          )}
                          <span className="sgiro-ci" style={{ color: ciColor(g.ci) }}>
                            {g.ci.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="scenario-card-actions">
                {!risorseOk && (
                  <span className="sc-res-warn">⚠ Risorse incomplete</span>
                )}
                <button
                  className="scenario-action-btn"
                  onClick={() => {
                    setEditScenario({ nomeScenario: `${sc.filiale.nome} — Modifica`, filialeId: sc.filiale.id })
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
