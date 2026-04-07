import { useState } from 'react'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../../data/flotta'

export default function RisorseModal({ scenario, risorse, onSave, onClose }) {
  const { filiale, giri } = scenario

  const mezziFiliale   = MEZZI.filter(m => m.filialeId === filiale.id && m.stato !== 'Manutenzione')
  const driversFiliale = DRIVERS.filter(d => d.filialeId === filiale.id && (d.stato === 'In servizio' || d.stato === 'Disponibile'))

  const [risorseEdit, setRisorseEdit] = useState(() => {
    const map = {}
    giri.forEach(g => {
      const r = risorse[g.id]
      map[g.id] = {
        mezzoId:  r?.mezzoId  ?? g.mezzoId  ?? '',
        autoreId: r?.autoreId ?? g.autoreId ?? '',
      }
    })
    return map
  })

  function handleSave() {
    onSave(risorseEdit)
    onClose()
  }

  return (
    <div className="sc-modal-backdrop" onClick={onClose}>
      <div className="sc-modal sc-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="sc-modal-header">
          <div>
            <div className="sc-modal-title">Assegna risorse</div>
            <div className="sc-modal-sub">{filiale.nome} · {filiale.citta}</div>
          </div>
          <button className="sc-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="risorse-modal-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Solo mezzi e autisti della filiale <strong>{filiale.nome}</strong>
          &nbsp;—&nbsp;{mezziFiliale.length} mezzi · {driversFiliale.length} autisti disponibili
        </div>

        <div className="risorse-modal-body">
          <table className="risorse-table">
            <thead>
              <tr>
                <th>Giro</th>
                <th>Mezzo</th>
                <th>Autista</th>
              </tr>
            </thead>
            <tbody>
              {giri.map(g => (
                <tr key={g.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{g.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{g.id}</div>
                  </td>
                  <td>
                    <select
                      className="risorse-select"
                      value={risorseEdit[g.id]?.mezzoId || ''}
                      onChange={e => setRisorseEdit(prev => ({
                        ...prev,
                        [g.id]: { ...prev[g.id], mezzoId: e.target.value }
                      }))}
                    >
                      <option value="">— Seleziona mezzo —</option>
                      {mezziFiliale.map(m => {
                        const mod = MODELLI_MEZZI.find(mm => mm.catalogoId === m.catalogoId)
                        return (
                          <option key={m.id} value={m.id}>
                            {m.targa}{mod ? ` — ${mod.marca} ${mod.modello.split(' ')[0]}` : ''} ({m.stato})
                          </option>
                        )
                      })}
                    </select>
                  </td>
                  <td>
                    <select
                      className="risorse-select"
                      value={risorseEdit[g.id]?.autoreId || ''}
                      onChange={e => setRisorseEdit(prev => ({
                        ...prev,
                        [g.id]: { ...prev[g.id], autoreId: e.target.value }
                      }))}
                    >
                      <option value="">— Seleziona autista —</option>
                      {driversFiliale.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.cognome} {d.nome} — {d.patente} ({d.stato})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sc-modal-footer">
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn-cancel-modal" onClick={onClose}>Annulla</button>
            <button className="btn-confirm-modal" onClick={handleSave}>Salva assegnazioni</button>
          </div>
        </div>
      </div>
    </div>
  )
}
