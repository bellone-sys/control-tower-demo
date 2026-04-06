import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AuditPanel from '../ui/AuditPanel'
import './PuntiRitiroDetail.css'

const DAYS = ['lun','mar','mer','gio','ven','sab','dom']
const DAYS_LABEL = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica']

function getPudoTipo(pudo) {
  const name = (pudo.name || '').toLowerCase()
  if (
    name.includes('locker') ||
    name.includes('solo locker') ||
    name.includes('automatico') ||
    name.includes('mail boxes')
  ) return 'locker'
  return 'negozio'
}

function getPudoVolumeM3(pudo) {
  const n = parseInt(pudo.id.replace(/\D/g, ''), 10) || 0
  return getPudoTipo(pudo) === 'locker'
    ? +(0.20 + (n % 30) / 100).toFixed(2)
    : +(0.80 + (n % 200) / 100).toFixed(2)
}

function getPudoVolumeLibero(pudo) {
  const tot = getPudoVolumeM3(pudo)
  const n = parseInt(pudo.id.replace(/\D/g, ''), 10) || 0
  const pct = 0.30 + (n % 51) / 100
  return +(tot * (1 - pct)).toFixed(2)
}

export default function PuntiRitiroDetail({ pudo, onBack }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [auditOpen, setAuditOpen] = useState(false)

  const todayIdx = [0,1,2,3,4,5,6][(new Date().getDay() + 6) % 7] // Mon=0
  const todayKey = DAYS[todayIdx]
  const [copied, setCopied] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(pudo.id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  useEffect(() => {
    let map

    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }

    // Fix default marker icon path broken by Vite
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    if (!mapRef.current) return

    map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
      [pudo.lat, pudo.lng], 15
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Custom red marker
    const redIcon = L.divIcon({
      html: `<div class="fp-map-marker">
        <svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24S24 21 24 12C24 5.37 18.63 0 12 0z" fill="#DC0032"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
        </svg>
        <span>FP</span>
      </div>`,
      className: '',
      iconSize: [36, 40],
      iconAnchor: [18, 40],
      popupAnchor: [0, -40],
    })

    L.marker([pudo.lat, pudo.lng], { icon: redIcon }).addTo(map)
      .bindPopup(`<strong>${pudo.name}</strong><br>${pudo.cap}`)

    mapInstance.current = map

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [pudo.id])

  // Build max slots per day for table rows
  const maxSlots = Math.max(...DAYS.map(d => (pudo.hours[d] || []).length), 1)

  return (
    <div className="section-content">
      {/* Back button + title */}
      <div className="detail-header">
        <button className="btn-back" onClick={onBack} aria-label="Torna all'elenco PUDO">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Torna all'elenco
        </button>
        <h2 className="detail-title">
          Dettagli <span className="text-red">PUDO</span>
          <button className="pudo-id-chip" onClick={copyId} title="Copia ID">
            <code>{pudo.id}</code>
            {copied
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            }
          </button>
        </h2>
        <button className="btn-audit" onClick={() => setAuditOpen(true)} title="Cronologia modifiche" style={{ marginLeft: 'auto' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Cronologia
        </button>
      </div>

      <AuditPanel
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        entityType="pudo"
        entityId={pudo.id}
        entityLabel={`${pudo.id} · ${pudo.name}`}
      />

      <div className="detail-grid">

        {/* Map — smaller */}
        <div className="detail-map-wrap">
          <div ref={mapRef} className="detail-map" />
        </div>

        {/* Info + Hours */}
        <div className="detail-info-col">

          {/* Info card */}
          <div className="card detail-info-card">
            <h3>Informazioni PUDO</h3>
            <ul className="info-list">
              <li>
                <span className="info-label">FIP</span>
                <span className="info-value text-red">{pudo.id}</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span className="info-value">{pudo.name}</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="info-value">
                  {pudo.via
                    ? `${pudo.via}${pudo.civico ? ` ${pudo.civico}` : ''}, ${pudo.cap} — Roma (RM)`
                    : `${pudo.cap}${pudo.civico ? `, n. ${pudo.civico}` : ''} — Roma (RM)`
                  }
                </span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className={`info-status ${(pudo.hours[todayKey] && pudo.hours[todayKey].length > 0) ? 'open' : 'closed'}`}>
                  {(pudo.hours[todayKey] && pudo.hours[todayKey].length > 0)
                    ? `Aperto oggi: ${pudo.hours[todayKey].map(s => `${s.o}–${s.c}`).join(', ')}`
                    : 'Chiuso oggi'}
                </span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                <span className="info-label">Vol. totale</span>
                <span className="info-value">{getPudoVolumeM3(pudo)} m³</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span className="info-label">Vol. disponibile</span>
                <span className="info-value" style={{ color: '#2E7D32', fontWeight: 600 }}>{getPudoVolumeLibero(pudo)} m³</span>
              </li>
            </ul>
          </div>

          {/* Hours table — al posto della CTA */}
          <div className="card">
            <div className="card-header">
              <h3>Orari d'apertura</h3>
              <span className="card-label">Settimana tipo</span>
            </div>
            <div className="hours-table-wrap">
              <table className="hours-table">
                <thead>
                  <tr>
                    {DAYS.map(d => (
                      <th key={d} className={d === todayKey ? 'today' : ''}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxSlots }).map((_, slotIdx) => (
                    <tr key={slotIdx}>
                      {DAYS.map(d => {
                        const slots = pudo.hours[d]
                        const slot  = slots && slots[slotIdx]
                        return (
                          <td key={d} className={d === todayKey ? 'today' : ''}>
                            {slot ? (
                              <>
                                <span className="slot-open">{slot.o}</span>
                                <span className="slot-close">{slot.c}</span>
                              </>
                            ) : slots === null && slotIdx === 0 ? (
                              <span className="slot-closed">Chiuso</span>
                            ) : slots && slots.length === 0 && slotIdx === 0 ? (
                              <span className="slot-closed">—</span>
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
