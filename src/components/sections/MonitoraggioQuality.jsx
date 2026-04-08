import { useState, useMemo } from 'react'
import { QUALITY_DATA } from '../../data/monitoraggioMilkrun'
import './MonitoraggioQuality.css'

export default function MonitoraggioQuality() {
  const [selectedMetric, setSelectedMetric] = useState(null)

  const qualityScore = useMemo(() => {
    const { puntualita, pudoMetriche } = QUALITY_DATA
    const avgPuntualita = (
      puntualita.partenzaFiliale.inOrario +
      puntualita.arrivoFiliale.inOrario +
      puntualita.arrivoPudo.inOrario
    ) / 3
    const pudoSuccessRate = pudoMetriche.completatiSuccesso / pudoMetriche.totaleVisitati
    return {
      puntualitaMedia: avgPuntualita,
      pudoSuccessRate: pudoSuccessRate,
      score: (avgPuntualita * 0.4 + pudoSuccessRate * 0.6) * 5,
    }
  }, [])

  const pudoRejectionRate = useMemo(() => {
    const { pudoMetriche } = QUALITY_DATA
    return {
      tempo: (pudoMetriche.rigettatiTempo / pudoMetriche.totaleVisitati) * 100,
      altro: (pudoMetriche.rigettatiAltro / pudoMetriche.totaleVisitati) * 100,
    }
  }, [])

  return (
    <div className="qa-container">
      {/* KPI Cards */}
      <div className="qa-kpi-row">
        <div className="qa-kpi-card">
          <div className="qa-gauge">
            <svg viewBox="0 0 100 60" style={{ width: '100%', height: 80 }}>
              {/* Background arc */}
              <path d="M 20 50 A 30 30 0 0 1 80 50" stroke="#E0E0E0" strokeWidth="6" fill="none" />
              {/* Filled arc - based on quality score */}
              <path
                d={`M 20 50 A 30 30 0 0 1 ${20 + (qualityScore.score / 5) * 60} 50`}
                stroke="#4CAF50"
                strokeWidth="6"
                fill="none"
              />
              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2={50 + Math.cos((qualityScore.score / 5) * Math.PI - Math.PI) * 25}
                y2={50 + Math.sin((qualityScore.score / 5) * Math.PI - Math.PI) * 25}
                stroke="#333"
                strokeWidth="2"
              />
              <circle cx="50" cy="50" r="3" fill="#333" />
            </svg>
          </div>
          <div className="qa-kpi-value">{qualityScore.score.toFixed(1)}/5</div>
          <div className="qa-kpi-label">Quality Score Globale</div>
        </div>

        <div className="qa-kpi-card">
          <div className="qa-kpi-value">{(qualityScore.puntualitaMedia * 100).toFixed(1)}%</div>
          <div className="qa-kpi-label">Puntualità Media</div>
          <div className="qa-kpi-range">Partenza, Arrivo Filiale, Arrivo PUDO</div>
        </div>

        <div className="qa-kpi-card">
          <div className="qa-kpi-value">{(qualityScore.pudoSuccessRate * 100).toFixed(1)}%</div>
          <div className="qa-kpi-label">PUDO Success Rate</div>
          <div className="qa-kpi-range">{QUALITY_DATA.pudoMetriche.completatiSuccesso}/{QUALITY_DATA.pudoMetriche.totaleVisitati}</div>
        </div>

        <div className="qa-kpi-card">
          <div className="qa-kpi-value">{QUALITY_DATA.scoreSoddisfazione}/5</div>
          <div className="qa-kpi-label">Soddisfazione Clienti</div>
          <div className="qa-kpi-range">{QUALITY_DATA.reclami} reclami ({QUALITY_DATA.recdamiPerMille}‰)</div>
        </div>
      </div>

      {/* Puntualità Section */}
      <div className="qa-section">
        <h3 className="qa-section-title">⏱️ Analisi Puntualità</h3>
        <div className="qa-puntualita-grid">
          {Object.entries(QUALITY_DATA.puntualita).map(([fase, metrics]) => {
            const faseLabel = fase === 'partenzaFiliale' ? 'Partenza Filiale'
                            : fase === 'arrivoFiliale' ? 'Arrivo Filiale'
                            : 'Arrivo PUDO'
            return (
              <div key={fase} className="qa-puntualita-card">
                <div className="qa-puntualita-title">{faseLabel}</div>
                <div className="qa-puntualita-metrics">
                  <div className="qa-puntualita-item">
                    <span className="qa-label">In Orario</span>
                    <span className="qa-value" style={{ color: '#4CAF50' }}>{(metrics.inOrario * 100).toFixed(1)}%</span>
                  </div>
                  <div className="qa-puntualita-item">
                    <span className="qa-label">Ritardo</span>
                    <span className="qa-value" style={{ color: '#DC0032' }}>{(metrics.ritardo * 100).toFixed(1)}%</span>
                  </div>
                  <div className="qa-puntualita-item">
                    <span className="qa-label">Anticipo</span>
                    <span className="qa-value" style={{ color: '#1565C0' }}>{(metrics.anticipo * 100).toFixed(1)}%</span>
                  </div>
                  <div className="qa-puntualita-item qa-ritardo-medio">
                    <span className="qa-label">Ritardo Medio</span>
                    <span className="qa-value">{metrics.ritardoMedio}min</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* PUDO Metrics */}
      <div className="qa-section">
        <h3 className="qa-section-title">📦 Metriche PUDO</h3>
        <div className="qa-pudo-grid">
          <div className="qa-pudo-metric">
            <div className="qa-metric-label">Totale Visitati</div>
            <div className="qa-metric-value">{QUALITY_DATA.pudoMetriche.totaleVisitati}</div>
          </div>
          <div className="qa-pudo-metric">
            <div className="qa-metric-label">Completati con Successo</div>
            <div className="qa-metric-value" style={{ color: '#4CAF50' }}>
              {QUALITY_DATA.pudoMetriche.completatiSuccesso}
              <span className="qa-metric-percent">
                ({(QUALITY_DATA.pudoMetriche.completatiSuccesso / QUALITY_DATA.pudoMetriche.totaleVisitati * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="qa-pudo-metric">
            <div className="qa-metric-label">Rigettati per Mancanza Tempo</div>
            <div className="qa-metric-value" style={{ color: '#DC0032' }}>
              {QUALITY_DATA.pudoMetriche.rigettatiTempo}
              <span className="qa-metric-percent">
                ({pudoRejectionRate.tempo.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="qa-pudo-metric">
            <div className="qa-metric-label">Rigettati per Altro Motivo</div>
            <div className="qa-metric-value" style={{ color: '#FF9800' }}>
              {QUALITY_DATA.pudoMetriche.rigettatiAltro}
              <span className="qa-metric-percent">
                ({pudoRejectionRate.altro.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="qa-pudo-metric">
            <div className="qa-metric-label">PUDO medio per Giro</div>
            <div className="qa-metric-value">
              {QUALITY_DATA.pudoMetriche.pudoPerGiro.medio.toFixed(1)}
              <span className="qa-metric-range">
                ({QUALITY_DATA.pudoMetriche.pudoPerGiro.minimo}–{QUALITY_DATA.pudoMetriche.pudoPerGiro.massimo})
              </span>
            </div>
          </div>
        </div>

        {/* PUDO Rejection Breakdown */}
        <div className="qa-rejection-chart">
          <div className="qa-rejection-item">
            <div className="qa-rejection-label">Mancanza Tempo</div>
            <div className="qa-rejection-bar">
              <div
                className="qa-rejection-fill"
                style={{
                  width: `${pudoRejectionRate.tempo}%`,
                  background: '#DC0032'
                }}
              />
            </div>
            <div className="qa-rejection-value">{pudoRejectionRate.tempo.toFixed(1)}%</div>
          </div>
          <div className="qa-rejection-item">
            <div className="qa-rejection-label">Altro Motivo</div>
            <div className="qa-rejection-bar">
              <div
                className="qa-rejection-fill"
                style={{
                  width: `${pudoRejectionRate.altro}%`,
                  background: '#FF9800'
                }}
              />
            </div>
            <div className="qa-rejection-value">{pudoRejectionRate.altro.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Pacchi Metrics */}
      <div className="qa-section">
        <h3 className="qa-section-title">📬 Metriche Pacchi</h3>
        <div className="qa-pacchi-table">
          <table>
            <tbody>
              <tr>
                <td className="qa-label">Totale Consegnati</td>
                <td className="qa-value-main">{QUALITY_DATA.pacchiMetriche.totaleConsegnati}</td>
              </tr>
              <tr>
                <td className="qa-label">Lasciati in Filiale</td>
                <td className="qa-value" style={{ color: '#FF9800' }}>
                  {QUALITY_DATA.pacchiMetriche.lasciatInFiliale}
                  <span className="qa-percent">
                    ({(QUALITY_DATA.pacchiMetriche.lasciatInFiliale / QUALITY_DATA.pacchiMetriche.totaleConsegnati * 100).toFixed(2)}%)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="qa-label">Mancata Consegna</td>
                <td className="qa-value" style={{ color: '#DC0032' }}>
                  {QUALITY_DATA.pacchiMetriche.noConsegna}
                  <span className="qa-percent">
                    ({(QUALITY_DATA.pacchiMetriche.noConsegna / QUALITY_DATA.pacchiMetriche.totaleConsegnati * 100).toFixed(2)}%)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="qa-label">Danneggiati</td>
                <td className="qa-value" style={{ color: '#DC0032' }}>
                  {QUALITY_DATA.pacchiMetriche.danneggiati}
                  <span className="qa-percent">
                    ({(QUALITY_DATA.pacchiMetriche.danneggiati / QUALITY_DATA.pacchiMetriche.totaleConsegnati * 100).toFixed(2)}%)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tempo Servizio */}
        <div className="qa-tempo-servizio">
          <h4>Tempo Servizio Medio</h4>
          <div className="qa-tempo-metrics">
            <div className="qa-tempo-item">
              <span className="qa-label">Per PUDO</span>
              <span className="qa-value">{QUALITY_DATA.pacchiMetriche.tempoServizioMedio.perPudo}min</span>
            </div>
            <div className="qa-tempo-item">
              <span className="qa-label">Minimo</span>
              <span className="qa-value">{QUALITY_DATA.pacchiMetriche.tempoServizioMedio.min}min</span>
            </div>
            <div className="qa-tempo-item">
              <span className="qa-label">Massimo</span>
              <span className="qa-value">{QUALITY_DATA.pacchiMetriche.tempoServizioMedio.max}min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
