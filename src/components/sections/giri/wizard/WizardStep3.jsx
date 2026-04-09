import { useMemo, useState, useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import { FILIALI } from '../../../../data/filiali'
import { getCiPudo } from '../../../../data/spedizioni'
import pudosRoma from '../../../../data/pudosRoma.json'
import 'leaflet/dist/leaflet.css'

// Helper component to center map on PUDO
function MapCenterHelper({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 14, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

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

function isLocker(p) {
  return p.name.toLowerCase().includes('locker')
}

// Icona tipo PUDO: cerchio = PUDO, quadrato = locker
function PudoTypeIcon({ locker }) {
  return locker
    ? <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="9" height="9" rx="2" fill="#808285" stroke="#808285" strokeWidth="0.5"/>
      </svg>
    : <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="5" r="4.5" fill="#808285" stroke="#808285" strokeWidth="0.5"/>
      </svg>
}

export default function WizardStep3({ data, onChange }) {
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('ci') // 'ci' | 'dist' | 'name'
  const [filterType, setFilterType] = useState('all') // 'all' | 'pudo' | 'locker'
  const [highlightedPudo, setHighlightedPudo] = useState(null) // PUDO evidenziato sulla mappa

  const allFiliali = [...FILIALI, ...(data.extraFiliali || [])]
  const filiale = allFiliali.find(f => f.id === data.filialeId)

  const visibleCandidates = useMemo(() => {
    return pudosRoma.map(p => {
      const ci = getCiPudo(p.id, data.periodoGg)
      const dist = filiale ? distKm(filiale.lat, filiale.lng, p.lat, p.lng) : 999
      return { ...p, ci, dist, locker: isLocker(p) }
    }).filter(p => {
      const passesFilter = p.ci >= data.ciMin && p.dist <= data.raggioKm
      return passesFilter || data.pudoSelezionati.has(p.id)
    })
  }, [data.periodoGg, data.ciMin, data.raggioKm, data.filialeId, data.extraFiliali, data.pudoSelezionati])

  // Filtered + sorted list for sidebar
  const displayList = useMemo(() => {
    let list = [...visibleCandidates]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.cap.includes(q)
      )
    }

    if (filterType === 'pudo')   list = list.filter(p => !p.locker)
    if (filterType === 'locker') list = list.filter(p =>  p.locker)

    if (sortBy === 'ci')   list.sort((a, b) => b.ci - a.ci)
    if (sortBy === 'dist') list.sort((a, b) => a.dist - b.dist)
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name))

    return list
  }, [visibleCandidates, search, sortBy, filterType])

  function togglePudo(pudoId) {
    const next = new Set(data.pudoSelezionati)
    if (next.has(pudoId)) next.delete(pudoId)
    else next.add(pudoId)
    onChange({ pudoSelezionati: next })
  }

  const mapCenter = (filiale?.lat != null) ? [filiale.lat, filiale.lng] : [41.9028, 12.4964]

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
              onClick={() => onChange({ pudoSelezionati: new Set(visibleCandidates.map(p => p.id)) })}
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

          {/* Ricerca */}
          <input
            type="text"
            placeholder="Cerca per nome, ID, CAP…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              marginTop: 8, width: '100%', boxSizing: 'border-box',
              border: '1px solid var(--fp-border)', borderRadius: 6,
              padding: '5px 8px', fontSize: 11, outline: 'none',
            }}
          />

          {/* Filtro tipo + ordinamento */}
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {/* Tipo */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{
                flex: 1, fontSize: 10, border: '1px solid var(--fp-border)',
                borderRadius: 5, padding: '3px 4px', background: 'var(--fp-bg)',
                color: 'var(--fp-charcoal)',
              }}
            >
              <option value="all">Tutti i tipi</option>
              <option value="pudo">Solo PUDO</option>
              <option value="locker">Solo Locker</option>
            </select>

            {/* Ordina */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                flex: 1, fontSize: 10, border: '1px solid var(--fp-border)',
                borderRadius: 5, padding: '3px 4px', background: 'var(--fp-bg)',
                color: 'var(--fp-charcoal)',
              }}
            >
              <option value="ci">Ordina: CI ↓</option>
              <option value="dist">Ordina: distanza ↑</option>
              <option value="name">Ordina: A–Z</option>
            </select>
          </div>

          {/* Contatore risultati */}
          {(search || filterType !== 'all') && (
            <div style={{ fontSize: 10, color: 'var(--fp-gray-mid)', marginTop: 4 }}>
              {displayList.length} risultati su {visibleCandidates.length}
            </div>
          )}
        </div>

        <div className="step3-pudo-list">
          {displayList.map(p => {
            const isSel = data.pudoSelezionati.has(p.id)
            return (
              <div
                key={p.id}
                className={`step3-pudo-row${isSel ? ' included' : ' excluded'}`}
                onClick={() => togglePudo(p.id)}
              >
                {/* Pallino CI */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: ciColor(p.ci), flexShrink: 0,
                }} />

                {/* Icona tipo */}
                <PudoTypeIcon locker={p.locker} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fp-charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--fp-gray-mid)' }}>
                    {p.id} · {p.dist < 999 ? `${p.dist.toFixed(1)} km` : ''}
                    {p.locker && <span style={{ marginLeft: 4, color: '#808285', fontWeight: 600 }}>LOCKER</span>}
                  </div>
                </div>
                <span className="step3-pudo-ci" style={{ color: ciColor(p.ci) }}>
                  {p.ci > 0 ? p.ci.toFixed(1) : '—'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePudo(p.id)
                  }}
                  style={{
                    background: isSel ? '#E8F5E9' : 'transparent',
                    border: isSel ? '1px solid #2E7D32' : '1px solid transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: isSel ? '#2E7D32' : '#ccc',
                    marginLeft: 4,
                    padding: '2px 6px',
                    transition: 'all 0.2s',
                  }}
                  title={isSel ? 'Click per escludere' : 'Click per includere'}
                >
                  {isSel ? '✓' : '○'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setHighlightedPudo(p.id)
                  }}
                  style={{
                    background: highlightedPudo === p.id ? '#E3F2FD' : 'transparent',
                    border: highlightedPudo === p.id ? '1px solid #1565C0' : '1px solid transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: highlightedPudo === p.id ? '#1565C0' : '#ccc',
                    marginLeft: 6,
                    padding: '2px 6px',
                    transition: 'all 0.2s',
                  }}
                  title="Localizza su mappa"
                >
                  📍
                </button>
              </div>
            )
          })}

          {displayList.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--fp-gray-mid)', fontSize: 12 }}>
              {visibleCandidates.length === 0
                ? <>Nessun PUDO visibile.<br />Modifica i filtri nel passo precedente.</>
                : 'Nessun risultato per la ricerca.'}
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

          {highlightedPudo && visibleCandidates.find(p => p.id === highlightedPudo) && (
            <MapCenterHelper
              center={[visibleCandidates.find(p => p.id === highlightedPudo).lat, visibleCandidates.find(p => p.id === highlightedPudo).lng]}
              zoom={14}
            />
          )}

          {visibleCandidates.map(p => {
            const isSel = data.pudoSelezionati.has(p.id)
            const isHighlighted = highlightedPudo === p.id
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={isHighlighted ? 15 : (isSel ? 11 : 7)}
                pathOptions={{
                  color: isHighlighted ? '#1565C0' : (isSel ? ciColor(p.ci) : '#ccc'),
                  fillColor: isHighlighted ? '#1565C0' : (isSel ? ciColor(p.ci) : '#e0e0e0'),
                  fillOpacity: isHighlighted ? 1 : (isSel ? 0.9 : 0.6),
                  weight: isHighlighted ? 3 : (isSel ? 2.5 : 1),
                }}
                eventHandlers={{
                  click: () => togglePudo(p.id),
                  mouseover: (e) => e.target.bindTooltip(
                    `<b>${p.locker ? '🔒 ' : ''}${p.name}</b><br/>CI: ${p.ci > 0 ? p.ci.toFixed(2) : 'N/D'}<br/>${isSel ? '✓ click per escludere' : '○ click per includere'}${isHighlighted ? '<br/>📍 Localizzato' : ''}`,
                    { direction: 'top', offset: L.point(0, -8) }
                  ).openTooltip(),
                  mouseout: (e) => { e.target.closeTooltip(); e.target.unbindTooltip() },
                }}
              />
            )
          })}

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

        <div className="step3-tip">
          Click su un PUDO per includerlo/escluderlo dallo scenario
        </div>
      </div>
    </div>
  )
}
