import { useState, useMemo } from 'react'
import { FILIALI } from '../../../data/filiali'
import { getCiGiro } from '../../../data/spedizioni'
import { getFavorites } from '../../../services/scenarioFavorites'
import './TabScenari.css'

function ciColor(ci) {
  if (ci >= 4)   return '#2E7D32'
  if (ci >= 2.5) return '#E65100'
  return '#1565C0'
}

function formatData(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/**
 * TabPreferiti - Display favorite scenarios
 * Note: This is a placeholder implementation showing the structure
 * In a full implementation, scenarios would be saved with metadata
 * and retrieved from storage for display with CI calculations
 */
export default function TabPreferiti() {
  const [periodo, setPeriodo] = useState(30)
  const PERIODI = [7, 14, 30, 60]

  const favorites = useMemo(() => {
    const favIds = getFavorites()
    // Placeholder: In a full implementation, we would retrieve scenario
    // metadata from storage and display them here with CI calculations
    return favIds
  }, [])

  if (favorites.length === 0) {
    return (
      <div className="empty-state">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          color: 'var(--fp-gray-mid)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>★</div>
          <h3 style={{ color: 'var(--fp-charcoal)', marginBottom: 8 }}>Nessun scenario preferito</h3>
          <p>
            Salva uno o più scenari come preferiti durante la creazione per accedervi rapidamente qui.
            Usa il bottone ❤️ nella conferma dello scenario.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="scenari-toolbar">
        <span className="scenari-title">Scenari Preferiti</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="scenari-period-label">Periodo CI:</span>
          <div className="carb-range-tabs">
            {PERIODI.map(p => (
              <button
                key={p}
                className={`carb-range-tab${periodo === p ? ' active' : ''}`}
                onClick={() => setPeriodo(p)}
              >
                {p}gg
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--fp-gray-mid)' }}>
            {favorites.length} scenario{favorites.length !== 1 ? 'i' : ''}
          </span>
        </div>
      </div>

      <div style={{
        padding: '20px 0',
        color: 'var(--fp-gray-mid)',
        fontSize: 13,
        textAlign: 'center',
      }}>
        <p>
          In questa sezione appariranno tutti gli scenari che hai marcato come preferiti.
          <br />
          Per visualizzare e gestire gli scenari completi, vai alla sezione <strong>Scenari</strong>.
        </p>
      </div>

      <div className="info-box" style={{
        padding: '16px',
        background: 'var(--fp-gray-light-bg)',
        border: '1px solid var(--fp-gray-light)',
        borderRadius: 'var(--radius)',
        marginTop: '20px',
      }}>
        <strong>💡 Nota:</strong> La gestione completa dei preferiti (salvataggio, recall, modifica) sarà disponibile in v0.11.0 con un sistema di persistence avanzato per scenari. Attualmente i preferiti sono salvati nel browser.
      </div>
    </div>
  )
}
