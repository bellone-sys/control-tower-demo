import { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Marker } from 'react-leaflet'
import { FILIALI } from '../../../../data/filiali'
import { FILIALI_BRT } from '../../../../data/filialiBrt'
import { PROVINCE_PER_REGIONE } from '../../../../data/province'
import pudosRoma from '../../../../data/pudosRoma.json'
import TutorialOverlay from '../../../tutorials/TutorialOverlay'
import 'leaflet/dist/leaflet.css'

const MONTHS_IT = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

function isLocker(p) {
  return p.name.toLowerCase().includes('locker')
}

function makeLockerIcon() {
  return L.divIcon({
    html: `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="9" height="9" rx="2" fill="#414042" stroke="white" stroke-width="1"/>
    </svg>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  })
}

const LOCKER_ICON = makeLockerIcon()

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

export default function WizardStep1({ data, onChange, errors = [] }) {
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

  // Auto-populate scenario name based on selected filiale
  useEffect(() => {
    if (!data.nomeScenario.trim() && data.filialeId) {
      const allFilialiCombo = [
        ...FILIALI.map(f => ({ ...f, tipo: 'fp' })),
        ...(data.extraFiliali || []).map(f => ({ ...f, tipo: 'brt' })),
      ]
      const filiale = allFilialiCombo.find(f => f.id === data.filialeId)
      if (filiale) {
        const now = new Date()
        const mese = MONTHS_IT[now.getMonth()]
        const anno = now.getFullYear()
        onChange({ nomeScenario: `${filiale.nome} — ${mese} ${anno}` })
      }
    }
  }, [data.filialeId, data.extraFiliali])

  const allFilialiCombo = [
    ...FILIALI.map(f => ({ ...f, tipo: 'fp' })),
    ...(data.extraFiliali || []).map(f => ({ ...f, tipo: 'brt' })),
  ]

  const selectedFiliale = allFilialiCombo.find(f => f.id === data.filialeId) || null

  // Validation flags
  const errNome    = errors.some(e => e.toLowerCase().includes('nome'))
  const errFiliale = errors.some(e => e.toLowerCase().includes('filiale'))

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

  // Split PUDOs into lockers and regular for map rendering
  const { pudosRegolari, pudosLocker } = useMemo(() => ({
    pudosRegolari: pudosRoma.slice(0, 800).filter(p => !isLocker(p)),
    pudosLocker:   pudosRoma.slice(0, 800).filter(p =>  isLocker(p)),
  }), [])

  // Map center: filiale or Rome default
  const mapCenter = (selectedFiliale?.lat != null && selectedFiliale?.lng != null)
    ? [selectedFiliale.lat, selectedFiliale.lng]
    : [41.9028, 12.4964]

  return (
    <div className="wizard-step-layout">
      <TutorialOverlay
        id="scenario_wizard_step1"
        title="📍 Step 1: Area e Filiale"
        description="Scegli una filiale di riferimento (Fermopoint o BRT). In alternativa puoi selezionare manualmente le province di interesse."
        position="bottom-right"
      />

      {/* Left panel */}
      <div className="wizard-side-panel">

        {/* Nome scenario */}
        <div className="ws-row">
          <div className="ws-section-title">
            Nome scenario <span style={{ color: 'var(--fp-red)' }}>*</span>
          </div>
          <input
            className={`wizard-nome-input${errNome ? ' ws-input-error' : ''}`}
            type="text"
            placeholder="Es. Roma Est — Aprile 2026"
            value={data.nomeScenario}
            onChange={e => onChange({ nomeScenario: e.target.value })}
            maxLength={60}
          />
          {errNome && (
            <div className="ws-field-error">Inserisci un nome per lo scenario</div>
          )}
        </div>

        {/* Filiale — scelta primaria */}
        <div className="ws-row">
          <div className="ws-section-title">
            Filiale di riferimento <span style={{ color: 'var(--fp-red)' }}>*</span>
          </div>
          <div className={`wizard-filiale-list${errFiliale ? ' ws-list-error' : ''}`}>
            {allFilialiCombo.map(f => (
              <button
                key={f.id}
                className={`wizard-filiale-item${data.filialeId === f.id ? ' selected' : ''}`}
                onClick={() => onChange({ filialeId: f.id, province: [] })}
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
              Aggiungi filiale da elenco filiali BRT
            </button>
          </div>
          {errFiliale && (
            <div className="ws-field-error">Seleziona una filiale di riferimento</div>
          )}
        </div>

        {/* Selezione zona — alternativa quando non c'è filiale */}
        {!data.filialeId && (
          <div className="ws-row" ref={provRef}>
            <div className="ws-zona-divider">
              <span>oppure seleziona zona</span>
            </div>
            <div className="ws-section-title" style={{ marginTop: 10 }}>Selezione zona</div>
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
        )}

        {/* PUDO count info */}
        <div className="ws-filter-info">
          <span className="ws-filter-count">{pudosRoma.length}</span>
          PUDO disponibili nell'area ({pudosRoma.filter(p => isLocker(p)).length} locker)
        </div>
      </div>

      {/* Map panel */}
      <div className="wizard-map-panel">
        <MapContainer
          key={`step1-${data.filialeId}`}
          center={mapCenter}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* PUDO regolari — cerchio */}
          {pudosRegolari.map(p => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={5}
              pathOptions={{ color: '#414042', fillColor: '#414042', fillOpacity: 0.7, weight: 1 }}
              eventHandlers={{
                mouseover: (e) => e.target.bindTooltip(
                  `<b>${p.name}</b><br/><span style="font-size:10px;opacity:.75">${p.id} · ${p.cap}</span>`,
                  { direction: 'top', offset: L.point(0, -8) }
                ).openTooltip(),
                mouseout: (e) => { e.target.closeTooltip(); e.target.unbindTooltip() },
              }}
            />
          ))}

          {/* Locker — icona quadrata */}
          {pudosLocker.map(p => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={LOCKER_ICON}
              eventHandlers={{
                mouseover: (e) => e.target.bindTooltip(
                  `<b>🔒 ${p.name}</b><br/><span style="font-size:10px;opacity:.75">${p.id} · ${p.cap}</span>`,
                  { direction: 'top', offset: L.point(0, -10) }
                ).openTooltip(),
                mouseout: (e) => { e.target.closeTooltip(); e.target.unbindTooltip() },
              }}
            />
          ))}

          {/* Filiale depot marker */}
          {selectedFiliale?.lat != null && (
            <CircleMarker
              center={[selectedFiliale.lat, selectedFiliale.lng]}
              radius={14}
              pathOptions={{ color: selectedFiliale.tipo === 'brt' ? '#1565C0' : '#DC0032', fillColor: selectedFiliale.tipo === 'brt' ? '#1565C0' : '#DC0032', fillOpacity: 1, weight: 2 }}
              eventHandlers={{
                add: (e) => e.target.bindTooltip(`🏢 ${selectedFiliale.nome}`, { permanent: true, direction: 'top', offset: L.point(0, -14) }),
              }}
            />
          )}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#414042', flexShrink: 0 }} />
            <span>PUDO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#414042', flexShrink: 0 }} />
            <span>Locker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC0032', flexShrink: 0 }} />
            <span>Filiale</span>
          </div>
        </div>
      </div>

      {showBrt && <BrtModal onSelect={handleBrtSelect} onClose={() => setShowBrt(false)} />}
    </div>
  )
}
