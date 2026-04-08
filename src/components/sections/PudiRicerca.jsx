import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { usePudosLoader } from '../../hooks/usePudosLoader'
import './PudiRicerca.css'

export default function PudiRicerca() {
  const { allPudos, loading, error, stats, filteredPudos, searchPudosByTerm, getPudoById } = usePudosLoader()

  // Filtri
  const [selectedSubRegion, setSelectedSubRegion] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [tableLimit, setTableLimit] = useState(50)
  const [tableOffset, setTableOffset] = useState(0)
  const [mapView, setMapView] = useState(true)
  const [selectedPudo, setSelectedPudo] = useState(null)

  // Dati filtrati
  const filteredData = useMemo(() => {
    let data = allPudos || []

    // Filtra per provincia
    if (selectedSubRegion) {
      data = filteredPudos({ subRegion: selectedSubRegion, isActive: true })
    } else {
      data = filteredPudos({ isActive: true })
    }

    // Filtra per ricerca
    if (searchTerm) {
      data = data.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.postalCode.includes(searchTerm)
      )
    }

    return data
  }, [allPudos, selectedSubRegion, searchTerm, filteredPudos])

  // Dati tabella con paginazione
  const tableData = useMemo(() => {
    return {
      total: filteredData.length,
      pudos: filteredData.slice(tableOffset, tableOffset + tableLimit),
      hasMore: tableOffset + tableLimit < filteredData.length,
    }
  }, [filteredData, tableOffset, tableLimit])

  // PUDO visibili sulla mappa (con limit per performance)
  const mapPudos = useMemo(() => {
    return filteredData.slice(0, 500) // Max 500 marker per mappa
  }, [filteredData])

  if (loading) {
    return (
      <div className="pudi-container">
        <div className="pudi-loading">
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--fp-gray-mid)' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Caricamento PUDO in corso...</div>
            <div style={{ fontSize: 12, marginTop: 8, opacity: 0.7 }}>Questo potrebbe richiedere alcuni secondi</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pudi-container">
        <div className="pudi-error">
          <div style={{ textAlign: 'center', padding: '40px', color: '#DC0032' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Errore caricamento PUDO</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>{error.message}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pudi-container">
      {/* Statistiche */}
      <div className="pudi-stats-row">
        <div className="pudi-stat-card">
          <div className="pudi-stat-value">{stats?.total.toLocaleString('it-IT')}</div>
          <div className="pudi-stat-label">PUDO Totali</div>
        </div>
        <div className="pudi-stat-card">
          <div className="pudi-stat-value">{stats?.active.toLocaleString('it-IT')}</div>
          <div className="pudi-stat-label">Attivi</div>
        </div>
        <div className="pudi-stat-card">
          <div className="pudi-stat-value">{stats?.available.toLocaleString('it-IT')}</div>
          <div className="pudi-stat-label">Disponibili</div>
        </div>
        <div className="pudi-stat-card">
          <div className="pudi-stat-value">{stats?.bySubRegion?.length || 0}</div>
          <div className="pudi-stat-label">Province</div>
        </div>
      </div>

      {/* Filtri e Ricerca */}
      <div className="pudi-toolbar">
        <div className="pudi-toolbar-group">
          <label className="pudi-filter-label">Provincia:</label>
          <select
            className="pudi-select"
            value={selectedSubRegion}
            onChange={(e) => {
              setSelectedSubRegion(e.target.value)
              setTableOffset(0)
            }}
          >
            <option value="">Tutte</option>
            {stats?.bySubRegion?.sort().map(sr => (
              <option key={sr} value={sr}>{sr}</option>
            ))}
          </select>
        </div>

        <div className="pudi-toolbar-group">
          <label className="pudi-filter-label">Ricerca:</label>
          <input
            type="text"
            className="pudi-search-input"
            placeholder="Nome, comune, CAP..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setTableOffset(0)
            }}
          />
        </div>

        <div className="pudi-toolbar-group">
          <button
            className={`pudi-view-btn${mapView ? ' active' : ''}`}
            onClick={() => setMapView(true)}
            title="Vista mappa"
          >
            🗺️ Mappa
          </button>
          <button
            className={`pudi-view-btn${!mapView ? ' active' : ''}`}
            onClick={() => setMapView(false)}
            title="Vista tabella"
          >
            📋 Tabella
          </button>
        </div>

        <div className="pudi-toolbar-info">
          {filteredData.length} PUDO
          {searchTerm && ` (ricerca: "${searchTerm}")`}
        </div>
      </div>

      {/* Vista Mappa */}
      {mapView && (
        <div className="pudi-map-container">
          {mapPudos.length > 0 ? (
            <MapContainer
              center={[41.9, 12.5]}
              zoom={6}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapPudos.map(pudo => (
                <CircleMarker
                  key={pudo.id}
                  center={[pudo.latitude, pudo.longitude]}
                  radius={pudo.available ? 6 : 4}
                  pathOptions={{
                    color: pudo.available ? '#4CAF50' : '#FF9800',
                    fillColor: pudo.available ? '#4CAF50' : '#FF9800',
                    fillOpacity: 0.8,
                    weight: 1,
                  }}
                  eventHandlers={{
                    click: () => setSelectedPudo(pudo),
                  }}
                >
                  <Popup>
                    <div style={{ fontSize: 12, maxWidth: 200 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{pudo.name}</div>
                      <div>{pudo.street}</div>
                      <div>{pudo.postalCode} {pudo.municipality}</div>
                      <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
                        {pudo.openingTime} - {pudo.closingTime}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fp-gray-mid)' }}>
              Nessun PUDO trovato per i filtri selezionati
            </div>
          )}
        </div>
      )}

      {/* Vista Tabella */}
      {!mapView && (
        <div className="pudi-table-container">
          {tableData.pudos.length > 0 ? (
            <>
              <table className="pudi-table">
                <thead>
                  <tr>
                    <th>Nome PUDO</th>
                    <th>Indirizzo</th>
                    <th>CAP</th>
                    <th>Comune</th>
                    <th>Provincia</th>
                    <th>Orari</th>
                    <th>Stato</th>
                    <th>Mod.</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.pudos.map(pudo => (
                    <tr key={pudo.id} onClick={() => setSelectedPudo(pudo)} className="pudi-table-row">
                      <td className="pudi-name">
                        <strong>{pudo.name}</strong>
                      </td>
                      <td>{pudo.street}</td>
                      <td style={{ textAlign: 'center' }}>{pudo.postalCode}</td>
                      <td>{pudo.municipality}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{pudo.subRegion}</td>
                      <td style={{ fontSize: 11, opacity: 0.75 }}>
                        {pudo.isClosed ? '🔴 Chiuso' : `${pudo.openingTime} - ${pudo.closingTime}`}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          background: pudo.available ? '#E8F5E9' : '#FFF3E0',
                          color: pudo.available ? '#2E7D32' : '#E65100',
                        }}>
                          {pudo.available ? '✓ OK' : '⊘ N/A'}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, opacity: 0.6 }}>
                        {new Date(pudo.modifiedDate).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginazione */}
              <div className="pudi-pagination">
                <button
                  onClick={() => setTableOffset(Math.max(0, tableOffset - tableLimit))}
                  disabled={tableOffset === 0}
                  className="pudi-btn"
                >
                  ← Precedenti
                </button>
                <span className="pudi-pagination-info">
                  {tableOffset + 1} - {Math.min(tableOffset + tableLimit, tableData.total)} di {tableData.total}
                </span>
                <button
                  onClick={() => setTableOffset(tableOffset + tableLimit)}
                  disabled={!tableData.hasMore}
                  className="pudi-btn"
                >
                  Successivi →
                </button>

                <select
                  value={tableLimit}
                  onChange={(e) => {
                    setTableLimit(Number(e.target.value))
                    setTableOffset(0)
                  }}
                  className="pudi-select-small"
                >
                  <option value={25}>25 per pagina</option>
                  <option value={50}>50 per pagina</option>
                  <option value={100}>100 per pagina</option>
                  <option value={200}>200 per pagina</option>
                </select>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fp-gray-mid)' }}>
              Nessun PUDO trovato per i filtri selezionati
            </div>
          )}
        </div>
      )}

      {/* Detail Panel */}
      {selectedPudo && (
        <div className="pudi-detail-panel">
          <button
            className="pudi-detail-close"
            onClick={() => setSelectedPudo(null)}
            title="Chiudi"
          >
            ✕
          </button>

          <div className="pudi-detail-content">
            <h3>{selectedPudo.name}</h3>

            <div className="pudi-detail-section">
              <h4>📍 Ubicazione</h4>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Indirizzo:</span>
                <span>{selectedPudo.street}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">CAP:</span>
                <span>{selectedPudo.postalCode}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Comune:</span>
                <span>{selectedPudo.municipality}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Provincia:</span>
                <span>{selectedPudo.subRegion}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Coordinate:</span>
                <span>{selectedPudo.latitude.toFixed(5)}, {selectedPudo.longitude.toFixed(5)}</span>
              </div>
            </div>

            <div className="pudi-detail-section">
              <h4>🕐 Orari</h4>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Giorno:</span>
                <span>{selectedPudo.dayOfWeek}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Stato:</span>
                <span>{selectedPudo.isClosed ? '🔴 Chiuso' : '🟢 Aperto'}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Apertura:</span>
                <span>{selectedPudo.openingTime}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Chiusura:</span>
                <span>{selectedPudo.closingTime}</span>
              </div>
            </div>

            <div className="pudi-detail-section">
              <h4>ℹ️ Informazioni</h4>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Attivo:</span>
                <span>{selectedPudo.active ? '✓ Sì' : '✗ No'}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Disponibile:</span>
                <span>{selectedPudo.available ? '✓ Sì' : '✗ No'}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">ID:</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace' }}>{selectedPudo.id}</span>
              </div>
            </div>

            <div className="pudi-detail-section">
              <h4>📝 Cronologia</h4>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Creato:</span>
                <span>{new Date(selectedPudo.createdDate).toLocaleString('it-IT')}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Modificato:</span>
                <span>{new Date(selectedPudo.modifiedDate).toLocaleString('it-IT')}</span>
              </div>
              <div className="pudi-detail-row">
                <span className="pudi-detail-label">Da:</span>
                <span>{selectedPudo.modifiedBy || 'Sistema'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
