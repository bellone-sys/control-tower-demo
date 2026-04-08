import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Rectangle, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useAnalisiCopertura } from '../../hooks/useAnalisiCopertura'
import { calculateCarenzaIndex, getStatoCobertura } from '../../data/analisiCopertura'
import './AnalisiCoperturaPudo.css'

export default function AnalisiCoperturaPudo() {
  const [stato, setStato] = useState('tutti')
  const [regione, setRegione] = useState(null)
  const [ordinamento, setOrdinamento] = useState('criticita')
  const [selectedProvincia, setSelectedProvincia] = useState(null)

  const { province, statistiche, top10Criticita, regioni } = useAnalisiCopertura({ stato, regione, ordinamento })

  // Funzione per ottenere colore basato su carenza index
  function getColoreStato(statoCobertura) {
    switch (statoCobertura) {
      case 'CARENZA':
        return '#DC0032' // Rosso
      case 'ECCESSO':
        return '#1565C0' // Blu
      default:
        return '#4CAF50' // Verde
    }
  }

  function getColoreMappaIntensita(carenzaIndex) {
    if (carenzaIndex > 1) return '#8B0000' // Rosso scuro
    if (carenzaIndex > 0.5) return '#DC0032' // Rosso
    if (carenzaIndex > 0.2) return '#FF6347' // Arancio-rosso
    if (carenzaIndex < -0.8) return '#1565C0' // Blu scuro
    if (carenzaIndex < -0.5) return '#42A5F5' // Blu
    return '#4CAF50' // Verde
  }

  return (
    <div className="acp-container">
      {/* KPI Cards */}
      <div className="acp-kpi-row">
        <div className="acp-kpi-card">
          <div className="acp-kpi-value" style={{ color: '#DC0032' }}>
            {statistiche.conCarenza}
          </div>
          <div className="acp-kpi-label">Province con CARENZA</div>
        </div>
        <div className="acp-kpi-card">
          <div className="acp-kpi-value" style={{ color: '#1565C0' }}>
            {statistiche.conEccesso}
          </div>
          <div className="acp-kpi-label">Province con ECCESSO</div>
        </div>
        <div className="acp-kpi-card">
          <div className="acp-kpi-value" style={{ color: '#4CAF50' }}>
            {statistiche.conOk}
          </div>
          <div className="acp-kpi-label">Province in EQUILIBRIO</div>
        </div>
        <div className="acp-kpi-card">
          <div className="acp-kpi-value">{statistiche.coberturaNazionale.toFixed(1)}%</div>
          <div className="acp-kpi-label">Cobertura media</div>
        </div>
      </div>

      {/* Mappa di Calore */}
      <div className="acp-mappa-section">
        <h3 className="acp-section-title">🗺️ Mappa Copertura PUDO</h3>
        <MapContainer
          center={[41.8719, 12.5674]}
          zoom={6}
          style={{ width: '100%', height: 500 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {province.map(prov => (
            <Rectangle
              key={prov.id}
              bounds={[
                [prov.lat - 0.3, prov.lng - 0.3],
                [prov.lat + 0.3, prov.lng + 0.3],
              ]}
              pathOptions={{
                color: getColoreMappaIntensita(prov.carenzaIndex),
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0.5,
              }}
              eventHandlers={{
                click: () => setSelectedProvincia(prov),
              }}
            >
              <Popup>
                <div>
                  <strong>{prov.provincia}</strong>
                  <br />
                  Densità: {prov.densitaPopolare} ab/km²
                  <br />
                  Spedizioni: {prov.spedizioni}
                  <br />
                  PUDO: {prov.pudoCount} | Capacità: {prov.pudoCapacita}
                </div>
              </Popup>
            </Rectangle>
          ))}
        </MapContainer>

        {/* Legenda */}
        <div className="acp-legenda">
          <div className="acp-legenda-item">
            <div className="acp-legenda-color" style={{ background: '#8B0000' }}></div>
            <span>Carenza critica</span>
          </div>
          <div className="acp-legenda-item">
            <div className="acp-legenda-color" style={{ background: '#DC0032' }}></div>
            <span>Carenza moderata</span>
          </div>
          <div className="acp-legenda-item">
            <div className="acp-legenda-color" style={{ background: '#4CAF50' }}></div>
            <span>Equilibrio</span>
          </div>
          <div className="acp-legenda-item">
            <div className="acp-legenda-color" style={{ background: '#42A5F5' }}></div>
            <span>Eccesso moderato</span>
          </div>
          <div className="acp-legenda-item">
            <div className="acp-legenda-color" style={{ background: '#1565C0' }}></div>
            <span>Eccesso elevato</span>
          </div>
        </div>
      </div>

      {/* Filtri e Toolbar */}
      <div className="acp-toolbar">
        <div className="acp-filters">
          <div className="acp-filter-group">
            <label>Stato:</label>
            <select value={stato} onChange={e => setStato(e.target.value)}>
              <option value="tutti">Tutti</option>
              <option value="CARENZA">Carenza</option>
              <option value="OK">Equilibrio</option>
              <option value="ECCESSO">Eccesso</option>
            </select>
          </div>

          <div className="acp-filter-group">
            <label>Regione:</label>
            <select value={regione || ''} onChange={e => setRegione(e.target.value || null)}>
              <option value="">Tutte</option>
              {regioni.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="acp-filter-group">
            <label>Ordinamento:</label>
            <select value={ordinamento} onChange={e => setOrdinamento(e.target.value)}>
              <option value="criticita">Per criticità</option>
              <option value="nome">Per provincia</option>
              <option value="spedizioni">Per volume spedizioni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabella Analisi */}
      <div className="acp-tabella-section">
        <h3 className="acp-section-title">📊 Analisi Dettagliata per Provincia</h3>
        <div className="acp-tabella-wrapper">
          <table className="acp-tabella">
            <thead>
              <tr>
                <th>Provincia</th>
                <th>Densità (ab/km²)</th>
                <th>Spedizioni/mese</th>
                <th>PUDO</th>
                <th>Capacità</th>
                <th>Utilizz. %</th>
                <th>Indice</th>
                <th>Stato</th>
                <th>Azione consigliata</th>
              </tr>
            </thead>
            <tbody>
              {province.map(prov => (
                <tr
                  key={prov.id}
                  className={`acp-row acp-stato-${prov.statoCobertura.toLowerCase()}`}
                  onClick={() => setSelectedProvincia(prov)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><strong>{prov.provincia}</strong></td>
                  <td>{prov.densitaPopolare}</td>
                  <td>{prov.spedizioni.toLocaleString()}</td>
                  <td className="acp-text-center">{prov.pudoCount}</td>
                  <td className="acp-text-center">{prov.pudoCapacita}</td>
                  <td className="acp-text-center">
                    <span className={`acp-utilizz ${prov.utilizz > 90 ? 'critico' : prov.utilizz > 70 ? 'buono' : 'moderato'}`}>
                      {prov.utilizz}%
                    </span>
                  </td>
                  <td className="acp-text-center">
                    <span className={`acp-indice ${prov.carenzaIndex > 0 ? 'carenza' : prov.carenzaIndex < -0.3 ? 'eccesso' : 'ok'}`}>
                      {prov.carenzaIndex > 0 ? '+' : ''}{prov.carenzaIndex.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`acp-badge acp-badge-${prov.statoCobertura.toLowerCase()}`}>
                      {prov.statoCobertura === 'CARENZA' ? '🔴' : prov.statoCobertura === 'ECCESSO' ? '🔵' : '🟢'} {prov.statoCobertura}
                    </span>
                  </td>
                  <td>{prov.azione.messaggio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 10 per Criticità */}
      <div className="acp-grafici-section">
        <h3 className="acp-section-title">⚠️ Top 10 Province per Criticità</h3>
        <div className="acp-top10-chart">
          {top10Criticita.map((prov, idx) => (
            <div key={prov.id} className="acp-top10-item">
              <div className="acp-top10-rank">#{idx + 1}</div>
              <div className="acp-top10-info">
                <div className="acp-top10-nome">{prov.provincia}</div>
                <div className="acp-top10-bar">
                  <div
                    className="acp-top10-fill"
                    style={{
                      width: `${Math.min((prov.criticita + 1) * 50, 100)}%`,
                      background: getColoreStato(prov.statoCobertura),
                    }}
                  ></div>
                </div>
              </div>
              <div className="acp-top10-value">{prov.criticita.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel laterale dettagli */}
      {selectedProvincia && (
        <div className="acp-detail-panel">
          <button className="acp-detail-close" onClick={() => setSelectedProvincia(null)}>✕</button>
          <div className="acp-detail-content">
            <h2>{selectedProvincia.provincia}</h2>
            <div className="acp-detail-badge" style={{ borderColor: getColoreStato(selectedProvincia.statoCobertura) }}>
              <span className="acp-detail-stato">{selectedProvincia.statoCobertura}</span>
            </div>

            <div className="acp-detail-grid">
              <div className="acp-detail-item">
                <span className="acp-detail-label">Regione</span>
                <span className="acp-detail-value">{selectedProvincia.regione}</span>
              </div>
              <div className="acp-detail-item">
                <span className="acp-detail-label">Densità popolazione</span>
                <span className="acp-detail-value">{selectedProvincia.densitaPopolare} ab/km²</span>
              </div>
              <div className="acp-detail-item">
                <span className="acp-detail-label">Spedizioni/mese</span>
                <span className="acp-detail-value">{selectedProvincia.spedizioni.toLocaleString()}</span>
              </div>
              <div className="acp-detail-item">
                <span className="acp-detail-label">Growth YoY</span>
                <span className="acp-detail-value" style={{ color: selectedProvincia.growth > 0 ? '#4CAF50' : '#DC0032' }}>
                  {selectedProvincia.growth > 0 ? '+' : ''}{selectedProvincia.growth}%
                </span>
              </div>
            </div>

            <div className="acp-detail-section">
              <h4>PUDO Attuali</h4>
              <div className="acp-detail-pudo">
                <div>Totale: <strong>{selectedProvincia.pudoCount}</strong></div>
                <div>Ritiro: <strong>{selectedProvincia.pudoRitiro}</strong></div>
                <div>Locker: <strong>{selectedProvincia.pudoLocker}</strong></div>
                <div>Capacità totale: <strong>{selectedProvincia.pudoCapacita} pacchi/giorno</strong></div>
              </div>
            </div>

            <div className="acp-detail-section">
              <h4>Analisi Performance</h4>
              <div className="acp-detail-performance">
                <div className="acp-detail-metric">
                  <span>Utilization Rate</span>
                  <span className={`acp-metric-value ${selectedProvincia.utilizz > 90 ? 'critico' : selectedProvincia.utilizz > 70 ? 'buono' : 'moderato'}`}>
                    {selectedProvincia.utilizz}%
                  </span>
                </div>
                <div className="acp-detail-metric">
                  <span>Indice Carenza</span>
                  <span className={`acp-metric-value ${selectedProvincia.carenzaIndex > 0 ? 'carenza' : selectedProvincia.carenzaIndex < -0.3 ? 'eccesso' : 'ok'}`}>
                    {selectedProvincia.carenzaIndex > 0 ? '+' : ''}{selectedProvincia.carenzaIndex.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="acp-detail-azione">
              <h4>⚡ Raccomandazione</h4>
              <div className={`acp-azione-box acp-azione-${selectedProvincia.azione.tipo.toLowerCase()}`}>
                <strong>{selectedProvincia.azione.messaggio}</strong>
              </div>
              <button className="acp-btn-azione">Crea brief intervento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
