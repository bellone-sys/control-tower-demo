import { useState } from 'react'
import { FILIALI } from '../../../data/filiali'
import { DRIVERS } from '../../../data/flotta'
import '../Sections.css'

export default function TabTemplate({ templates, setTemplates, onUseTemplate }) {
  const [confirmId, setConfirmId] = useState(null)

  function handleDelete(id) {
    setTemplates(prev => prev.filter(t => t.id !== id))
    setConfirmId(null)
  }

  if (templates.length === 0) {
    return (
      <div className="tpl-empty">
        <div className="tpl-empty-icon">★</div>
        <p style={{ fontWeight: 500, marginBottom: 4 }}>Nessun template salvato</p>
        <p style={{ fontSize: 13 }}>
          Usa il bottone ★ su un giro per salvarlo come template.
        </p>
      </div>
    )
  }

  return (
    <div className="tpl-grid">
      {templates.map(tpl => {
        const filiale = FILIALI.find(f => f.id === tpl.filialeId)
        const driver  = DRIVERS.find(d => d.id === tpl.autoreId)
        const negozi  = tpl.tappe.filter(t => t.tipo === 'negozio').length
        const locker  = tpl.tappe.filter(t => t.tipo === 'locker').length

        return (
          <div className="tpl-card" key={tpl.id}>
            <div className="tpl-card-header">
              <span className="tpl-nome">{tpl.nome}</span>
              {confirmId === tpl.id ? (
                <div className="row-confirm">
                  <button className="btn-confirm-sm" onClick={() => handleDelete(tpl.id)}>Elimina</button>
                  <button className="btn-cancel-sm"  onClick={() => setConfirmId(null)}>Annulla</button>
                </div>
              ) : (
                <button
                  className="btn-icon btn-icon-danger"
                  title="Elimina template"
                  onClick={() => setConfirmId(tpl.id)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="tpl-meta">
              <span>
                <strong>Filiale:</strong> {filiale ? filiale.nome : tpl.filialeId}
              </span>
              <span>
                <strong>Autista:</strong> {driver ? `${driver.cognome} ${driver.nome}` : tpl.autoreId}
              </span>
              {tpl.note && (
                <span style={{ fontStyle: 'italic', color: 'var(--fp-gray-light)' }}>{tpl.note}</span>
              )}
            </div>

            <div className="tpl-tappe-info">
              {tpl.tappe.length} tappe
              {negozi > 0 && <span> · {negozi} negoz{negozi === 1 ? 'io' : 'i'}</span>}
              {locker > 0 && <span> · {locker} locker</span>}
            </div>

            <button
              className="btn-primary"
              style={{ fontSize: 12, padding: '6px 12px', alignSelf: 'flex-start' }}
              onClick={() => onUseTemplate(tpl)}
            >
              Usa Template
            </button>
          </div>
        )
      })}
    </div>
  )
}
