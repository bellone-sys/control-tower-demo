import { ECCEZIONI } from '../../data/stub'
import './Sections.css'

const GRAVITA_CFG = {
  'alta':  { color: '#DC0032', bg: '#fff0f3', label: 'Alta' },
  'media': { color: '#F57C00', bg: '#fff3e0', label: 'Media' },
  'bassa': { color: '#1565C0', bg: '#e3f0fb', label: 'Bassa' },
}

const STATO_CFG = {
  'Aperta':       { color: '#DC0032', bg: '#fff0f3' },
  'In gestione':  { color: '#F57C00', bg: '#fff3e0' },
  'Monitoraggio': { color: '#1565C0', bg: '#e3f0fb' },
  'Chiusa':       { color: '#2E7D32', bg: '#e8f5e9' },
}

export default function Eccezioni() {
  const aperte = ECCEZIONI.filter(e => e.stato === 'Aperta').length
  const gestione = ECCEZIONI.filter(e => e.stato === 'In gestione').length
  const monitor = ECCEZIONI.filter(e => e.stato === 'Monitoraggio').length

  return (
    <div className="section-content">
      <div className="mini-kpi-row">
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#DC0032' }}>{aperte}</span>
          <span className="mini-kpi-label">Aperte</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#F57C00' }}>{gestione}</span>
          <span className="mini-kpi-label">In gestione</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#1565C0' }}>{monitor}</span>
          <span className="mini-kpi-label">Monitoraggio</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val">{ECCEZIONI.length}</span>
          <span className="mini-kpi-label">Totale</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Eccezioni attive</h3>
          <span className="card-label">{ECCEZIONI.length} eccezioni</span>
        </div>
        <div className="exceptions-list">
          {ECCEZIONI.map(e => {
            const gcfg = GRAVITA_CFG[e.gravita] || {}
            const scfg = STATO_CFG[e.stato] || {}
            return (
              <div key={e.id} className="exception-row">
                <div className="exception-gravita" style={{ background: gcfg.bg, color: gcfg.color }}>
                  {gcfg.label}
                </div>
                <div className="exception-body">
                  <div className="exception-top">
                    <span className="exception-tipo">{e.tipo}</span>
                    <code className="id-code">{e.spedizioneId}</code>
                    <span className="exception-comune">📍 {e.comune}</span>
                  </div>
                  <p className="exception-desc">{e.descrizione}</p>
                  <div className="exception-meta">
                    <span>Assegnato a: <strong>{e.assegnato}</strong></span>
                    <span className="exception-data">{e.data}</span>
                  </div>
                </div>
                <div className="exception-stato">
                  <span className="status-badge" style={{ color: scfg.color, background: scfg.bg }}>
                    {e.stato}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
