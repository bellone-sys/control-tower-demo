import { useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FILIALI } from '../../../data/filiali'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../../data/flotta'
import EntityHistory from '../../ui/EntityHistory'
import './DetailGiro.css'

// Calcola i bounds su un array di {lat, lng}
function calcBounds(points) {
  if (!points.length) return [[41.5, 12.0], [42.2, 13.0]]
  const lats = points.map(p => p.lat)
  const lngs = points.map(p => p.lng)
  const pad = 0.015
  return [
    [Math.min(...lats) - pad, Math.min(...lngs) - pad],
    [Math.max(...lats) + pad, Math.max(...lngs) + pad],
  ]
}

function addMinutes(timeStr, min) {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + min
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function subMinutes(timeStr, min) {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m - min
  const hh = Math.max(0, Math.floor(total / 60))
  const mm = ((total % 60) + 60) % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function formatDurata(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  return `${h}h ${String(m).padStart(2, '0')}min`
}

function getStatoClass(stato) {
  const map = {
    'Pianificato': 'stato-pianificato',
    'In corso':    'stato-in-corso',
    'Completato':  'stato-completato',
    'Annullato':   'stato-annullato',
  }
  return map[stato] || ''
}

export default function DetailGiro({ giro, onClose, isSaved, onToggleTemplate }) {
  const [justSaved, setJustSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  const filiale = FILIALI.find(f => f.id === giro.filialeId)
  const driver  = DRIVERS.find(d => d.id === giro.autoreId)
  const mezzo   = MEZZI.find(m => m.id === giro.mezzoId)
  const modello = mezzo ? MODELLI_MEZZI.find(mm => mm.catalogoId === mezzo.catalogoId) : null

  const tappeOrd  = [...giro.tappe].sort((a, b) => a.ordine - b.ordine)
  const depot     = { lat: giro.depotLat, lng: giro.depotLng }
  const allPoints = [depot, ...tappeOrd, depot]
  const bounds    = calcBounds([depot, ...tappeOrd])
  const polyline  = allPoints.map(p => [p.lat, p.lng])

  const oraPartenza = tappeOrd.length > 0 ? subMinutes(tappeOrd[0].oraArrivo, 15) : '07:00'
  const oraRientro  = tappeOrd.length > 0 ? addMinutes(tappeOrd[tappeOrd.length - 1].oraPartenza, 20) : '—'

  function handleToggle() {
    onToggleTemplate(giro)
    if (!isSaved) {
      // appena salvato: feedback breve
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    }
  }

  // Classe bottone: giallo se già salvato, verde breve se appena salvato
  const btnClass = [
    'btn-template',
    justSaved  ? 'just-saved' : '',
    isSaved && !justSaved ? 'is-saved' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="giro-detail-panel">
      {/* Header */}
      <div className="giro-detail-header">
        <button className="giro-detail-back" onClick={onClose} title="Chiudi">←</button>
        <span className="giro-detail-title">{giro.nome}</span>
        <span className={`giro-stato-badge ${getStatoClass(giro.stato)}`}>{giro.stato}</span>
        <button className={btnClass} onClick={handleToggle} title={isSaved ? 'Rimuovi template' : 'Salva come template'}>
          <span className="star-icon">{isSaved ? '★' : '☆'}</span>
          {justSaved ? 'Salvato!' : isSaved ? 'Template' : 'Template'}
        </button>
        <button className="giro-detail-close" onClick={onClose} title="Chiudi">×</button>
      </div>

      {/* Sub-tabs: Dettagli | Cronologia */}
      <div className="giro-detail-tabs" role="tablist" aria-label="Sezioni dettaglio giro">
        {[
          { id: 'details',  label: 'Dettagli' },
          { id: 'history',  label: '🕐 Cronologia' },
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`giro-detail-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body: mappa + timeline */}
      <div
        id="panel-details"
        role="tabpanel"
        aria-labelledby="tab-details"
        hidden={activeTab !== 'details'}
        className="giro-detail-body">
        {/* Mappa — key={giro.id} forza rimount quando cambia giro */}
        <div className="giro-map-col">
          <MapContainer
            key={giro.id}
            bounds={bounds}
            boundsOptions={{ padding: [20, 20] }}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polyline
              positions={polyline}
              pathOptions={{ color: '#808285', weight: 2.5, dashArray: '6 4', opacity: 0.8 }}
            />

            {/* Depot */}
            <Marker
              position={[depot.lat, depot.lng]}
              icon={L.divIcon({
                html: '<div class="giro-marker depot">🏢</div>',
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              })}
            >
              <Popup><strong>{filiale ? filiale.nome : 'Deposito'}</strong></Popup>
            </Marker>

            {/* Tappe */}
            {tappeOrd.map(tappa => (
              <Marker
                key={tappa.pudoId}
                position={[tappa.lat, tappa.lng]}
                icon={L.divIcon({
                  html: `<div class="giro-marker ${tappa.tipo}">${tappa.ordine}</div>`,
                  className: '',
                  iconSize: [28, 28],
                  iconAnchor: [14, 14],
                })}
              >
                <Popup>
                  <strong>{tappa.pudoNome}</strong><br />
                  {tappa.tipo === 'locker' ? '🔒 Locker' : '🏪 Negozio'}<br />
                  {tappa.oraArrivo} – {tappa.oraPartenza}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Timeline */}
        <div className="giro-timeline-col">
          <div className="timeline-item">
            <div className="timeline-num depot">🏢</div>
            <div className="timeline-info">
              <div className="timeline-nome">Partenza deposito</div>
              <div className="timeline-ora">{oraPartenza}</div>
            </div>
          </div>

          {tappeOrd.map(tappa => (
            <div className="timeline-item" key={tappa.pudoId}>
              <div className={`timeline-num ${tappa.tipo}`}>{tappa.ordine}</div>
              <div className="timeline-info">
                <div className="timeline-nome">
                  {tappa.tipo === 'locker' ? '🔒 ' : '🏪 '}
                  {tappa.pudoNome}
                </div>
                <div className="timeline-ora">{tappa.oraArrivo} – {tappa.oraPartenza}</div>
              </div>
            </div>
          ))}

          <div className="timeline-item">
            <div className="timeline-num depot">🏢</div>
            <div className="timeline-info">
              <div className="timeline-nome">Rientro deposito</div>
              <div className="timeline-ora">~{oraRientro}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cronologia tab */}
      <div
        id="panel-history"
        role="tabpanel"
        aria-labelledby="tab-history"
        hidden={activeTab !== 'history'}
        style={{ padding: '0 20px 20px' }}
      >
        <EntityHistory entityType="giro" entityId={giro.id} />
      </div>

      {/* Footer */}
      <div className="giro-detail-footer">
        {driver && (
          <span className="footer-item">
            👤 <strong>{driver.cognome} {driver.nome}</strong>
          </span>
        )}
        {mezzo && (
          <span className="footer-item">
            🚐 <strong>{mezzo.targa}</strong>
            {modello && <span style={{ color: 'var(--fp-gray-light)', marginLeft: 4 }}>{modello.marca} {modello.modello.split(' ')[0]}</span>}
          </span>
        )}
        <span className="footer-item">📍 <strong>{giro.distanzaKm} km</strong></span>
        <span className="footer-item">⏱ <strong>{formatDurata(giro.durataMin)}</strong></span>
      </div>
    </div>
  )
}
