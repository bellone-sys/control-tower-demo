import { useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { FILIALI } from '../../../../data/filiali'
import { getCiPudo } from '../../../../data/spedizioni'
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

export default function WizardStep2({ data, onChange }) {
  const allFiliali = [
    ...FILIALI,
    ...(data.extraFiliali || []),
  ]
  const filiale = allFiliali.find(f => f.id === data.filialeId)

  // Compute filtered PUDOs
  const { pudosFiltered, pudosTotali } = useMemo(() => {
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

    return { pudosFiltered: filtered, pudosTotali: totali }
  }, [data.ciMin, data.raggioKm, data.periodoGg, data.filialeId, data.extraFiliali])

  const mapCenter = filiale ? [filiale.lat, filiale.lng] : [41.9028, 12.4964]

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
          <span className="ws-filter-count">{pudosFiltered.length}</span>
          PUDO inclusi nello scenario
          <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginTop: 4 }}>
            su {pudosTotali} PUDO con CI disponibile
          </div>
        </div>

        {/* CI distribution preview */}
        <div style={{ marginTop: 4 }}>
          <div className="ws-section-title">Distribuzione CI</div>
          {[
            { label: 'Alto (≥ 4)',    color: '#2E7D32', count: pudosFiltered.filter(p => p.ci >= 4).length },
            { label: 'Medio (2.5–4)', color: '#E65100', count: pudosFiltered.filter(p => p.ci >= 2.5 && p.ci < 4).length },
            { label: 'Basso (< 2.5)', color: '#1565C0', count: pudosFiltered.filter(p => p.ci > 0 && p.ci < 2.5).length },
          ].map(({ label, color, count }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, flex: 1 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{count}</span>
            </div>
          ))}
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

          {/* Raggio cerchio */}
          {filiale && (() => {
            // Draw circle approximation as polyline points
            return null // Leaflet Circle component not imported to keep bundle light
          })()}

          {/* Filiale */}
          {filiale && (
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
