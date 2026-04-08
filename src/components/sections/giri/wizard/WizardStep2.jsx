import { useMemo, useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Circle, useMap, Rectangle, FeatureGroup, Tooltip } from 'react-leaflet'
import { FILIALI } from '../../../../data/filiali'
import { getCiPudo } from '../../../../data/spedizioni'
// import { DENSITA_AREE, getDensitaColor } from '../../../../data/densitaPopolare'
import pudosRoma from '../../../../data/pudosRoma.json'
import 'leaflet/dist/leaflet.css'

function ciColor(ci) {
  if (ci >= 4)   return '#2E7D32'
  if (ci >= 2.5) return '#E65100'
  if (ci > 0)    return '#1565C0'
  return '#9E9E9E'
}

// Haversine distance in km
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Adatta il viewport al cerchio del raggio
function RadiusFitter({ center, radiusM }) {
  const map = useMap()
  useEffect(() => {
    if (center && radiusM) {
      const bounds = L.latLng(center).toBounds(radiusM * 2)
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 })
    }
  }, [center[0], center[1], radiusM]) // eslint-disable-line
  return null
}

export default function WizardStep2({ data, onChange }) {
  const [customPeriodo, setCustomPeriodo] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const allFiliali = [
    ...FILIALI,
    ...(data.extraFiliali || []),
  ]
  const filiale = allFiliali.find(f => f.id === data.filialeId)

  // Helper to check if PUDO is a locker
  function isLocker(p) {
    return p.name.toLowerCase().includes('locker')
  }

  // Compute filtered PUDOs
  const { pudosFiltered, pudosTotali, ciMedio, ciTotale, popolazioneRaggio, densitaMedia, pudoCount, lockerCount } = useMemo(() => {
    const withCi = pudosRoma.map(p => ({
      ...p,
      ci: getCiPudo(p.id, data.periodoGg),
    }))

    const totali = withCi.filter(p => p.ci > 0).length

    const filtered = withCi.filter(p => {
      if (p.ci < data.ciMin) return false
      if (filiale) {
        const dist = distKm(filiale.lat, filiale.lng, p.lat, p.lng)
        if (dist > data.raggioKm) return false
      }
      return true
    })

    // Count PUDO vs Locker
    const pCount = filtered.filter(p => !isLocker(p)).length
    const lCount = filtered.filter(p => isLocker(p)).length

    // Calculate total CI (sum)
    const totalCi = filtered.reduce((sum, p) => sum + p.ci, 0)

    // Calculate average CI
    const avgCi = filtered.length > 0 ? totalCi / filtered.length : 0

    // Calculate population and density average from zones containing filtered PUDOs
    let popRaggio = 0
    let densAvg = 0
    // TODO: Re-enable DENSITA_AREE calculation once densitaPopolare.js is properly loaded
    // if (filtered.length > 0) {
    //   // Find which density zones contain the filtered PUDOs
    //   const zonesWithPudos = new Map() // Map of area.id -> area
    //   filtered.forEach(pudo => {
    //     DENSITA_AREE.forEach(area => {
    //       // Check if PUDO is within zone bounds
    //       const inZone =
    //         pudo.lat >= area.bounds.lat1 && pudo.lat <= area.bounds.lat2 &&
    //         pudo.lng >= area.bounds.lng1 && pudo.lng <= area.bounds.lng2
    //       if (inZone) {
    //         zonesWithPudos.set(area.id, area)
    //       }
    //     })
    //   })
    //   // Sum population and calculate average density
    //   const zones = Array.from(zonesWithPudos.values())
    //   popRaggio = zones.reduce((sum, area) => sum + area.abitanti, 0)
    //   densAvg = zones.length > 0 ? zones.reduce((sum, area) => sum + area.densita, 0) / zones.length : 0
    // }

    return {
      pudosFiltered: filtered,
      pudosTotali: totali,
      ciMedio: avgCi,
      ciTotale: totalCi,
      popolazioneRaggio: popRaggio,
      densitaMedia: densAvg,
      pudoCount: pCount,
      lockerCount: lCount
    }
  }, [data.ciMin, data.raggioKm, data.periodoGg, data.filialeId, data.extraFiliali])

  const mapCenter = (filiale?.lat != null) ? [filiale.lat, filiale.lng] : [41.9028, 12.4964]

  return (
    <div className="wizard-step-layout">
      {/* Left panel */}
      <div className="wizard-side-panel">
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fp-charcoal)', marginBottom: 4 }}>
          Filtra i PUDO
        </div>
        <div style={{ fontSize: 12, color: 'var(--fp-gray-mid)', marginBottom: 16, lineHeight: 1.5 }}>
          Imposta i criteri di inclusione automatica. Potrai raffinare manualmente al passo successivo.
        </div>

        {/* Periodo CI */}
        <div className="ws-row" style={{ marginBottom: 8 }}>
          <div className="ws-section-title">Periodo CI (storico)</div>
          <div className="wizard-periodo-pills">
            {[
              { val: 60, label: '2 mesi' },
              { val: 180, label: '6 mesi' },
              { val: 365, label: '1 anno' },
              { val: 'custom', label: 'Personalizzato' },
            ].map(p => (
              <button
                key={p.val}
                className={`wizard-periodo-pill${(p.val === 'custom' ? showCustomInput : data.periodoGg === p.val) ? ' active' : ''}`}
                onClick={() => {
                  if (p.val === 'custom') {
                    setShowCustomInput(true)
                  } else {
                    setShowCustomInput(false)
                    setCustomPeriodo('')
                    onChange({ periodoGg: p.val })
                  }
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          {showCustomInput && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <input
                type="number"
                min={1}
                max={1095}
                placeholder="Giorni (1-1095)"
                value={customPeriodo}
                onChange={e => setCustomPeriodo(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid var(--fp-cool-gray)',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  fontFamily: 'var(--fp-font)',
                }}
              />
              <button
                onClick={() => {
                  const days = parseInt(customPeriodo, 10)
                  if (days > 0 && days <= 1095) {
                    onChange({ periodoGg: days })
                    setShowCustomInput(false)
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'var(--fp-charcoal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--fp-font)',
                }}
              >
                OK
              </button>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginTop: 2 }}>
            Il CI medio per PUDO viene calcolato sul periodo selezionato.
          </div>
        </div>

        {/* CI minimo */}
        <div className="ws-slider-wrap">
          <div className="ws-slider-header">
            <span className="ws-slider-label">CI minimo</span>
            <span className="ws-slider-val">{data.ciMin.toFixed(1)}</span>
          </div>
          <input
            type="range"
            className="ws-range"
            min={0} max={6} step={0.1}
            value={data.ciMin}
            onChange={e => onChange({ ciMin: parseFloat(e.target.value) })}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--fp-gray-mid)' }}>
            <span>0 (tutti)</span>
            <span>6 (solo top)</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', lineHeight: 1.5 }}>
            Solo PUDO con CI ≥ {data.ciMin.toFixed(1)} vengono inclusi.
          </div>
        </div>

        {/* Raggio km */}
        <div className="ws-slider-wrap" style={{ marginTop: 16 }}>
          <div className="ws-slider-header">
            <span className="ws-slider-label">Raggio dalla filiale</span>
            <span className="ws-slider-val">{data.raggioKm} km</span>
          </div>
          <input
            type="range"
            className="ws-range"
            min={1} max={100} step={1}
            value={data.raggioKm}
            disabled={!filiale}
            onChange={e => onChange({ raggioKm: parseInt(e.target.value, 10) })}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--fp-gray-mid)' }}>
            <span>1 km</span>
            <span>100 km</span>
          </div>
          {!filiale && (
            <div style={{ fontSize: 11, color: '#E65100' }}>
              Seleziona una filiale nel passo 1 per abilitare il filtro raggio.
            </div>
          )}
        </div>

        {/* Result summary */}
        <div className="ws-filter-info" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fp-charcoal)' }}>{pudoCount} PUDO</span>
            <span style={{ fontSize: 12, color: 'var(--fp-gray-mid)', marginLeft: 8 }}>+ {lockerCount} Locker</span>
          </div>
          <span className="ws-filter-count">{pudosFiltered.length}</span>
          inclusi nello scenario

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--fp-cool-gray)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--fp-gray-mid)' }}>CI medio</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-charcoal)' }}>{ciMedio.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--fp-gray-mid)' }}>CI totale</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-charcoal)' }}>{ciTotale.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--fp-gray-mid)' }}>Densità media</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-charcoal)' }}>
                {densitaMedia.toFixed(0)} <span style={{ fontSize: 10, fontWeight: 400 }}>ab/km²</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--fp-gray-mid)' }}>Popolazione raggio</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-charcoal)' }}>
                {(popolazioneRaggio / 1000).toFixed(0)}k <span style={{ fontSize: 10, fontWeight: 400 }}>ab</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map panel */}
      <div className="wizard-map-panel">
        <MapContainer
          key={`step2-${data.filialeId}`}
          center={mapCenter}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Densità di Popolazione — heatmap zones */}
          {/* TODO: Re-enable density zones once densitaPopolare.js is properly loaded */}
          {/* <FeatureGroup>
            {DENSITA_AREE.map(area => {
              const color = getDensitaColor(area.densita)
              return (
                <Rectangle
                  key={area.id}
                  bounds={[
                    [area.bounds.lat1, area.bounds.lng1],
                    [area.bounds.lat2, area.bounds.lng2],
                  ]}
                  pathOptions={{
                    color: color,
                    weight: 1,
                    opacity: 0.7,
                    fill: true,
                    fillColor: color,
                    fillOpacity: 0.3,
                  }}
                >
                  <Tooltip sticky>
                    <div style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{area.area}</div>
                      <div>{area.densita} ab/km²</div>
                    </div>
                  </Tooltip>
                </Rectangle>
              )
            })}
          </FeatureGroup> */}

          {/* Combined legends — CI + Densità */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: '#fff',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 12,
            zIndex: 400,
            fontSize: 11,
            maxWidth: 220,
          }}>
            {/* Distribuzione CI */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--fp-charcoal)', fontSize: 12 }}>Distribuzione CI</div>
              {[
                { label: 'Alto (≥ 4)', color: '#2E7D32', count: pudosFiltered.filter(p => p.ci >= 4).length },
                { label: 'Medio (2.5–4)', color: '#E65100', count: pudosFiltered.filter(p => p.ci >= 2.5 && p.ci < 4).length },
                { label: 'Basso (< 2.5)', color: '#1565C0', count: pudosFiltered.filter(p => p.ci > 0 && p.ci < 2.5).length },
              ].map(({ label, color, count }, idx) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: idx < 2 ? 5 : 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, flex: 1, color: 'var(--fp-gray-mid)' }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--fp-cool-gray)', marginBottom: 12 }} />

            {/* Densità ab/km² */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--fp-charcoal)', fontSize: 12 }}>Densità ab/km²</div>
              {[
                { label: '≥ 3500 Densitissimo', color: '#8B0000' },
                { label: '2500–3499 Molto denso', color: '#DC143C' },
                { label: '1500–2499 Denso', color: '#FF6347' },
                { label: '800–1499 Moderato', color: '#FFA500' },
                { label: '< 800 Basso', color: '#FFD700' },
              ].map(({ label, color }, idx) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: idx < 4 ? 5 : 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--fp-gray-mid)', fontSize: 11 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Excluded PUDOs (dimmed) */}
          {pudosRoma.slice(0, 600).map(p => {
            const ci = getCiPudo(p.id, data.periodoGg)
            const inFilter = pudosFiltered.some(pf => pf.id === p.id)
            if (ci === 0) return null
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={inFilter ? 9 : 5}
                pathOptions={{
                  color: inFilter ? ciColor(ci) : '#ccc',
                  fillColor: inFilter ? ciColor(ci) : '#ccc',
                  fillOpacity: inFilter ? 0.9 : 0.4,
                  weight: inFilter ? 2 : 1,
                }}
                eventHandlers={{
                  mouseover: (e) => e.target.bindTooltip(
                    `<b>${p.name}</b><br/>CI: ${ci.toFixed(2)}${!inFilter ? ' — escluso dai filtri' : ''}`,
                    { direction: 'top', offset: L.point(0, -9) }
                  ).openTooltip(),
                  mouseout: (e) => { e.target.closeTooltip(); e.target.unbindTooltip() },
                }}
              />
            )
          })}

          {/* Cerchio raggio */}
          {filiale?.lat != null && (
            <>
              <Circle
                center={[filiale.lat, filiale.lng]}
                radius={data.raggioKm * 1000}
                pathOptions={{
                  color: '#DC0032',
                  fillColor: '#DC0032',
                  fillOpacity: 0.06,
                  weight: 2,
                  dashArray: '6 4',
                }}
              />
              <RadiusFitter
                center={[filiale.lat, filiale.lng]}
                radiusM={data.raggioKm * 1000}
              />
            </>
          )}

          {/* Filiale */}
          {filiale?.lat != null && (
            <CircleMarker
              center={[filiale.lat, filiale.lng]}
              radius={14}
              pathOptions={{ color: '#DC0032', fillColor: '#DC0032', fillOpacity: 1, weight: 2 }}
              eventHandlers={{
                add: (e) => e.target.bindTooltip(`🏢 ${filiale.nome}`, { permanent: true, direction: 'top', offset: L.point(0, -14) }),
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}
