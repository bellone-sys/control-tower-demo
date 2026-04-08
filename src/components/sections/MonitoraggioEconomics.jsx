import { useState, useMemo } from 'react'
import { ECONOMICS_DATA, getEconomicsTrend } from '../../data/monitoraggioMilkrun'
import './MonitoraggioEconomics.css'

export default function MonitoraggioEconomics() {
  const [selectedScenario, setSelectedScenario] = useState(null)

  const costPerPaccoTrend = useMemo(() => getEconomicsTrend('costPerPacco'), [])
  const costPerScenarioTrend = useMemo(() => getEconomicsTrend('costPerScenario'), [])

  const scenari = Object.entries(ECONOMICS_DATA.costPerGiro.perScenario).map(([nome, data]) => ({
    nome,
    ...data
  }))

  return (
    <div className="econ-container">
      {/* KPI Cards */}
      <div className="econ-kpi-row">
        <div className="econ-kpi-card">
          <div className="econ-kpi-value">€{ECONOMICS_DATA.costPerPacco.medio.toFixed(2)}</div>
          <div className="econ-kpi-label">Costo medio per pacco</div>
          <div className="econ-kpi-range">
            Min: €{ECONOMICS_DATA.costPerPacco.minimo} | Max: €{ECONOMICS_DATA.costPerPacco.massimo}
          </div>
        </div>

        <div className="econ-kpi-card">
          <div className="econ-kpi-value">€{ECONOMICS_DATA.costPerGiro.medio.toFixed(2)}</div>
          <div className="econ-kpi-label">Costo medio per giro</div>
          <div className="econ-kpi-range">
            Min: €{ECONOMICS_DATA.costPerGiro.minimo} | Max: €{ECONOMICS_DATA.costPerGiro.massimo}
          </div>
        </div>

        <div className="econ-kpi-card">
          <div className="econ-kpi-value">€{(ECONOMICS_DATA.costPerScenario.totale / 1000).toFixed(1)}k</div>
          <div className="econ-kpi-label">Costo totale scenari</div>
          <div className="econ-kpi-range">{ECONOMICS_DATA.giriAttuali} giri attivi</div>
        </div>

        <div className="econ-kpi-card">
          <div className="econ-kpi-value">{((ECONOMICS_DATA.costPerPacco.trend[5] / ECONOMICS_DATA.costPerPacco.trend[0]) * 100 - 100).toFixed(1)}%</div>
          <div className="econ-kpi-label">Trend 6 mesi</div>
          <div className="econ-kpi-range" style={{ color: '#4CAF50' }}>📉 In diminuzione</div>
        </div>
      </div>

      {/* Trend Costo per Pacco */}
      <div className="econ-section">
        <h3 className="econ-section-title">📈 Trend Costo per Pacco (ultimi 6 mesi)</h3>
        <div className="econ-chart-container">
          <div className="econ-sparkline">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '120px' }}>
              <polyline
                points={costPerPaccoTrend.map((v, i) => `${(i / (costPerPaccoTrend.length - 1)) * 100},${(1 - (v - 0.84) / 0.08) * 40}`).join(' ')}
                stroke="#DC0032"
                strokeWidth="0.5"
                fill="none"
              />
              <polyline
                points={costPerPaccoTrend.map((v, i) => `${(i / (costPerPaccoTrend.length - 1)) * 100},${(1 - (v - 0.84) / 0.08) * 40}`).join(' ')}
                stroke="#DC0032"
                strokeWidth="0"
                fill="url(#grad)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#DC0032" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#DC0032" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="econ-chart-stats">
            {costPerPaccoTrend.map((v, i) => (
              <div key={i} className="econ-stat-item">
                <span>M{i + 1}: €{v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Costo per Scenario */}
      <div className="econ-section">
        <h3 className="econ-section-title">💰 Costo per Scenario</h3>
        <div className="econ-scenario-grid">
          {scenari.map((scenario, idx) => (
            <div
              key={idx}
              className={`econ-scenario-card ${selectedScenario?.nome === scenario.nome ? 'active' : ''}`}
              onClick={() => setSelectedScenario(scenario)}
            >
              <div className="econ-scenario-nome">{scenario.nome}</div>
              <div className="econ-scenario-cost">€{scenario.cost}</div>
              <div className="econ-scenario-details">
                <div>{scenario.pacchi} pacchi</div>
                <div className="econ-cost-pacco">€{scenario.costo_pacco}/pacco</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Costi */}
      <div className="econ-section">
        <h3 className="econ-section-title">📊 Breakdown Costi</h3>
        <div className="econ-breakdown">
          {Object.entries(ECONOMICS_DATA.breakdownCosti).map(([categoria, percentuale]) => (
            <div key={categoria} className="econ-breakdown-item">
              <div className="econ-breakdown-label">{categoria}</div>
              <div className="econ-breakdown-bar">
                <div
                  className="econ-breakdown-fill"
                  style={{ width: `${percentuale * 100}%` }}
                ></div>
              </div>
              <div className="econ-breakdown-percent">{(percentuale * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dettagli Scenario Selezionato */}
      {selectedScenario && (
        <div className="econ-detail-panel">
          <h4>Dettagli: {selectedScenario.nome}</h4>
          <div className="econ-detail-grid">
            <div className="econ-detail-item">
              <span className="econ-detail-label">Costo totale</span>
              <span className="econ-detail-value">€{selectedScenario.cost}</span>
            </div>
            <div className="econ-detail-item">
              <span className="econ-detail-label">Pacchi</span>
              <span className="econ-detail-value">{selectedScenario.pacchi}</span>
            </div>
            <div className="econ-detail-item">
              <span className="econ-detail-label">Costo per pacco</span>
              <span className="econ-detail-value">€{selectedScenario.costo_pacco}</span>
            </div>
            <div className="econ-detail-item">
              <span className="econ-detail-label">Efficienza</span>
              <span className="econ-detail-value" style={{ color: selectedScenario.costo_pacco < 0.89 ? '#4CAF50' : '#FF9800' }}>
                {selectedScenario.costo_pacco < 0.89 ? '✓ Buona' : '⚠ Media'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
