import { useState } from 'react'
import { FILIALI } from '../../../../data/filiali'
import FilialeSmartSuggestion from './FilialeSmartSuggestion'
import './FilialeSelector.css'

export default function FilialeSelector({ selectedFilialeId, onSelect, errors = [] }) {
  const [activeTab, setActiveTab] = useState('fermopoint')

  const errFiliale = errors.some(e => e.toLowerCase().includes('filiale'))

  return (
    <div className="fs-container">
      {/* Section Header */}
      <div className="fs-header">
        <div className="fs-title">
          Filiale di riferimento <span style={{ color: 'var(--fp-red)' }}>*</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="fs-tabs">
        <button
          className={`fs-tab${activeTab === 'fermopoint' ? ' active' : ''}`}
          onClick={() => setActiveTab('fermopoint')}
        >
          Fermopoint
        </button>
        <button
          className={`fs-tab${activeTab === 'suggestion' ? ' active' : ''}`}
          onClick={() => setActiveTab('suggestion')}
        >
          💡 Suggerimento intelligente
        </button>
      </div>

      {/* Tab Content */}
      <div className={`fs-tab-content${errFiliale ? ' fs-error-state' : ''}`}>
        {/* Fermopoint Tab */}
        {activeTab === 'fermopoint' && (
          <div className="fs-fermopoint-list">
            {FILIALI.map(f => (
              <button
                key={f.id}
                className={`fs-filiale-item${selectedFilialeId === f.id ? ' selected' : ''}`}
                onClick={() => onSelect(f.id)}
              >
                <div className="fs-avatar">
                  {f.nome.charAt(0)}
                </div>
                <div className="fs-info">
                  <div className="fs-nome">{f.nome}</div>
                  <div className="fs-citta">{f.citta} ({f.provincia})</div>
                </div>
                {selectedFilialeId === f.id && (
                  <span className="fs-check">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Suggestion Tab */}
        {activeTab === 'suggestion' && (
          <FilialeSmartSuggestion onSelect={onSelect} />
        )}
      </div>

      {/* Error Message */}
      {errFiliale && (
        <div className="fs-field-error">Seleziona una filiale di riferimento</div>
      )}
    </div>
  )
}
