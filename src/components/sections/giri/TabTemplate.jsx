import { useState, useMemo } from 'react'
import { FILIALI } from '../../../data/filiali'
import { getCiScenario, getCiGiro } from '../../../data/spedizioni'
import {
  getScenarioMeta,
  getExtraScenari,
  deleteExtraScenario,
} from '../../../services/scenariService'
import './TabScenari.css'

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

export default function TabTemplate() {
  const [metaVer, setMetaVer] = useState(0)

  const templates = useMemo(() => {
    return getExtraScenari().map(e => {
      const f = FILIALI.find(fl => fl.id === e.filialeId)
      if (!f) return null
      const meta = getScenarioMeta(e.id)
      return {
        id: e.id,
        label: e.label || `Template ${f.nome}`,
        filiale: f,
        meta,
      }
    }).filter(Boolean)
  }, [metaVer])

  function refreshMeta() { setMetaVer(v => v + 1) }

  function handleDelete(templateId) {
    if (confirm('Eliminare questo template?')) {
      deleteExtraScenario(templateId)
      refreshMeta()
    }
  }

  if (templates.length === 0) {
    return (
      <div className="empty-state">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          color: 'var(--fp-gray-mid)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ color: 'var(--fp-charcoal)', marginBottom: 8 }}>Nessun template salvato</h3>
          <p>
            Salva scenari come template dalla sezione <strong>Scenari</strong> utilizzando
            il bottone "Salva come template" per accedervi rapidamente qui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="scenari-toolbar">
        <span className="scenari-title">Template Scenari</span>
        <span style={{ fontSize: 12, color: 'var(--fp-gray-mid)' }}>
          {templates.length} template{templates.length !== 1 ? 'i' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="scenari-grid">
        {templates.map(t => {
          const initial = t.filiale.nome.charAt(0).toUpperCase()
          const meta = t.meta
          const attivo = !!meta.attivo

          return (
            <div key={t.id} className="scenario-card">
              {/* Badge */}
              <div className="scenario-card-badge">TEMPLATE</div>

              {/* Header */}
              <div className="scenario-card-header">
                <div
                  className="scenario-card-filiale"
                  style={{
                    background: t.filiale.color || '#E8E8E8',
                    color: '#fff',
                  }}
                >
                  {initial}
                </div>
                <div className="scenario-card-title">
                  <div className="scenario-card-filiale-name">
                    {t.filiale.nome}
                  </div>
                  <div className="scenario-card-label">
                    {t.label}
                  </div>
                </div>
              </div>

              {/* Meta info */}
              <div className="scenario-card-meta">
                <div className="scenario-card-meta-item">
                  <span className="scenario-card-meta-label">Stato:</span>
                  <span className={attivo ? 'stato-attivo' : 'stato-non-attivo'}>
                    {attivo ? '✓ Attivo' : '○ Inattivo'}
                  </span>
                </div>
                {meta.schedulazione && (
                  <div className="scenario-card-meta-item">
                    <span className="scenario-card-meta-label">Schedulazione:</span>
                    <span style={{ fontSize: 12 }}>
                      {meta.schedulazione.dataInizio ? formatData(meta.schedulazione.dataInizio) : '—'}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="scenario-card-footer">
                <button
                  className="scenario-card-action-btn scenario-card-delete-btn"
                  onClick={() => handleDelete(t.id)}
                  title="Elimina template"
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
