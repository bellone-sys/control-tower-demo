import { useState, useMemo } from 'react'
import { FILIALI } from '../../../data/filiali'
import { getCiScenario, getCiGiro } from '../../../data/spedizioni'
import './TabScenari.css'
import '../flotta/TabCarburanti.css'

const PERIODI = [7, 14, 30]

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

export default function TabScenari({ giri }) {
  const [periodo,    setPeriodo]    = useState(30)
  const [expandedId, setExpandedId] = useState(null)

  const scenari = useMemo(() => {
    return FILIALI.map(f => {
      const giriF = giri.filter(g => g.filialeId === f.id)
      if (!giriF.length) return null
      const allPudoIds = [...new Set(giriF.flatMap(g => g.tappe.map(t => t.pudoId)))]
      const ci = getCiScenario(giriF, periodo)
      return {
        filiale:    f,
        giri:       giriF.map(g => ({ ...g, ci: getCiGiro(g, periodo) })),
        pudoCount:  allPudoIds.length,
        tappeCount: giriF.reduce((s, g) => s + g.tappe.length, 0),
        ci,
      }
    }).filter(Boolean)
  }, [giri, periodo])

  // KPI globali
  const ciMedioGlobale = scenari.length
    ? +(scenari.reduce((s, sc) => s + sc.ci, 0) / scenari.length).toFixed(2)
    : 0
  const pudoTotali = (() => {
    const set = new Set(giri.flatMap(g => g.tappe.map(t => t.pudoId)))
    return set.size
  })()
  const giriTotali   = scenari.reduce((s, sc) => s + sc.giri.length, 0)

  function toggleExpand(id) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="scenari-toolbar">
        <span className="scenari-title">Scenari per filiale</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="scenari-period-label">Periodo:</span>
          <div className="carb-range-tabs">
            {PERIODI.map(p => (
              <button
                key={p}
                className={`carb-range-tab${periodo === p ? ' active' : ''}`}
                onClick={() => setPeriodo(p)}
              >
                {p}gg
              </button>
            ))}
          </div>
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

      {/* Grid scenari */}
      <div className="scenari-grid">
        {scenari.map(sc => {
          const isOpen = expandedId === sc.filiale.id
          const initial = sc.filiale.nome.charAt(0).toUpperCase()
          const color   = ciColor(sc.ci)
          return (
            <div key={sc.filiale.id} className="scenario-card">
              {/* Header */}
              <div className="scenario-card-header">
                <div className="scenario-avatar">{initial}</div>
                <div>
                  <div className="scenario-nome">{sc.filiale.nome}</div>
                  <div className="scenario-citta">{sc.filiale.citta}</div>
                </div>
                <div className="scenario-ci-wrap">
                  <div className="scenario-ci-val" style={{ color }}>{sc.ci.toFixed(2)}</div>
                  <div className="scenario-ci-label">CI / giorno</div>
                </div>
              </div>

              {/* Stats */}
              <div className="scenario-stats">
                <div className="scenario-stat">
                  <span className="scenario-stat-val">{sc.giri.length}</span>
                  <span className="scenario-stat-label">Giri</span>
                </div>
                <div className="scenario-stat">
                  <span className="scenario-stat-val">{sc.pudoCount}</span>
                  <span className="scenario-stat-label">PUDO unici</span>
                </div>
                <div className="scenario-stat">
                  <span className="scenario-stat-val">{sc.tappeCount}</span>
                  <span className="scenario-stat-label">Tappe totali</span>
                </div>
              </div>

              {/* Bottone expand */}
              <button className="scenario-expand-btn" onClick={() => toggleExpand(sc.filiale.id)}>
                {isOpen ? '▲ Nascondi giri' : '▼ Mostra giri'}
              </button>

              {/* Lista giri espansa */}
              {isOpen && (
                <div className="scenario-giri-list">
                  {sc.giri.map(g => (
                    <div key={g.id} className="scenario-giro-row">
                      <div>
                        <div className="sgiro-nome">{g.nome}</div>
                        <div className="sgiro-data">{formatData(g.data)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          className="status-badge"
                          style={{
                            fontSize: 11,
                            color: g.stato === 'Completato' ? '#2E7D32' : g.stato === 'In corso' ? '#E65100' : g.stato === 'Annullato' ? '#DC0032' : '#1565C0',
                            background: g.stato === 'Completato' ? '#e8f5e9' : g.stato === 'In corso' ? '#fff3e0' : g.stato === 'Annullato' ? '#fff0f3' : '#e3f0fb',
                          }}
                        >
                          {g.stato}
                        </span>
                        <span className="sgiro-ci" style={{ color: ciColor(g.ci) }}>
                          {g.ci.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
