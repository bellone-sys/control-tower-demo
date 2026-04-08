import { useState, useMemo, useRef, useEffect } from 'react'
import { FILIALI_BRT } from '../../../../data/filialiBrt'
import { PROVINCE_PER_REGIONE } from '../../../../data/province'
import { useCalculateCIFromShipments } from '../../../../hooks/useCalculateCIFromShipments'
import { enrichFilialeWithCapacity, calculateFilialeScore, rankFilialiByScore, getCapacityScore } from '../../../../utils/filialeScoring'
import './FilialeSmartSuggestion.css'

export default function FilialeSmartSuggestion({ onSelect }) {
  const [selectedProvinces, setSelectedProvinces] = useState([])
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)
  const [provSearch, setProvSearch] = useState('')
  const [weightDistance, setWeightDistance] = useState(0.65)
  const [analyzed, setAnalyzed] = useState(false)
  const provRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (provRef.current && !provRef.current.contains(e.target)) {
        setShowProvinceDropdown(false)
      }
    }
    if (showProvinceDropdown) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showProvinceDropdown])

  const { getPudosByCI, getGeometricCenter, calculateDistance } = useCalculateCIFromShipments()

  // Toggle provincia
  function toggleProv(codice) {
    const next = selectedProvinces.includes(codice)
      ? selectedProvinces.filter(c => c !== codice)
      : [...selectedProvinces, codice]
    setSelectedProvinces(next)
    setAnalyzed(false)
  }

  // Seleziona tutte le province di una regione
  function selectAllInRegion(regionName) {
    const region = PROVINCE_PER_REGIONE.find(r => r.regione === regionName)
    if (region) {
      const provinceCodei = region.province.map(p => p.codice)
      setSelectedProvinces(provinceCodei)
      setProvSearch('')
      setShowProvinceDropdown(false)
      setAnalyzed(false)
    }
  }

  // Filter province dropdown
  const filteredRegioni = PROVINCE_PER_REGIONE.map(r => ({
    ...r,
    province: r.province.filter(p =>
      p.nome.toLowerCase().includes(provSearch.toLowerCase()) ||
      p.codice.toLowerCase().includes(provSearch.toLowerCase())
    ),
  })).filter(r => r.province.length > 0)

  // Filiali arricchite con capacità, filtrate per province selezionate
  const enrichedFilialiInZone = useMemo(() => {
    if (!selectedProvinces.length) return []
    return FILIALI_BRT.filter(f => selectedProvinces.includes(f.provincia)).map(enrichFilialeWithCapacity)
  }, [selectedProvinces])

  // Risultati dell'analisi - considera TUTTI i PUDO della zona selezionata (minCI = 0)
  const results = useMemo(() => {
    if (!analyzed || !selectedProvinces.length) return null

    const pudosByCI = getPudosByCI(0) // Considera TUTTI i PUDO
    if (!pudosByCI.length) return { error: 'Nessun PUDO trovato nella zona' }

    const center = getGeometricCenter(pudosByCI)
    const weightCapacity = 1 - weightDistance

    // Filtra filiali solo per le province selezionate
    const relevantFilialiForZone = enrichedFilialiInZone

    if (!relevantFilialiForZone.length) {
      return { error: 'Nessuna filiale BRT disponibile nella zona selezionata' }
    }

    const scores = relevantFilialiForZone.map(filiale =>
      calculateFilialeScore({
        filiale,
        center,
        maxDistance: 50,
        weightDistance,
        weightCapacity,
        calculateDistance,
        getCapacityScore,
      })
    )

    const ranked = rankFilialiByScore(scores)

    return {
      pudoCount: pudosByCI.length,
      center,
      scores: ranked,
    }
  }, [analyzed, selectedProvinces, weightDistance, getPudosByCI, getGeometricCenter, calculateDistance, enrichedFilialiInZone])

  const handleAnalyze = () => {
    setAnalyzed(true)
  }

  const handleReset = () => {
    setAnalyzed(false)
  }

  const weightCapacity = 1 - weightDistance

  return (
    <div className="fss-container">
      {/* Header */}
      <div className="fss-header">
        <h3 className="fss-title">💡 Suggerimento intelligente</h3>
        <p className="fss-subtitle">Trova la filiale BRT più adatta basata su CI e capacità</p>
      </div>

      {/* Controls */}
      <div className="fss-controls">
        {/* Selezione Zona — OBBLIGATORIA */}
        <div className="fss-zone-section" ref={provRef}>
          <label className="fss-label">
            Zona di ricerca <span style={{ color: 'var(--fp-red)' }}>*</span>
          </label>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="fss-zone-trigger"
              onClick={() => setShowProvinceDropdown(o => !o)}
            >
              <span>
                {selectedProvinces.length === 0
                  ? 'Seleziona province…'
                  : `${selectedProvinces.length} province selezionate`}
              </span>
              <span style={{ fontSize: 10, color: 'var(--fp-gray-mid)' }}>
                {showProvinceDropdown ? '▲' : '▼'}
              </span>
            </button>

            {showProvinceDropdown && (
              <div className="fss-zone-dropdown">
                <div className="fss-zone-search">
                  <input
                    type="text"
                    placeholder="Cerca provincia…"
                    value={provSearch}
                    onChange={e => setProvSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="fss-zone-quick">
                  <button type="button" onClick={() => setSelectedProvinces(PROVINCE_PER_REGIONE.flatMap(r => r.province.map(p => p.codice)))}>
                    Tutte
                  </button>
                  <button type="button" onClick={() => { setSelectedProvinces([]); setAnalyzed(false) }}>
                    Nessuna
                  </button>
                </div>

                <div className="fss-zone-list">
                  {filteredRegioni.map(region => (
                    <div key={region.regione}>
                      <button
                        type="button"
                        className="fss-zone-region-header"
                        onClick={() => selectAllInRegion(region.regione)}
                      >
                        <span>{region.regione}</span>
                        <span className="fss-region-select-all">Seleziona tutte</span>
                      </button>
                      <div className="fss-zone-items">
                        {region.province.map(p => {
                          const isSel = selectedProvinces.includes(p.codice)
                          return (
                            <button
                              key={p.codice}
                              type="button"
                              className={`fss-zone-item${isSel ? ' selected' : ''}`}
                              onClick={() => toggleProv(p.codice)}
                            >
                              <span className="fss-zone-check">{isSel ? '✓' : ' '}</span>
                              <span className="fss-zone-code">{p.codice}</span>
                              <span className="fss-zone-nome">{p.nome}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected province chips */}
          {selectedProvinces.length > 0 && (
            <div className="fss-zone-pills">
              {selectedProvinces.map(cod => (
                <span key={cod} className="fss-prov-chip">
                  {cod}
                  <button onClick={() => toggleProv(cod)} title="Rimuovi">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Weight Sliders */}
        <div className="fss-weight-section">
          <label className="fss-label">Calibrazione fattori:</label>

          {/* Distanza */}
          <div className="fss-weight-item">
            <div className="fss-weight-labels">
              <span className="fss-weight-name">Distanza dai PUDO</span>
              <span className="fss-weight-percent">{Math.round(weightDistance * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={weightDistance}
              onChange={(e) => {
                setWeightDistance(Number(e.target.value))
                setAnalyzed(false)
              }}
              className="fss-slider fss-slider-weight"
              disabled={analyzed}
            />
          </div>

          {/* Capacità */}
          <div className="fss-weight-item">
            <div className="fss-weight-labels">
              <span className="fss-weight-name">Capacità della filiale</span>
              <span className="fss-weight-percent">{Math.round(weightCapacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={weightCapacity}
              onChange={(e) => {
                setWeightDistance(1 - Number(e.target.value))
                setAnalyzed(false)
              }}
              className="fss-slider fss-slider-weight"
              disabled={analyzed}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="fss-button-group">
          {!analyzed ? (
            <button
              className="fss-btn-primary"
              onClick={handleAnalyze}
              disabled={!selectedProvinces.length}
              title={!selectedProvinces.length ? 'Seleziona almeno una provincia' : ''}
            >
              Analizza
            </button>
          ) : (
            <button className="fss-btn-secondary" onClick={handleReset}>
              Modifica parametri
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {analyzed && results && !results.error && (
        <div className="fss-results">
          <div className="fss-results-header">
            <span className="fss-results-title">
              ✓ Analisi completata
            </span>
            <span className="fss-results-info">
              {results.pudoCount} PUDO considerati
            </span>
          </div>

          <div className="fss-results-list">
            {results.scores.slice(0, 5).map((score, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•'

              return (
                <div key={score.filialeId} className={`fss-result-item fss-result-rank-${idx}`}>
                  <div className="fss-result-header">
                    <span className="fss-result-medal">{medal}</span>
                    <div className="fss-result-info">
                      <div className="fss-result-nome">{score.filialeNome}</div>
                      <div className="fss-result-location">
                        {score.filialeCitta} ({score.filialeProvincia})
                      </div>
                    </div>
                    <div className="fss-result-score">{score.finalScore}</div>
                  </div>

                  <div className="fss-result-breakdown">
                    <div className="fss-breakdown-item">
                      <span className="fss-breakdown-label">Distanza</span>
                      <div className="fss-breakdown-bar">
                        <div
                          className="fss-breakdown-fill"
                          style={{ width: `${score.breakdown.distance.score}%` }}
                        />
                      </div>
                      <span className="fss-breakdown-value">
                        {score.breakdown.distance.value} km ({score.breakdown.distance.score} punti)
                      </span>
                    </div>

                    <div className="fss-breakdown-item">
                      <span className="fss-breakdown-label">Capacità</span>
                      <div className="fss-breakdown-bar">
                        <div
                          className="fss-breakdown-fill fss-breakdown-fill--capacity"
                          style={{ width: `${score.breakdown.capacity.score}%` }}
                        />
                      </div>
                      <span className="fss-breakdown-value">
                        {score.breakdown.capacity.value} m² ({score.breakdown.capacity.score} punti)
                      </span>
                    </div>
                  </div>

                  <button
                    className="fss-select-btn"
                    onClick={() => onSelect(score.filialeId)}
                  >
                    Seleziona
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {analyzed && results?.error && (
        <div className="fss-error">
          <span>⚠️ {results.error}</span>
          <p>Prova a ridurre il CI minimo</p>
        </div>
      )}
    </div>
  )
}
