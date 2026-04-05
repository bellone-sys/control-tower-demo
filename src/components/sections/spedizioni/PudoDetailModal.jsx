import './PudoDetailModal.css'

const DAY_LABELS = { lun: 'Lunedì', mar: 'Martedì', mer: 'Mercoledì', gio: 'Giovedì', ven: 'Venerdì', sab: 'Sabato', dom: 'Domenica' }

function formatSlots(slots) {
  if (!slots || slots.length === 0) return 'Chiuso'
  return slots.map(s => `${s.o}–${s.c}`).join('  •  ')
}

export default function PudoDetailModal({ pudo, tipo, onClose }) {
  if (!pudo) return null

  const isLocker  = tipo === 'locker'
  const tipoLabel = isLocker ? '🔒 Locker' : '🏪 Negozio'
  const tipoColor = isLocker ? '#1565C0' : '#2E7D32'
  const tipoBg    = isLocker ? '#e3f0fb' : '#e8f5e9'

  return (
    <div className="pudo-modal-backdrop" onClick={onClose}>
      <div className="pudo-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pudo-modal-header">
          <div className="pudo-modal-header-info">
            <span className="pudo-modal-badge" style={{ color: tipoColor, background: tipoBg }}>
              {tipoLabel}
            </span>
            <h4 className="pudo-modal-title">{pudo.name}</h4>
            <code className="pudo-modal-id">{pudo.id}</code>
          </div>
          <button className="pudo-modal-close" onClick={onClose} title="Chiudi">×</button>
        </div>

        {/* Body */}
        <div className="pudo-modal-body">

          {/* Anagrafica */}
          <div className="pudo-section-title">Anagrafica</div>

          <div className="pudo-row">
            <span className="pudo-row-label">CAP</span>
            <span className="pudo-row-value">{pudo.cap || '—'}</span>
          </div>

          {pudo.civico && (
            <div className="pudo-row">
              <span className="pudo-row-label">Civico</span>
              <span className="pudo-row-value">{pudo.civico}</span>
            </div>
          )}

          <div className="pudo-row">
            <span className="pudo-row-label">Coordinate</span>
            <span className="pudo-row-value pudo-coords">
              {pudo.lat?.toFixed(5)}, {pudo.lng?.toFixed(5)}
              <a
                className="pudo-map-link"
                href={`https://maps.google.com/?q=${pudo.lat},${pudo.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Mappa
              </a>
            </span>
          </div>

          {/* Orari */}
          {pudo.hours && (
            <>
              <div className="pudo-divider" />
              <div className="pudo-section-title">Orari di apertura</div>
              {Object.entries(pudo.hours).map(([day, slots]) => (
                <div key={day} className={`pudo-row ${!slots ? 'pudo-row-closed' : ''}`}>
                  <span className="pudo-row-label">{DAY_LABELS[day] ?? day}</span>
                  <span className="pudo-row-value">{formatSlots(slots)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
