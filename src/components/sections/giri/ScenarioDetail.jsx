import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../../data/flotta'
import './ScenarioDetail.css'

const GIORNI_LABEL = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

// Color palette for giri
const GIRO_COLORS = [
  '#DC0032', '#1565C0', '#2E7D32', '#E65100',
  '#6A1B9A', '#00695C', '#F57F17', '#AD1457',
  '#0277BD', '#558B2F', '#4527A0', '#00838F',
]

function ciColor(ci) {
  if (ci >= 4)   return '#2E7D32'
  if (ci >= 2.5) return '#E65100'
  return '#1565C0'
}

function formatDurata(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return `${h}h ${String(m).padStart(2, '0')}min`
}

function formatData(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function calcBounds(points) {
  if (!points.length) return [[41.5, 12.0], [42.2, 13.0]]
  const lats = points.map(p => p[0])
  const lngs = points.map(p => p[1])
  const pad = 0.018
  return [
    [Math.min(...lats) - pad, Math.min(...lngs) - pad],
    [Math.max(...lats) + pad, Math.max(...lngs) + pad],
  ]
}

function makeIcon(tipo, color) {
  const isLocker = tipo === 'locker'
  const shape = isLocker
    ? `border-radius:4px;transform:rotate(45deg)`
    : `border-radius:50%`
  const inner = isLocker
    ? `<span style="transform:rotate(-45deg);display:block;font-size:9px">🔒</span>`
    : ''
  return L.divIcon({
    html: `<div style="
      width:20px;height:20px;
      background:${color};
      border:2.5px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
      ${shape}
    ">${inner}</div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function depotIcon() {
  return L.divIcon({
    html: `<div style="
      width:26px;height:26px;background:#414042;
      border-radius:50%;border:2.5px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
      font-size:13px;line-height:1;
    ">🏢</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

const STATO_COLOR = {
  'Pianificato': { color: '#1565C0', bg: '#e3f0fb' },
  'In corso':    { color: '#E65100', bg: '#fff3e0' },
  'Completato':  { color: '#2E7D32', bg: '#e8f5e9' },
  'Annullato':   { color: '#DC0032', bg: '#fff0f3' },
}

export default function ScenarioDetail({ scenario, risorse, onBack }) {
  const { filiale, giri, ci, kmTotali, tempoMin, pudoCount, tappeCount, meta } = scenario
  const sched = meta.schedulazione
  const attivo = !!meta.attivo

  // Build map data
  const giriWithColor = giri.map((g, i) => ({
    ...g,
    color: GIRO_COLORS[i % GIRO_COLORS.length],
  }))

  // Collect all lat/lng points for bounds
  const allPoints = giriWithColor.flatMap(g => [
    ...(g.tappe || []).map(t => [t.lat, t.lng]),
    g.depotLat ? [g.depotLat, g.depotLng] : null,
  ].filter(Boolean))

  const bounds = calcBounds(allPoints)

  // One depot (shared across giri of same filiale)
  const depot = giri[0]?.depotLat ? { lat: giri[0].depotLat, lng: giri[0].depotLng } : null

  return (
    <div className="section-content">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={onBack} aria-label="Torna agli scenari">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Torna agli scenari
        </button>
        <h2 className="detail-title">
          Dettaglio <span className="text-red">Scenario</span>
          <span className={`sc-stato-badge${attivo ? ' active' : ''}`}>
            {attivo ? 'Attivo' : 'Inattivo'}
          </span>
        </h2>
      </div>

      {/* Info + sched row */}
      <div className="sc-detail-grid">
        <div className="sc-detail-left">
          <div className="card">
            <div className="card-header">
              <h3>{filiale.nome}</h3>
              <span className="card-label">{filiale.citta}</span>
            </div>
            <div className="sc-kpi-grid">
              <div className="sc-kpi">
                <div className="sc-kpi-val" style={{ color: ciColor(ci) }}>{ci.toFixed(2)}</div>
                <div className="sc-kpi-label">CI medio</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{giri.length}</div>
                <div className="sc-kpi-label">Giri</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{pudoCount}</div>
                <div className="sc-kpi-label">PUDO unici</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{tappeCount}</div>
                <div className="sc-kpi-label">Tappe</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{kmTotali} km</div>
                <div className="sc-kpi-label">Km stimati</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{formatDurata(tempoMin)}</div>
                <div className="sc-kpi-label">Tempo stimato</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sc-detail-right">
          <div className="card">
            <div className="card-header">
              <h3>Schedulazione</h3>
            </div>
            {sched ? (
              <div className="sc-detail-sched">
                <div className="sc-detail-sched-row">
                  <span className="sc-detail-sched-label">Periodo</span>
                  <span className="sc-detail-sched-val">
                    {formatData(sched.dataInizio) || '—'}
                    {sched.dataFine ? ` → ${formatData(sched.dataFine)}` : ' (nessuna scadenza)'}
                  </span>
                </div>
                <div className="sc-detail-sched-row">
                  <span className="sc-detail-sched-label">Giorni attivi</span>
                  <div className="sched-giorni-chips">
                    {GIORNI_LABEL.map((g, i) => (
                      <span key={i} className={`sched-chip${sched.giorni?.includes(i) ? ' on' : ''}`}>{g}</span>
                    ))}
                  </div>
                </div>
                <div className="sc-detail-sched-row">
                  <span className="sc-detail-sched-label">Invio percorsi</span>
                  <span className="sc-detail-sched-val">
                    {sched.orarioInvio
                      ? <span className="sched-invio-badge">{sched.orarioInvio}</span>
                      : <span style={{ color: 'var(--fp-gray-light)', fontStyle: 'italic' }}>Nessun invio automatico</span>
                    }
                  </span>
                </div>
              </div>
            ) : (
              <div className="sc-sched-empty" style={{ padding: '12px 0' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Nessuna schedulazione configurata
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card sc-map-card">
        <div className="card-header">
          <h3>Mappa PUDO</h3>
          {/* Legend */}
          <div className="sc-map-legend">
            {giriWithColor.map(g => (
              <div key={g.id} className="sc-map-legend-item">
                <span className="sc-map-legend-dot" style={{ background: g.color }} />
                <span className="sc-map-legend-name">{g.nome}</span>
              </div>
            ))}
            <div className="sc-map-legend-item sc-map-legend-sep">
              <span className="sc-map-legend-shape sc-map-legend-circle" />
              <span className="sc-map-legend-name">Negozio</span>
            </div>
            <div className="sc-map-legend-item">
              <span className="sc-map-legend-shape sc-map-legend-square" />
              <span className="sc-map-legend-name">Locker</span>
            </div>
          </div>
        </div>
        <div className="sc-map-wrap">
          {allPoints.length > 0 && (
            <MapContainer
              key={scenario.id}
              bounds={bounds}
              boundsOptions={{ padding: [24, 24] }}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Polylines per giro */}
              {giriWithColor.map(g => {
                const sorted = [...(g.tappe || [])].sort((a, b) => a.ordine - b.ordine)
                if (!sorted.length) return null
                const pts = [
                  ...(depot ? [[depot.lat, depot.lng]] : []),
                  ...sorted.map(t => [t.lat, t.lng]),
                  ...(depot ? [[depot.lat, depot.lng]] : []),
                ]
                return [
                  <Polyline key={`${g.id}-shadow`} positions={pts} pathOptions={{ color: '#fff', weight: 5, opacity: 0.5 }} />,
                  <Polyline key={`${g.id}-line`} positions={pts} pathOptions={{ color: g.color, weight: 2.5, opacity: 0.85 }} />,
                ]
              })}

              {/* Depot */}
              {depot && (
                <Marker position={[depot.lat, depot.lng]} icon={depotIcon()}>
                  <Popup><strong>{filiale.nome}</strong><br />Deposito</Popup>
                </Marker>
              )}

              {/* PUDO markers */}
              {giriWithColor.map(g =>
                (g.tappe || []).map(t => (
                  <Marker
                    key={`${g.id}-${t.pudoId}-${t.ordine}`}
                    position={[t.lat, t.lng]}
                    icon={makeIcon(t.tipo, g.color)}
                  >
                    <Popup>
                      <strong>{t.pudoNome}</strong><br />
                      {t.tipo === 'locker' ? '🔒 Locker' : '🏪 Negozio'}<br />
                      <span style={{ color: g.color, fontWeight: 600 }}>{g.nome}</span><br />
                      {t.oraArrivo} – {t.oraPartenza}
                    </Popup>
                  </Marker>
                ))
              )}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Giri table */}
      <div className="card">
        <h3>Giri dello scenario</h3>
        <div className="table-wrap">
          <table className="data-table sc-giri-table">
            <thead>
              <tr>
                <th>Giro</th>
                <th>Stato</th>
                <th>Mezzo</th>
                <th>Autista</th>
                <th>km</th>
                <th>Durata</th>
                <th>CI</th>
              </tr>
            </thead>
            <tbody>
              {giriWithColor.map(g => {
                const r = risorse[g.id]
                const mezzoId  = r?.mezzoId  ?? g.mezzoId
                const autoreId = r?.autoreId ?? g.autoreId
                const mezzo    = MEZZI.find(m => m.id === mezzoId)
                const modello  = mezzo ? MODELLI_MEZZI.find(mm => mm.catalogoId === mezzo.catalogoId) : null
                const driver   = DRIVERS.find(d => d.id === autoreId)
                const risorseOk = !!(mezzoId && autoreId)
                const statoStyle = STATO_COLOR[g.stato] || {}
                return (
                  <tr key={g.id} className={risorseOk ? '' : 'tr-missing'}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0, display: 'inline-block' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{g.nome}</div>
                          <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{g.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: statoStyle.color, background: statoStyle.bg, fontSize: 11 }}>
                        {g.stato}
                      </span>
                    </td>
                    <td>
                      {mezzo ? (
                        <>
                          <div style={{ fontWeight: 500 }}>{mezzo.targa}</div>
                          {modello && <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{modello.marca} {modello.modello.split(' ')[0]}</div>}
                        </>
                      ) : (
                        <span className="res-missing">Non assegnato</span>
                      )}
                    </td>
                    <td>
                      {driver
                        ? `${driver.cognome} ${driver.nome}`
                        : <span className="res-missing">Non assegnato</span>
                      }
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{g.distanzaKm ?? '—'} km</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{g.durataMin ? formatDurata(g.durataMin) : '—'}</td>
                    <td style={{ color: ciColor(g.ci), fontWeight: 700 }}>{g.ci.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
