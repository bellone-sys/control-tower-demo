import { useState, useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Marker } from 'react-leaflet'
import { FILIALI } from '../../../../data/filiali'
import { FILIALI_BRT } from '../../../../data/filialiBrt'
import pudosRoma from '../../../../data/pudosRoma.json'
import TutorialOverlay from '../../../tutorials/TutorialOverlay'
import FilialeSelector from './FilialeSelector'
import 'leaflet/dist/leaflet.css'

const MONTHS_IT = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

function isLocker(p) {
  return p.name.toLowerCase().includes('locker')
}

function makeLockerIcon() {
  return L.divIcon({
    html: `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="9" height="9" rx="2" fill="#414042" stroke="white" stroke-width="1"/>
    </svg>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  })
}

const LOCKER_ICON = makeLockerIcon()

export default function WizardStep1({ data, onChange, errors = [] }) {
  // Handle filiale selection (both Fermopoint and BRT from suggestion)
  const handleFilialeSelect = (filialeId) => {
    // Check if it's a Fermopoint or BRT
    const fpFiliale = FILIALI.find(f => f.id === filialeId)
    const brtFiliale = FILIALI_BRT.find(f => f.id === filialeId)

    if (fpFiliale) {
      // Auto-generate scenario name
      const now = new Date()
      const mese = MONTHS_IT[now.getMonth()]
      const anno = now.getFullYear()
      onChange({ filialeId, province: [], nomeScenario: `${fpFiliale.nome} — ${mese} ${anno}` })
    } else if (brtFiliale) {
      const extraFiliali = [...(data.extraFiliali || []), brtFiliale]
      // Auto-generate scenario name
      const now = new Date()
      const mese = MONTHS_IT[now.getMonth()]
      const anno = now.getFullYear()
      onChange({ extraFiliali, filialeId, province: [], nomeScenario: `${brtFiliale.nome} — ${mese} ${anno}` })
    }
  }

  // Auto-populate scenario name based on selected filiale
  useEffect(() => {
    if (!data.nomeScenario.trim() && data.filialeId) {
      const allFilialiCombo = [
        ...FILIALI.map(f => ({ ...f, tipo: 'fp' })),
        ...(data.extraFiliali || []).map(f => ({ ...f, tipo: 'brt' })),
      ]
      const filiale = allFilialiCombo.find(f => f.id === data.filialeId)
      if (filiale) {
        const now = new Date()
        const mese = MONTHS_IT[now.getMonth()]
        const anno = now.getFullYear()
        onChange({ nomeScenario: `${filiale.nome} — ${mese} ${anno}` })
      }
    }
  }, [data.filialeId, data.extraFiliali])

  const allFilialiCombo = [
    ...FILIALI.map(f => ({ ...f, tipo: 'fp' })),
    ...(data.extraFiliali || []).map(f => ({ ...f, tipo: 'brt' })),
  ]

  const selectedFiliale = allFilialiCombo.find(f => f.id === data.filialeId) || null

  // Validation flags
  const errNome    = errors.some(e => e.toLowerCase().includes('nome'))
  const errFiliale = errors.some(e => e.toLowerCase().includes('filiale'))

  // Split PUDOs into lockers and regular for map rendering
  const { pudosRegolari, pudosLocker } = useMemo(() => ({
    pudosRegolari: pudosRoma.slice(0, 800).filter(p => !isLocker(p)),
    pudosLocker:   pudosRoma.slice(0, 800).filter(p =>  isLocker(p)),
  }), [])

  // Map center: filiale or Rome default
  const mapCenter = (selectedFiliale?.lat != null && selectedFiliale?.lng != null)
    ? [selectedFiliale.lat, selectedFiliale.lng]
    : [41.9028, 12.4964]

  return (
    <div className="wizard-step-layout">
      <TutorialOverlay
        id="scenario_wizard_step1"
        title="📍 Step 1: Area e Filiale"
        description="Scegli una filiale di riferimento (Fermopoint o BRT). In alternativa puoi selezionare manualmente le province di interesse."
        position="bottom-right"
      />

      {/* Left panel */}
      <div className="wizard-side-panel">

        {/* Nome scenario */}
        <div className="ws-row">
          <div className="ws-section-title">
            Nome scenario <span style={{ color: 'var(--fp-red)' }}>*</span>
          </div>
          <input
            className={`wizard-nome-input${errNome ? ' ws-input-error' : ''}`}
            type="text"
            placeholder="Es. Roma Est — Aprile 2026"
            value={data.nomeScenario}
            onChange={e => onChange({ nomeScenario: e.target.value })}
            maxLength={60}
          />
          {errNome && (
            <div className="ws-field-error">Inserisci un nome per lo scenario</div>
          )}
        </div>

        {/* Filiale selector con tab Fermopoint e Suggerimento intelligente */}
        <div className="ws-row">
          <FilialeSelector
            selectedFilialeId={data.filialeId}
            onSelect={handleFilialeSelect}
            errors={errors}
          />
        </div>
      </div>

      {/* Map panel */}
      <div className="wizard-map-panel">
        <MapContainer
          key={`step1-${data.filialeId}`}
          center={mapCenter}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* PUDO regolari — cerchio */}
          {pudosRegolari.map(p => (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={5}
              pathOptions={{ color: '#414042', fillColor: '#414042', fillOpacity: 0.7, weight: 1 }}
              eventHandlers={{
                mouseover: (e) => e.target.bindTooltip(
                  `<b>${p.name}</b><br/><span style="font-size:10px;opacity:.75">${p.id} · ${p.cap}</span>`,
                  { direction: 'top', offset: L.point(0, -8) }
                ).openTooltip(),
                mouseout: (e) => { e.target.closeTooltip(); e.target.unbindTooltip() },
              }}
            />
          ))}

          {/* Locker — icona quadrata */}
          {pudosLocker.map(p => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={LOCKER_ICON}
              eventHandlers={{
                mouseover: (e) => e.target.bindTooltip(
                  `<b>🔒 ${p.name}</b><br/><span style="font-size:10px;opacity:.75">${p.id} · ${p.cap}</span>`,
                  { direction: 'top', offset: L.point(0, -10) }
                ).openTooltip(),
                mouseout: (e) => { e.target.closeTooltip(); e.target.unbindTooltip() },
              }}
            />
          ))}

          {/* Filiale depot marker */}
          {selectedFiliale?.lat != null && (
            <CircleMarker
              center={[selectedFiliale.lat, selectedFiliale.lng]}
              radius={14}
              pathOptions={{ color: selectedFiliale.tipo === 'brt' ? '#1565C0' : '#DC0032', fillColor: selectedFiliale.tipo === 'brt' ? '#1565C0' : '#DC0032', fillOpacity: 1, weight: 2 }}
              eventHandlers={{
                add: (e) => e.target.bindTooltip(`🏢 ${selectedFiliale.nome}`, { permanent: true, direction: 'top', offset: L.point(0, -14) }),
              }}
            />
          )}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#414042', flexShrink: 0 }} />
            <span>PUDO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#414042', flexShrink: 0 }} />
            <span>Locker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC0032', flexShrink: 0 }} />
            <span>Filiale</span>
          </div>
        </div>
      </div>

    </div>
  )
}
