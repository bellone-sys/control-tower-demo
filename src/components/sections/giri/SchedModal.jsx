import { useState } from 'react'

const GIORNI_LABEL = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

export default function SchedModal({ scenario, onSave, onClose }) {
  const existing = scenario.meta.schedulazione
  const [sched, setSched] = useState(() => existing || {
    dataInizio: new Date().toISOString().slice(0, 10),
    dataFine: '',
    giorni: [1, 2, 3, 4, 5],
    orarioInvio: '',
  })

  function toggleGiorno(i) {
    setSched(s => {
      const giorni = s.giorni || []
      const next = giorni.includes(i)
        ? giorni.filter(x => x !== i)
        : [...giorni, i].sort((a, b) => a - b)
      return { ...s, giorni: next }
    })
  }

  function handleSave() {
    onSave({ schedulazione: sched })
    onClose()
  }

  function handleRemove() {
    onSave({ schedulazione: null })
    onClose()
  }

  return (
    <div className="sc-modal-backdrop" onClick={onClose}>
      <div className="sc-modal" onClick={e => e.stopPropagation()}>
        <div className="sc-modal-header">
          <div>
            <div className="sc-modal-title">Schedulazione</div>
            <div className="sc-modal-sub">{scenario.filiale.nome} · {scenario.filiale.citta}</div>
          </div>
          <button className="sc-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="sc-modal-body">
          {/* Date range */}
          <div className="sched-fields">
            <label className="sched-field">
              <span className="sched-field-label">Data inizio</span>
              <input
                type="date"
                className="sched-date-input"
                value={sched.dataInizio || ''}
                onChange={e => setSched(s => ({ ...s, dataInizio: e.target.value }))}
              />
            </label>
            <label className="sched-field">
              <span className="sched-field-label">Data fine</span>
              <input
                type="date"
                className="sched-date-input"
                value={sched.dataFine || ''}
                onChange={e => setSched(s => ({ ...s, dataFine: e.target.value }))}
              />
            </label>
          </div>

          {/* Giorni */}
          <div className="sched-label-row"><span className="sched-field-label">Giorni attivi</span></div>
          <div className="sched-giorni-edit">
            {GIORNI_LABEL.map((g, i) => (
              <button
                key={i}
                className={`sched-giorno-btn${sched.giorni?.includes(i) ? ' on' : ''}`}
                onClick={() => toggleGiorno(i)}
              >{g}</button>
            ))}
          </div>

          {/* Orario invio */}
          <div className="sched-label-row" style={{ marginTop: 14 }}>
            <span className="sched-field-label">Invio percorsi ai driver</span>
          </div>
          <div className="sched-invio-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--fp-gray-mid)', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <input
              type="time"
              className="sched-date-input sched-time-input"
              value={sched.orarioInvio || ''}
              onChange={e => setSched(s => ({ ...s, orarioInvio: e.target.value }))}
            />
            <span className="sched-invio-hint">
              {sched.orarioInvio
                ? `Invio automatico alle ${sched.orarioInvio}`
                : 'Nessun invio automatico'}
            </span>
          </div>
        </div>

        <div className="sc-modal-footer">
          {existing && (
            <button className="sc-modal-btn-danger" onClick={handleRemove}>Rimuovi schedulazione</button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-cancel-modal" onClick={onClose}>Annulla</button>
            <button className="btn-confirm-modal" onClick={handleSave}>Salva</button>
          </div>
        </div>
      </div>
    </div>
  )
}
