import React, { useState } from 'react'
import pudosRoma from '../../../../data/pudosRoma.json'
import { FILIALI } from '../../../../data/filiali'
import { getCiPudo } from '../../../../data/spedizioni'
import WizardStep1 from './WizardStep1'
import WizardStep2 from './WizardStep2'
import WizardStep3 from './WizardStep3'
import WizardStep4 from './WizardStep4'
import WizardStep5 from './WizardStep5'
import './ScenarioWizard.css'
// Reuse province dropdown CSS
import '../../../sections/spedizioni/ImportModal.css'

const STEPS = [
  { id: 1, label: 'Area & Filiale' },
  { id: 2, label: 'Filtri' },
  { id: 3, label: 'Selezione PUDO' },
  { id: 4, label: 'Parametri routing' },
  { id: 5, label: 'Conferma' },
]

const INIT_DATA = {
  // Step 1
  nomeScenario: '',
  province: [],
  filialeId: null,
  extraFiliali: [],
  periodoGg: 60,

  // Step 2
  ciMin: 0,
  raggioKm: 40,

  // Step 3
  pudoSelezionati: new Set(),

  // Step 4
  dataGiri: new Date().toISOString().split('T')[0],
  oraTurnoStart: '07:00',
  oraTurnoEnd: '17:00',
  numMezzi: 3,
  balancing: 'ON',
  balanceBy: 'WT',
  balancingFactor: 0.3,
  clustering: false,
  depotTrips: false,
  depotVisitDuration: 15,
  pesoMaxKg: 700,
  volumeMaxM3: 8,
  compartimentazione: false,
  durataFermata: 12,
  prioritaDefault: 'M',
}

function validate(step, data) {
  const errors = []
  if (step === 1) {
    if (!data.nomeScenario.trim()) errors.push('Inserisci un nome per lo scenario.')
    if (!data.filialeId) errors.push('Seleziona una filiale di riferimento.')
  }
  if (step === 3) {
    if (data.pudoSelezionati.size === 0) errors.push('Seleziona almeno un PUDO.')
  }
  if (step === 4) {
    if (!data.dataGiri) errors.push('Seleziona la data dei giri.')
  }
  return errors
}

export default function ScenarioWizard({ existingScenario, onClose, onConfirm }) {
  const [step, setStep]   = useState(1)
  const [data, setData]   = useState(existingScenario ? { ...INIT_DATA, ...existingScenario } : { ...INIT_DATA })
  const [errors, setErrors] = useState([])

  console.log('[ScenarioWizard] render — step:', step, '| filialeId:', data.filialeId, '| mode:', existingScenario ? 'edit' : 'new')

  function updateData(partial) {
    setData(prev => ({ ...prev, ...partial }))
    if (errors.length) setErrors([])
  }

  function goNext() {
    const errs = validate(step, data)
    if (errs.length) { setErrors(errs); return }
    setErrors([])

    // Auto-populate PUDO selection when moving from step 2 to 3
    if (step === 2 && data.pudoSelezionati.size === 0) {
      const allFiliali = [...FILIALI, ...(data.extraFiliali || [])]
      const filiale = allFiliali.find(f => f.id === data.filialeId)

      function distKm(lat1, lng1, lat2, lng2) {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      }

      const autoSelected = new Set(
        pudosRoma
          .filter(p => {
            const ci = getCiPudo(p.id, data.periodoGg)
            if (ci < data.ciMin) return false
            if (filiale) {
              const dist = distKm(filiale.lat, filiale.lng, p.lat, p.lng)
              if (dist > data.raggioKm) return false
            }
            return true
          })
          .map(p => p.id)
      )
      setData(prev => ({ ...prev, pudoSelezionati: autoSelected }))
    }

    setStep(s => s + 1)
  }

  function goBack() {
    setErrors([])
    setStep(s => s - 1)
  }

  function handleConfirm() {
    const errs = validate(step, data)
    if (errs.length) { setErrors(errs); return }
    onConfirm(data)
  }

  const isLast = step === STEPS.length

  const stepComponents = {
    1: <WizardStep1 data={data} onChange={updateData} />,
    2: <WizardStep2 data={data} onChange={updateData} />,
    3: <WizardStep3 data={data} onChange={updateData} />,
    4: <WizardStep4 data={data} onChange={updateData} />,
    5: <WizardStep5 data={data} onChange={updateData} />,
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard-panel">
        {/* Header */}
        <div className="wizard-header">
          <div>
            <div className="wizard-header-title">
              {existingScenario ? '✏️ Modifica scenario' : '+ Nuovo scenario'}
            </div>
            <div className="wizard-header-subtitle">
              {data.nomeScenario || 'Scenario senza nome'}
            </div>
          </div>
          <button className="wizard-header-close" onClick={onClose} title="Chiudi senza salvare">×</button>
        </div>

        {/* Stepper */}
        <div className="wizard-stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={`wizard-step-item${step === s.id ? ' active' : step > s.id ? ' done' : ''}`}
              >
                <div className="wizard-step-num">
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className="wizard-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="wizard-step-connector" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="wizard-body">
          {stepComponents[step]}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <div className="wizard-footer-left">
            <button className="btn-secondary" onClick={step === 1 ? onClose : goBack}>
              {step === 1 ? 'Annulla' : '← Indietro'}
            </button>
            {errors.length > 0 && (
              <div className="wizard-validation-errors">
                {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="wizard-footer-step-info">
              Passo {step} di {STEPS.length}
            </span>
            {isLast ? (
              <button className="btn-primary" onClick={handleConfirm}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Invia a OptimoRoute
              </button>
            ) : (
              <button className="btn-primary" onClick={goNext}>
                Avanti →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
