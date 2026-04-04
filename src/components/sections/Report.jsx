import { TREND_SETTIMANALE } from '../../data/stub'
import './Sections.css'

const REPORT_LIST = [
  { nome: 'Report consegne settimanale', tipo: 'Excel', data: '2026-03-31', dimensione: '142 KB' },
  { nome: 'Analisi eccezioni Q1 2026', tipo: 'PDF', data: '2026-03-31', dimensione: '2.3 MB' },
  { nome: 'KPI rete Fermopoint — Marzo 2026', tipo: 'PDF', data: '2026-03-31', dimensione: '890 KB' },
  { nome: 'Performance PUDO', tipo: 'Excel', data: '2026-03-28', dimensione: '312 KB' },
  { nome: 'Dashboard mensile operativo', tipo: 'PDF', data: '2026-02-28', dimensione: '1.1 MB' },
]

const maxConsegnate = Math.max(...TREND_SETTIMANALE.map(d => d.consegnate))
const maxEccezioni = Math.max(...TREND_SETTIMANALE.map(d => d.eccezioni))

export default function Report() {
  return (
    <div className="section-content">

      <div className="report-grid">

        {/* Consegne per giorno */}
        <div className="card">
          <div className="card-header">
            <h3>Consegne settimanali</h3>
            <span className="card-label">Ultimi 7 giorni</span>
          </div>
          <div className="bar-chart">
            {TREND_SETTIMANALE.map(d => (
              <div key={d.giorno} className="bar-col">
                <div className="bar-wrap">
                  <div className="bar" style={{ height: `${(d.consegnate / maxConsegnate) * 100}%` }} />
                </div>
                <span className="bar-label">{d.giorno}</span>
                <span className="bar-value">{d.consegnate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eccezioni per giorno */}
        <div className="card">
          <div className="card-header">
            <h3>Eccezioni per giorno</h3>
            <span className="card-label">Ultimi 7 giorni</span>
          </div>
          <div className="bar-chart">
            {TREND_SETTIMANALE.map(d => (
              <div key={d.giorno} className="bar-col">
                <div className="bar-wrap">
                  <div
                    className="bar bar-red"
                    style={{ height: `${(d.eccezioni / maxEccezioni) * 100}%` }}
                  />
                </div>
                <span className="bar-label">{d.giorno}</span>
                <span className="bar-value">{d.eccezioni}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuzione per stato */}
        <div className="card">
          <div className="card-header">
            <h3>Distribuzione per stato</h3>
            <span className="card-label">Snapshot attuale</span>
          </div>
          <div className="donut-placeholder">
            <div className="donut-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e6e7e8" strokeWidth="14"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#2E7D32" strokeWidth="14"
                  strokeDasharray="90 150" strokeDashoffset="25" strokeLinecap="round"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1565C0" strokeWidth="14"
                  strokeDasharray="45 195" strokeDashoffset="-65" strokeLinecap="round"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F57C00" strokeWidth="14"
                  strokeDasharray="20 220" strokeDashoffset="-110" strokeLinecap="round"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#DC0032" strokeWidth="14"
                  strokeDasharray="15 225" strokeDashoffset="-130" strokeLinecap="round"/>
              </svg>
              <div className="donut-center">
                <span>100%</span>
              </div>
            </div>
            <div className="donut-legend">
              {[
                { label: 'Consegnato', pct: '38%', color: '#2E7D32' },
                { label: 'In custodia', pct: '19%', color: '#1565C0' },
                { label: 'In transito', pct: '8%', color: '#F57C00' },
                { label: 'Eccezioni', pct: '6%', color: '#DC0032' },
              ].map(l => (
                <div key={l.label} className="legend-item">
                  <span className="legend-dot" style={{ background: l.color }} />
                  <span>{l.label}</span>
                  <span className="legend-pct">{l.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Report archivio */}
      <div className="card">
        <div className="card-header">
          <h3>Archivio Report</h3>
          <button className="btn-outline btn-sm">+ Genera nuovo</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome report</th>
                <th>Tipo</th>
                <th>Data generazione</th>
                <th>Dimensione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {REPORT_LIST.map((r, i) => (
                <tr key={i}>
                  <td>{r.nome}</td>
                  <td>
                    <span className="status-badge" style={{
                      color: r.tipo === 'PDF' ? '#DC0032' : '#2E7D32',
                      background: r.tipo === 'PDF' ? '#fff0f3' : '#e8f5e9'
                    }}>
                      {r.tipo}
                    </span>
                  </td>
                  <td className="td-small">{r.data}</td>
                  <td className="td-small">{r.dimensione}</td>
                  <td>
                    <button className="btn-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Scarica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
