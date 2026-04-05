import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { FILIALI } from '../../../../data/filiali'
import { FILIALI_BRT } from '../../../../data/brtFiliali'
import { PROVINCE_PER_REGIONE } from '../../../../data/province'
import { getCiPudo } from '../../../../data/spedizioni'
import pudosRoma from '../../../../data/pudosRoma.json'
import TutorialOverlay from '../../../tutorials/TutorialOverlay'
import 'leaflet/dist/leaflet.css'

const PERIODI = [
  { val: 7,  label: '7gg' },
  { val: 14, label: '14gg' },
  { val: 30, label: '1 mese' },
  { val: 60, label: '2 mesi' },
]

function ciColor(ci) {
  if (ci >= 4)   return '#2E7D32'
  if (ci >= 2.5) return '#E65100'
  if (ci > 0)    return '#1565C0'
  return '#9E9E9E'
}

// BRT selection modal
function BrtModal({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [sel, setSel] = useState(null)

  const filtered = FILIALI_BRT.filter(f =>
    f.nome.toLowerCase().includes(search.toLowerCase()) ||
    f.citta.toLowerCase().includes(search.toLowerCase()) ||
    f.provincia.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="brt-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="brt-modal-box">
        <div className="brt-modal-header">
          <span className="brt-modal-title">Filiali BRT — Seleziona deposito</span>
          <button className="modal-close" onClick={onClose} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fp-gray-mid)' }}>×</button>
        </div>

        <div className="brt-modal-search">
          <input
            type="text"
            placeholder="Cerca per nome, città, provincia…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="brt-modal-list">
          {filtered.map(f => (
            <div
              key={f.id}
              className={`brt-item${sel?.id === f.id ? ' selected' : ''}`}
              onClick={() => setSel(f)}
            >
              <div className="brt-item-badge">BRT</div>
              <div>
                <div className="brt-item-nome">{f.nome}</div>
                <div className="brt-item-prov">{f.citta} ({f.provincia}) · {f.cap}</div>
              </div>
              {sel?.id === f.id && (
                <span style={{ marginLeft: 'auto', color: '#1565C0', fontWeight: 700, fontSize: 18 }}>✓</span>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--fp-gray-mid)', fontSize: 13 }}>
              Nessuna filiale trovata
            </div>
          )}
        </div>

        <div className="brt-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annulla</button>
          <button
            className="btn-primary"
            disabled={!sel}
            onClick={() => sel && onSelect(sel)}
          >
            Seleziona
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WizardStep1({ data, onChange }) {
  const [showBrt, setShowBrt] = useState(false)
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)
  const [provSearch, setProvSearch] = useState('')
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

  const allFilialiCombo = [
    ...FILIALI.map(f => ({ ...f, tipo: 'fp' })),
    ...(data.extraFiliali || []).map(f => ({ ...f, tipo: 'brt' })),
  ]

  const selectedFiliale = allFilialiCombo.find(f => f.id === data.filialeId) || null

  // Filter province dropdown
  const filteredRegioni = PROVINCE_PER_REGIONE.map(r => ({
    ...r,
    province: r.province.filter(p =>
      p.nome.toLowerCase().includes(provSearch.toLowerCase()) ||
      p.codice.toLowerCase().includes(provSearch.toLowerCase())
    ),
  })).filter(r => r.province.length > 0)

  function toggleProv(codice) {
    const next = data.province.includes(codice)
      ? data.province.filter(c => c !== codice)
      : [...data.province, codice]
    onChange({ province: next })
  }

  function handleBrtSelect(brtFiliale) {
    const extraFiliali = [...(data.extraFiliali || []), brtFiliale]
    onChange({ extraFiliali, filialeId: brtFiliale.id })
    setShowBrt(false)
  }

  // Compute PUDO positions for map (only PUDOs with CI > 0 get labeled marker, others get dot)
  const pudosWithCi = pudosRoma
    .map(p => ({ ...p, ci: getCiPudo(p.id, data.periodoGg) }))
    .filter(p => p.ci > 0)

  // Map center: filiale or Rome default
  const mapCenter = selectedFiliale
    ? [selectedFiliale.lat, selectedFiliale.lng]
    : [41.9028, 12.4964]

  const mapBounds = selectedFiliale
    ? [[selectedFiliale.lat - 0.3, selectedFiliale.lng - 0.3], [selectedFiliale.lat + 0.3, selectedFiliale.lng + 0.3]]
    : [[41.5, 12.0], [42.2, 13.2]]

  return (
    <div className="wizard-step-layout">
      <TutorialOverlay
        id="scenario_wizard_step1"
        title="📍 Step 1: Area e Filiale"
        description="Seleziona le province di interesse, scegli una filiale (Fermopoint o BRT), e configura il periodo CI. La mappa visualizza tutti i PUDO disponibili."
        position="bottom-right"
      />

      {/* Left panel */}
      <div className="wizard-side-panel">
        {/* Nome scenario */}
        <div className="ws-row">
          <div className="ws-section-title">Nome scenario</div>
          <input
            className="wizard-nome-input"
            type="text"
            placeholder="Es. Roma Est — Aprile 2026"
            value={data.nomeScenario}
            onChange={e => onChange({ nomeScenario: e.target.value })}
            maxLength={60}
          />
        </div>

        {/* Periodo CI */}
        <div className="ws-row">
          <div className="ws-section-title">Periodo CI (storico)</div>
          <div className="wizard-periodo-pills">
            {PERIODI.map(p => (
              <button
                key={p.val}
                className={`wizard-periodo-pill${data.periodoGg === p.val ? ' active' : ''}`}
                onClick={() => onChange({ periodoGg: p.val })}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginTop: 4 }}>
            Il CI medio per PUDO viene calcolato sul periodo selezionato.
          </div>
        </div>

        {/* Province */}
        <div className="ws-row" ref={provRef}>
          <div className="ws-section-title">Selezione province</div>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="province-trigger"
              onClick={() => setShowProvinceDropdown(o => !o)}
              style={{ width: '100%' }}
            >
              <span>
                {data.province.length === 0
                  ? 'Seleziona province…'
                  : `${data.province.length} province selezionate`}
              </span>
              <span style={{ fontSize: 10, color: 'var(--fp-gray-mid)' }}>{showProvinceDropdown ? '▲' : '▼'}</span>
            </button>

            {showProvinceDropdown && (
              <div className="province-dropdown" style={{ position: 'absolute', zIndex: 500, width: '100%' }}>
                <div className="province-search">
                  <input
                    type="text"
                    placeholder="Cerca provincia…"
                    value={provSearch}
                    onChange={e => setProvSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="province-quick">
                  <button type="button" onClick={() => onChange({ province: PROVINCE_PER_REGIONE.flatMap(r => r.province.map(p => p.codice)) })}>Tutte</button>
                  <button type="button" onClick={() => onChange({ province: [] })}>Nessuna</button>
                </div>
                <div className="province-list">
                  {filteredRegioni.map(region => (
                    <div key={region.regione}>
                      <button type="button" className="province-region-header">
                        <span>{region.regione}</span>
                      </button>
                      <div className="province-items">
                        {region.province.map(p => {
                          const isSel = data.province.includes(p.codice)
                          return (
                            <button
                              key={p.codice}
                              type="button"
                              className={`province-item${isSel ? ' selected' : ''}`}
                              onClick={() => toggleProv(p.codice)}
                            >
                              <span className="province-check">{isSel ? '✓' : ' '}</span>
                              <span className="province-code">{p.codice}</span>
                              <span className="province-nome">{p.nome}</span>
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
          {data.province.length > 0 && (
            <div className="wizard-province-pills" style={{ marginTop: 6 }}>
              {data.province.map(cod => (
                <span key={cod} className="wizard-prov-chip">
                  {cod}
                  <button onClick={() => toggleProv(cod)} title="Rimuovi">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Filiale */}
        <div className="ws-row">
          <div className="ws-section-title">Filiale di riferimento *</div>
          <div className="wizard-filiale-list">
            {allFilialiCombo.map(f => (
              <button
                key={f.id}
                className={`wizard-filiale-item${data.filialeId === f.id ? ' selected' : ''}`}
                onClick={() => onChange({ filialeId: f.id })}
              >
                <div className={`wfi-avatar${f.tipo === 'brt' ? ' brt' : ''}`}>
                  {f.tipo === 'brt' ? 'B' : f.nome.charAt(0)}
                </div>
                <div className="wfi-info">
                  <div className="wfi-nome">{f.nome}</div>
                  <div className="wfi-citta">{f.citta} ({f.provincia})</div>
                </div>
                {data.filialeId === f.id && (
                  <span style={{ color: 'var(--fp-red)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>
                )}
              </button>
            ))}

            <button className="wizard-filiale-add-btn" onClick={() => setShowBrt(true)}>
              <span style={{ fontSize: 16 }}>＋</span>
              Aggiungi filiale BRT
            </button>
          </div>
        </div>

        {/* PUDO count info */}
        {pudosWithCi.length > 0 && (
          <div className="ws-filter-info">
            <span className="ws-filter-count">{pudosWithCi.length}</span>
            PUDO con CI &gt; 0 nell'area
          </div>
        )}
      </div>

      {/* Map panel */}
      <div className="wizard-map-panel">
        <MapContainer
          key={`step1-${data.filialeId}`}
          bounds={mapBounds}
          boundsOptions={{ padding: [30, 30] }}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* All PUDOs as small dots */}
          {pudosRoma.slice(0, 600).map(p => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={3}
              pathOptions={{ color: '#808285', fillColor: '#808285', fillOpacity: 0.5, weight: 0 }}
            />
          ))}

          {/* PUDOs with CI — labeled */}
          {pudosWithCi.map(p => (
            <CircleMarker
              key={`ci-${p.id}`}
              center={[p.lat, p.lng]}
              radius={10}
              pathOptions={{
                color: ciColor(p.ci),
                fillColor: ciColor(p.ci),
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]} className="ci-tooltip">
                <span style={{ fontWeight: 700, fontSize: 10 }}>{p.ci.toFixed(1)}</span>
              </Tooltip>
              <Tooltip direction="bottom" offset={[0, 8]}>
                <strong>{p.name}</strong><br />
                CI: {p.ci.toFixed(2)} · {p.cap}
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Filiale depot marker */}
          {selectedFiliale && (
            <CircleMarker
              center={[selectedFiliale.lat, selectedFiliale.lng]}
              radius={14}
              pathOptions={{ color: selectedFiliale.tipo === 'brt' ? '#1565C0' : '#DC0032', fillColor: selectedFiliale.tipo === 'brt' ? '#1565C0' : '#DC0032', fillOpacity: 1, weight: 2 }}
            >
              <Tooltip permanent direction="top" offset={[0, -14]}>
                🏢 {selectedFiliale.nome}
              </Tooltip>
            </CircleMarker>
          )}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            { color: '#2E7D32', label: 'CI ≥ 4 (alto)' },
            { color: '#E65100', label: 'CI 2.5–4 (medio)' },
            { color: '#1565C0', label: 'CI < 2.5 (basso)' },
            { color: '#9E9E9E', label: 'CI non disponibile' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {showBrt && <BrtModal onSelect={handleBrtSelect} onClose={() => setShowBrt(false)} />}
    </div>
  )
}
