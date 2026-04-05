import { useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
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

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function WizardStep3({ data, onChange }) {
  const allFiliali = [...FILIALI, ...(data.extraFiliali || [])]
  const filiale = allFiliali.find(f => f.id === data.filialeId)

  // Candidate PUDOs (from step 2 filters)
  const candidates = useMemo(() => {
    return pudosRoma.map(p => {
      const ci = getCiPudo(p.id, data.periodoGg)
      const dist = filiale ? distKm(filiale.lat, filiale.lng, p.lat, p.lng) : 999
      const passesFilter = ci >= data.ciMin && dist <= data.raggioKm
      return { ...p, ci, dist }
    }).filter(p => p.ci > 0 || data.pudoSelezionati.has(p.id))
     .sort((a, b) => b.ci - a.ci)
  }, [data.periodoGg, data.ciMin, data.raggioKm, data.filialeId, data.extraFiliali])

  // Visible candidates: those passing filter + those manually added
  const visibleCandidates = useMemo(() => {
    return pudosRoma.map(p => {
      const ci = getCiPudo(p.id, data.periodoGg)
      const dist = filiale ? distKm(filiale.lat, filiale.lng, p.lat, p.lng) : 999
      return { ...p, ci, dist }
    }).filter(p => {
      const passesFilter = p.ci >= data.ciMin && p.dist <= data.raggioKm
      const manuallyAdded = data.pudoSelezionati.has(p.id)
      return passesFilter || manuallyAdded
    })
  }, [data.periodoGg, data.ciMin, data.raggioKm, data.filialeId, data.extraFiliali, data.pudoSelezionati])

  function togglePudo(pudoId) {
    const next = new Set(data.pudoSelezionati)
    if (next.has(pudoId)) {
      next.delete(pudoId)
    } else {
      next.add(pudoId)
    }
    onChange({ pudoSelezionati: next })
  }

  const selectedList = visibleCandidates
    .filter(p => data.pudoSelezionati.has(p.id))
    .sort((a, b) => b.ci - a.ci)

  const mapCenter = filiale ? [filiale.lat, filiale.lng] : [41.9028, 12.4964]

  return (
    <div className="step3-layout">
      {/* Sidebar */}
      <div className="step3-sidebar">
        <div className="step3-sidebar-header">
          <div className="step3-sidebar-title">
            {data.pudoSelezionati.size} PUDO selezionati
          </div>
          <div className="step3-sidebar-sub">
            Click sulla mappa per includere/escludere
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, height: 28, fontSize: 11 }}
              onClick={() => {
                const all = new Set(visibleCandidates.map(p => p.id))
                onChange({ pudoSelezionati: all })
              }}
            >
              Seleziona tutti
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1, height: 28, fontSize: 11 }}
              onClick={() => onChange({ pudoSelezionati: new Set() })}
            >
              Deseleziona tutti
            </button>
          </div>
        </div>

        <div className="step3-pudo-list">
          {visibleCandidates.sort((a, b) => b.ci - a.ci).map(p => {
            const isSel = data.pudoSelezionati.has(p.id)
            return (
              <div
                key={p.id}
                className={`step3-pudo-row${isSel ? ' included' : ' excluded'}`}
                onClick={() => togglePudo(p.id)}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: ciColor(p.ci), flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fp-charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--fp-gray-mid)' }}>
                    {p.id} · {p.dist < 999 ? `${p.dist.toFixed(1)} km` : ''}
                  </div>
                </div>
                <span className="step3-pudo-ci" style={{ color: ciColor(p.ci) }}>
                  {p.ci > 0 ? p.ci.toFixed(1) : '—'}
                </span>
                <span style={{ fontSize: 14, color: isSel ? '#2E7D32' : '#ccc', marginLeft: 4 }}>
                  {isSel ? '✓' : '○'}
                </span>
              </div>
            )
          })}

          {visibleCandidates.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--fp-gray-mid)', fontSize: 12 }}>
              Nessun PUDO visibile.<br />
              Modifica i filtri nel passo precedente.
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="step3-map">
        <MapContainer
          key={`step3-${data.filialeId}`}
          center={mapCenter}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* All visible candidates */}
          {visibleCandidates.map(p => {
            const isSel = data.pudoSelezionati.has(p.id)
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={isSel ? 11 : 7}
                pathOptions={{
                  color: isSel ? ciColor(p.ci) : '#ccc',
                  fillColor: isSel ? ciColor(p.ci) : '#e0e0e0',
                  fillOpacity: isSel ? 0.9 : 0.6,
                  weight: isSel ? 2.5 : 1,
                }}
                eventHandlers={{ click: () => togglePudo(p.id) }}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <strong>{p.name}</strong><br />
                  CI: {p.ci > 0 ? p.ci.toFixed(2) : 'N/D'}<br />
                  {isSel ? '✓ Incluso — click per escludere' : '○ Escluso — click per includere'}
                </Tooltip>
              </CircleMarker>
            )
          })}

          {/* Filiale */}
          {filiale && (
            <CircleMarker
              center={[filiale.lat, filiale.lng]}
              radius={14}
              pathOptions={{ color: '#DC0032', fillColor: '#DC0032', fillOpacity: 1, weight: 2 }}
            >
              <Tooltip permanent direction="top" offset={[0, -14]}>
                🏢 {filiale.nome}
              </Tooltip>
            </CircleMarker>
          )}
        </MapContainer>

        <div className="step3-tip">
          Click su un PUDO per includerlo/escluderlo dallo scenario
        </div>
      </div>
    </div>
  )
}
