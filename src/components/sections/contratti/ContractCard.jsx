import { useState } from 'react'
import './ContractCard.css'

/**
 * ContractCard - Display individual contract details with expand/collapse
 * Shows contract metadata with option to view full details
 */
export default function ContractCard({
  contract,
  onDelete,
  onEdit,
  variant = 'vehicle', // 'vehicle', 'courier', 'handler'
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateStr) => {
    if (!dateStr) return '–'
    try {
      const [day, month, year] = dateStr.split(/[\/\-\.]/)
      return new Date(`${year}-${month}-${day}`).toLocaleDateString('it-IT')
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('it-IT', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  const getStatusColor = (dataFine) => {
    if (!dataFine) return 'unknown'
    const expireDate = new Date(dataFine.split(/[\/\-\.]/).reverse().join('-'))
    const today = new Date()
    const daysLeft = Math.floor((expireDate - today) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return 'expired'
    if (daysLeft < 30) return 'expiring'
    return 'active'
  }

  const getStatusLabel = (dataFine) => {
    const status = getStatusColor(dataFine)
    switch (status) {
      case 'expired':
        return 'Scaduto'
      case 'expiring':
        return 'In scadenza'
      case 'active':
        return 'Attivo'
      default:
        return 'Sconosciuto'
    }
  }

  const status = getStatusColor(contract.dataFine)

  return (
    <div className={`contract-card contract-card-${variant} contract-status-${status}`}>
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{contract.fornitore}</h3>
          <span className={`status-badge status-${status}`}>{getStatusLabel(contract.dataFine)}</span>
        </div>
        <button className="card-expand-btn" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Chiudi' : 'Espandi'}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className="card-summary">
        <div className="summary-item">
          <span className="summary-label">Contratto</span>
          <span className="summary-value">{contract.contrattoNum}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Importo</span>
          <span className="summary-value">{formatCurrency(contract.importoAnnuale)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Scadenza</span>
          <span className="summary-value">{formatDate(contract.dataFine)}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="card-details">
          <div className="details-grid">
            <div className="detail-group">
              <label>Numero Contratto</label>
              <div className="detail-value">{contract.contrattoNum}</div>
            </div>

            <div className="detail-group">
              <label>Fornitore</label>
              <div className="detail-value">{contract.fornitore}</div>
            </div>

            <div className="detail-group">
              <label>Tipo</label>
              <div className="detail-value">{contract.tipo}</div>
            </div>

            <div className="detail-group">
              <label>Data Inizio</label>
              <div className="detail-value">{formatDate(contract.dataInizio)}</div>
            </div>

            <div className="detail-group">
              <label>Data Scadenza</label>
              <div className="detail-value">{formatDate(contract.dataFine)}</div>
            </div>

            <div className="detail-group">
              <label>Importo Annuale</label>
              <div className="detail-value">{formatCurrency(contract.importoAnnuale)}</div>
            </div>
          </div>

          {contract.fileName && (
            <div className="file-reference">
              <span className="file-icon">📄</span>
              <span className="file-name">{contract.fileName}</span>
            </div>
          )}

          <div className="card-actions">
            {onEdit && (
              <button className="action-btn action-edit" onClick={() => onEdit(contract)}>
                Modifica
              </button>
            )}
            {onDelete && (
              <button className="action-btn action-delete" onClick={() => onDelete(contract.id)}>
                Elimina
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
