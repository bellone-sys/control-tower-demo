import { PUNTI_RITIRO } from '../../data/stub'
import './Sections.css'

const STATO_CFG = {
  'Attivo':       { color: '#2E7D32', bg: '#e8f5e9' },
  'Pieno':        { color: '#F57C00', bg: '#fff3e0' },
  'Manutenzione': { color: '#DC0032', bg: '#fff0f3' },
}

export default function PuntiRitiro() {
  const attivi = PUNTI_RITIRO.filter(p => p.stato === 'Attivo').length
  const pieni = PUNTI_RITIRO.filter(p => p.stato === 'Pieno').length
  const manutenzione = PUNTI_RITIRO.filter(p => p.stato === 'Manutenzione').length

  return (
    <div className="section-content">

      {/* Summary mini-KPI */}
      <div className="mini-kpi-row">
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#2E7D32' }}>{attivi}</span>
          <span className="mini-kpi-label">Attivi</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#F57C00' }}>{pieni}</span>
          <span className="mini-kpi-label">Pieni</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val" style={{ color: '#DC0032' }}>{manutenzione}</span>
          <span className="mini-kpi-label">Manutenzione</span>
        </div>
        <div className="mini-kpi">
          <span className="mini-kpi-val">{PUNTI_RITIRO.length}</span>
          <span className="mini-kpi-label">Totale (campione)</span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="card map-placeholder">
        <div className="map-inner">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A4A3A4" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p>Mappa interattiva dei Punti Ritiro</p>
          <span>Integrazione Google Maps / Leaflet disponibile in produzione</span>
          <div className="map-pins">
            {PUNTI_RITIRO.map(p => (
              <div key={p.id} className={`map-pin pin-${p.stato.toLowerCase().replace(' ','-')}`} title={`${p.nome} — ${p.stato}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-header">
          <h3>Elenco Punti Ritiro</h3>
          <span className="card-label">{PUNTI_RITIRO.length} punti</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Comune</th>
                <th>Indirizzo</th>
                <th>Tipo</th>
                <th>Occupazione</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {PUNTI_RITIRO.map(p => {
                const cfg = STATO_CFG[p.stato] || {}
                const pct = Math.round((p.occupazione / p.capienza) * 100)
                return (
                  <tr key={p.id}>
                    <td><code className="id-code">{p.id}</code></td>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.comune}</td>
                    <td className="td-small">{p.indirizzo}</td>
                    <td>{p.tipo}</td>
                    <td>
                      <div className="occupazione-wrap">
                        <div className="occupazione-bar">
                          <div
                            className="occupazione-fill"
                            style={{
                              width: `${pct}%`,
                              background: pct >= 100 ? '#DC0032' : pct >= 70 ? '#F57C00' : '#2E7D32'
                            }}
                          />
                        </div>
                        <span className="td-small">{p.occupazione}/{p.capienza}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                        {p.stato}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
