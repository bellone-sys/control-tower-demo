import { useState, useMemo } from 'react'
import { PERFORMANCE_DATA } from '../../data/monitoraggioMilkrun'
import './MonitoraggioPerformance.css'

export default function MonitoraggioPerformance() {
  const [selectedMetric, setSelectedMetric] = useState('pacchi')

  // Find min/max for normalization
  const getMinMax = (data, key) => {
    const values = data.map(d => d[key])
    return { min: Math.min(...values), max: Math.max(...values) }
  }

  const periodi = useMemo(() => PERFORMANCE_DATA.periodiStorici, [])
  const settimane = useMemo(() => PERFORMANCE_DATA.andamentiSettimanali, [])
  const dettagli = useMemo(() => PERFORMANCE_DATA.dettagliGiri, [])

  const giriRange = useMemo(() => getMinMax(periodi, 'giri'), [])
  const pacchiRange = useMemo(() => getMinMax(periodi, 'pacchi'), [])
  const costoRange = useMemo(() => getMinMax(periodi, 'costo'), [])
  const puntualitaRange = useMemo(() => getMinMax(periodi, 'puntualita'), [])

  const normalize = (value, min, max) => ((value - min) / (max - min)) * 100

  const getTrendColor = (value) => {
    if (value > 0.9) return '#4CAF50'
    if (value > 0.85) return '#8BC34A'
    if (value > 0.75) return '#FFC107'
    return '#DC0032'
  }

  return (
    <div className="pf-container">
      {/* KPI Cards */}
      <div className="pf-kpi-row">
        <div className="pf-kpi-card">
          <div className="pf-kpi-value">{periodi[periodi.length - 1].giri}</div>
          <div className="pf-kpi-label">Giri Attivi</div>
          <div className="pf-kpi-trend" style={{ color: '#4CAF50' }}>
            📈 +{periodi[periodi.length - 1].giri - periodi[0].giri} dal periodo iniziale
          </div>
        </div>

        <div className="pf-kpi-card">
          <div className="pf-kpi-value">{periodi[periodi.length - 1].pacchi}</div>
          <div className="pf-kpi-label">Pacchi Consegnati</div>
          <div className="pf-kpi-trend">
            {periodi[periodi.length - 1].pacchi > periodi[periodi.length - 2].pacchi ? '📈' : '📉'}
            {' '}+{periodi[periodi.length - 1].pacchi - periodi[periodi.length - 2].pacchi} vs precedente
          </div>
        </div>

        <div className="pf-kpi-card">
          <div className="pf-kpi-value">€{periodi[periodi.length - 1].costo}</div>
          <div className="pf-kpi-label">Costo Totale</div>
          <div className="pf-kpi-trend" style={{ color: periodi[periodi.length - 1].costo < periodi[0].costo ? '#4CAF50' : '#DC0032' }}>
            {periodi[periodi.length - 1].costo < periodi[0].costo ? '📉' : '📈'}
            {' '}€{Math.abs(periodi[periodi.length - 1].costo - periodi[0].costo)}
          </div>
        </div>

        <div className="pf-kpi-card">
          <div className="pf-kpi-value">{(periodi[periodi.length - 1].puntualita * 100).toFixed(1)}%</div>
          <div className="pf-kpi-label">Puntualità Media</div>
          <div className="pf-kpi-trend" style={{ color: getTrendColor(periodi[periodi.length - 1].puntualita) }}>
            Trend {periodi[periodi.length - 1].puntualita > periodi[periodi.length - 2]?.puntualita ? '📈' : '📉'} positivo
          </div>
        </div>
      </div>

      {/* Trend Historici */}
      <div className="pf-section">
        <h3 className="pf-section-title">📊 Trend Storici (Mensili)</h3>
        <div className="pf-chart-container">
          {/* Giri Trend */}
          <div className="pf-metric-chart">
            <div className="pf-metric-title">Giri</div>
            <svg viewBox="0 0 400 150" preserveAspectRatio="none" style={{ width: '100%', height: 120 }}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={`grid-${y}`} x1="0" y1={150 - (y / 100) * 150} x2="400" y2={150 - (y / 100) * 150} stroke="#f0f0f0" strokeWidth="1" />
              ))}
              {/* Line chart */}
              <polyline
                points={periodi.map((p, i) => `${(i / (periodi.length - 1)) * 400},${150 - normalize(p.giri, giriRange.min, giriRange.max)}`).join(' ')}
                stroke="#1565C0"
                strokeWidth="2"
                fill="none"
              />
              {/* Points */}
              {periodi.map((p, i) => (
                <circle key={i} cx={(i / (periodi.length - 1)) * 400} cy={150 - normalize(p.giri, giriRange.min, giriRange.max)} r="3" fill="#1565C0" />
              ))}
            </svg>
            <div className="pf-metric-stats">
              <span>Min: {giriRange.min}</span>
              <span>Max: {giriRange.max}</span>
            </div>
          </div>

          {/* Pacchi Trend */}
          <div className="pf-metric-chart">
            <div className="pf-metric-title">Pacchi Consegnati</div>
            <svg viewBox="0 0 400 150" preserveAspectRatio="none" style={{ width: '100%', height: 120 }}>
              <polyline
                points={periodi.map((p, i) => `${(i / (periodi.length - 1)) * 400},${150 - normalize(p.pacchi, pacchiRange.min, pacchiRange.max)}`).join(' ')}
                stroke="#4CAF50"
                strokeWidth="2"
                fill="none"
              />
              {periodi.map((p, i) => (
                <circle key={i} cx={(i / (periodi.length - 1)) * 400} cy={150 - normalize(p.pacchi, pacchiRange.min, pacchiRange.max)} r="3" fill="#4CAF50" />
              ))}
            </svg>
            <div className="pf-metric-stats">
              <span>Min: {pacchiRange.min}</span>
              <span>Max: {pacchiRange.max}</span>
            </div>
          </div>

          {/* Costo Trend */}
          <div className="pf-metric-chart">
            <div className="pf-metric-title">Costo Totale</div>
            <svg viewBox="0 0 400 150" preserveAspectRatio="none" style={{ width: '100%', height: 120 }}>
              <polyline
                points={periodi.map((p, i) => `${(i / (periodi.length - 1)) * 400},${150 - normalize(p.costo, costoRange.min, costoRange.max)}`).join(' ')}
                stroke="#DC0032"
                strokeWidth="2"
                fill="none"
              />
              {periodi.map((p, i) => (
                <circle key={i} cx={(i / (periodi.length - 1)) * 400} cy={150 - normalize(p.costo, costoRange.min, costoRange.max)} r="3" fill="#DC0032" />
              ))}
            </svg>
            <div className="pf-metric-stats">
              <span>Min: €{costoRange.min}</span>
              <span>Max: €{costoRange.max}</span>
            </div>
          </div>

          {/* Puntualità Trend */}
          <div className="pf-metric-chart">
            <div className="pf-metric-title">Puntualità Media</div>
            <svg viewBox="0 0 400 150" preserveAspectRatio="none" style={{ width: '100%', height: 120 }}>
              <polyline
                points={periodi.map((p, i) => `${(i / (periodi.length - 1)) * 400},${150 - normalize(p.puntualita, puntualitaRange.min, puntualitaRange.max)}`).join(' ')}
                stroke="#FF9800"
                strokeWidth="2"
                fill="none"
              />
              {periodi.map((p, i) => (
                <circle key={i} cx={(i / (periodi.length - 1)) * 400} cy={150 - normalize(p.puntualita, puntualitaRange.min, puntualitaRange.max)} r="3" fill="#FF9800" />
              ))}
            </svg>
            <div className="pf-metric-stats">
              <span>Min: {(puntualitaRange.min * 100).toFixed(1)}%</span>
              <span>Max: {(puntualitaRange.max * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Settimanali */}
      <div className="pf-section">
        <h3 className="pf-section-title">📅 Andamenti Settimanali</h3>
        <div className="pf-weekly-grid">
          {settimane.map((sett, idx) => (
            <div key={idx} className="pf-weekly-card">
              <div className="pf-weekly-title">{sett.settimana}</div>
              <div className="pf-weekly-metrics">
                <div className="pf-weekly-item">
                  <span className="pf-label">Giri</span>
                  <span className="pf-value">{sett.giri}</span>
                </div>
                <div className="pf-weekly-item">
                  <span className="pf-label">Pacchi</span>
                  <span className="pf-value">{sett.pacchi}</span>
                </div>
                <div className="pf-weekly-item">
                  <span className="pf-label">Costo</span>
                  <span className="pf-value">€{sett.costo}</span>
                </div>
                <div className="pf-weekly-item">
                  <span className="pf-label">Puntualità</span>
                  <span className="pf-value" style={{ color: getTrendColor(sett.puntualita) }}>
                    {(sett.puntualita * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="pf-weekly-item">
                  <span className="pf-label">PUDO Success</span>
                  <span className="pf-value" style={{ color: getTrendColor(sett.pudoSuccess) }}>
                    {(sett.pudoSuccess * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dettagli Giri */}
      <div className="pf-section">
        <h3 className="pf-section-title">🎯 Dettagli Giri per Scenario</h3>
        <div className="pf-tabella-wrapper">
          <table className="pf-tabella">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Data</th>
                <th>Giri</th>
                <th>Pacchi</th>
                <th>Costo</th>
                <th>€/Pacco</th>
                <th>Puntualità Inizio</th>
                <th>Puntualità Fine</th>
                <th>PUDO Visitati</th>
                <th>Success</th>
                <th>Rigettati</th>
                <th>Pacchi Lasciati</th>
                <th>Tempo Medio</th>
              </tr>
            </thead>
            <tbody>
              {dettagli.map((giro) => (
                <tr key={giro.id}>
                  <td><strong>{giro.scenario}</strong></td>
                  <td>{giro.data}</td>
                  <td className="pf-text-center">{giro.giri}</td>
                  <td className="pf-text-center">{giro.pacchi}</td>
                  <td className="pf-text-center">€{giro.costo}</td>
                  <td className="pf-text-center">€{giro.costPacco.toFixed(2)}</td>
                  <td className="pf-text-center">
                    <span style={{ color: getTrendColor(giro.puntualitaInizio) }}>
                      {(giro.puntualitaInizio * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="pf-text-center">
                    <span style={{ color: getTrendColor(giro.puntualitaFine) }}>
                      {(giro.puntualitaFine * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="pf-text-center">{giro.pudoVisitati}</td>
                  <td className="pf-text-center">
                    <span style={{ color: '#4CAF50', fontWeight: 600 }}>{giro.pudoSuccess}</span>
                  </td>
                  <td className="pf-text-center">
                    <span style={{ color: '#DC0032', fontWeight: 600 }}>{giro.pudoRigettati}</span>
                  </td>
                  <td className="pf-text-center">{giro.pacchiLasciati}</td>
                  <td className="pf-text-center">{giro.tempoMedio.toFixed(1)}min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
