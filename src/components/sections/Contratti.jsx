import { useState, useEffect } from 'react'
import ContractUploadZone from './contratti/ContractUploadZone'
import ContractCard from './contratti/ContractCard'
import './Contratti.css'

/**
 * Contratti (Contract Management)
 * v0.10.0: Full implementation with 3 tabs (Noleggio Mezzi, Corrieri, Operatori Handling)
 * Features: PDF upload with AI extraction, contract listing, status tracking
 */
export default function Contratti() {
  const [activeTab, setActiveTab] = useState('vehicles')
  const [contracts, setContracts] = useState({
    vehicles: [],
    couriers: [],
    handlers: [],
  })
  const [error, setError] = useState(null)

  // Load contracts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fp_ct_contracts')
    if (saved) {
      try {
        setContracts(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading contracts:', e)
      }
    }
  }, [])

  // Save contracts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fp_ct_contracts', JSON.stringify(contracts))
  }, [contracts])

  const handleContractExtracted = (extractedData) => {
    const newContract = {
      id: Date.now().toString(),
      ...extractedData,
      uploadedAt: new Date().toISOString(),
      validation: extractedData.validation,
    }

    // Determine which tab based on tipo or add to vehicles by default
    let tab = 'vehicles'
    const tipo = (extractedData.tipo || '').toLowerCase()
    if (tipo.includes('corriere') || tipo.includes('courier')) {
      tab = 'couriers'
    } else if (tipo.includes('handler') || tipo.includes('operatore')) {
      tab = 'handlers'
    }

    setContracts(prev => ({
      ...prev,
      [tab]: [...prev[tab], newContract],
    }))

    setError(null)
  }

  const handleDeleteContract = (contractId) => {
    if (window.confirm('Eliminare questo contratto?')) {
      setContracts(prev => ({
        vehicles: prev.vehicles.filter(c => c.id !== contractId),
        couriers: prev.couriers.filter(c => c.id !== contractId),
        handlers: prev.handlers.filter(c => c.id !== contractId),
      }))
    }
  }

  const handleError = (errorMsg) => {
    setError(errorMsg)
  }

  const currentContracts = contracts[activeTab] || []
  const tabConfig = {
    vehicles: {
      label: '🚚 Noleggio Mezzi',
      description: 'Contratti di noleggio veicoli e mezzi logistici',
      variant: 'vehicle',
    },
    couriers: {
      label: '👤 Corrieri Dipendenti/Esterni',
      description: 'Contratti con corrieri dipendenti e fornitori di servizi logistici',
      variant: 'courier',
    },
    handlers: {
      label: '⚙️ Operatori Handling',
      description: 'Contratti con operatori specializzati in handling e magazzinage',
      variant: 'handler',
    },
  }

  return (
    <section className="contratti-section">
      <div className="section-header">
        <h1>📋 Contratti</h1>
        <p>Gestione contrattuale con fornitori, corrieri e operatori logistici.</p>
      </div>

      {/* Tabs */}
      <div className="contratti-tabs">
        {Object.entries(tabConfig).map(([tabKey, config]) => (
          <button
            key={tabKey}
            className={`contratti-tab ${activeTab === tabKey ? 'active' : ''}`}
            onClick={() => setActiveTab(tabKey)}
          >
            {config.label}
            {contracts[tabKey].length > 0 && <span className="tab-count">{contracts[tabKey].length}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="contratti-content">
        <div className="tab-description">{tabConfig[activeTab].description}</div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Upload Section */}
        <div className="contratti-upload-section">
          <h3>Carica nuovo contratto</h3>
          <ContractUploadZone onContractExtracted={handleContractExtracted} onError={handleError} />
        </div>

        {/* Contracts List */}
        {currentContracts.length > 0 ? (
          <div className="contratti-list-section">
            <h3>Contratti in archivio ({currentContracts.length})</h3>
            <div className="contratti-list">
              {currentContracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  variant={tabConfig[activeTab].variant}
                  onDelete={handleDeleteContract}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="contratti-empty">
            <div className="empty-icon">📋</div>
            <h3>Nessun contratto caricato</h3>
            <p>Carica il primo contratto usando la sezione upload qui sopra.</p>
          </div>
        )}
      </div>
    </section>
  )
}
