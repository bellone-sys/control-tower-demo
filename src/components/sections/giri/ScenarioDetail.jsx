import { useState } from 'react'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../../data/flotta'
import './ScenarioDetail.css'

const GIORNI_LABEL = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

function ciColor(ci) {
  if (ci >= 4)   return '#2E7D32'
  if (ci >= 2.5) return '#E65100'
  return '#1565C0'
}

function formatDurata(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  return `${h}h ${String(m).padStart(2, '0')}min`
}

function formatData(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const STATO_COLOR = {
  'Pianificato': { color: '#1565C0', bg: '#e3f0fb' },
  'In corso':    { color: '#E65100', bg: '#fff3e0' },
  'Completato':  { color: '#2E7D32', bg: '#e8f5e9' },
  'Annullato':   { color: '#DC0032', bg: '#fff0f3' },
}

export default function ScenarioDetail({ scenario, risorse, onBack, onMetaChange, onRisorseChange, addNotification }) {
  const { filiale, giri, ci, kmTotali, tempoMin, pudoCount, tappeCount, meta } = scenario

  const [sched, setSched] = useState(() => meta.schedulazione || {
    dataInizio: new Date().toISOString().slice(0, 10),
    dataFine: '',
    giorni: [1, 2, 3, 4, 5],
    orarioInvio: '',
  })
  const [schedDirty, setSchedDirty] = useState(false)
  const [showRisorse, setShowRisorse] = useState(false)
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

  // Filter resources by filiale
  const mezziFiliale   = MEZZI.filter(m => m.filialeId === filiale.id && m.stato !== 'Manutenzione')
  const driversFiliale = DRIVERS.filter(d => d.filialeId === filiale.id && (d.stato === 'In servizio' || d.stato === 'Disponibile'))

  function toggleGiorno(i) {
    setSched(s => {
      const giorni = s.giorni || []
      const next = giorni.includes(i) ? giorni.filter(x => x !== i) : [...giorni, i].sort((a, b) => a - b)
      return { ...s, giorni: next }
    })
    setSchedDirty(true)
  }

  function saveSched() {
    onMetaChange({ schedulazione: sched })
    setSchedDirty(false)
    addNotification?.('info', 'Schedulazione salvata', 'Le impostazioni di schedulazione sono state aggiornate.')
  }

  function saveRisorse() {
    giri.forEach(g => {
      onRisorseChange(g.id, risorseEdit[g.id])
    })
    setShowRisorse(false)
    addNotification?.('info', 'Risorse assegnate', 'Mezzo e autista aggiornati per tutti i giri.')
  }

  const attivo = !!meta.attivo

  return (
    <div className="section-content">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={onBack} aria-label="Torna agli scenari">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Torna agli scenari
        </button>
        <h2 className="detail-title">
          Dettaglio <span className="text-red">Scenario</span>
          <span className={`sc-stato-badge${attivo ? ' active' : ''}`}>
            {attivo ? 'Attivo' : 'Inattivo'}
          </span>
        </h2>
        <button className="btn-assegna-risorse" onClick={() => setShowRisorse(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Assegna risorse
        </button>
      </div>

      <div className="sc-detail-grid">

        {/* Left col */}
        <div className="sc-detail-left">

          {/* Info card */}
          <div className="card">
            <div className="card-header">
              <h3>{filiale.nome}</h3>
              <span className="card-label">{filiale.citta}</span>
            </div>
            <div className="sc-kpi-grid">
              <div className="sc-kpi">
                <div className="sc-kpi-val" style={{ color: ciColor(ci) }}>{ci.toFixed(2)}</div>
                <div className="sc-kpi-label">CI medio</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{giri.length}</div>
                <div className="sc-kpi-label">Giri</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{pudoCount}</div>
                <div className="sc-kpi-label">PUDO unici</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{tappeCount}</div>
                <div className="sc-kpi-label">Tappe</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{kmTotali} km</div>
                <div className="sc-kpi-label">Km stimati</div>
              </div>
              <div className="sc-kpi">
                <div className="sc-kpi-val">{formatDurata(tempoMin)}</div>
                <div className="sc-kpi-label">Tempo stimato</div>
              </div>
            </div>
          </div>

          {/* Scheduling card */}
          <div className="card">
            <div className="card-header">
              <h3>Schedulazione</h3>
              {schedDirty && (
                <button className="btn-save-sched" onClick={saveSched}>Salva</button>
              )}
            </div>

            {/* Date range */}
            <div className="sched-fields">
              <label className="sched-field">
                <span className="sched-field-label">Data inizio</span>
                <input
                  type="date"
                  className="sched-date-input"
                  value={sched.dataInizio || ''}
                  onChange={e => { setSched(s => ({ ...s, dataInizio: e.target.value })); setSchedDirty(true) }}
                />
              </label>
              <label className="sched-field">
                <span className="sched-field-label">Data fine</span>
                <input
                  type="date"
                  className="sched-date-input"
                  value={sched.dataFine || ''}
                  onChange={e => { setSched(s => ({ ...s, dataFine: e.target.value })); setSchedDirty(true) }}
                />
              </label>
            </div>

            {/* Giorni attivi */}
            <div className="sched-label-row">
              <span className="sched-field-label">Giorni attivi</span>
            </div>
            <div className="sched-giorni-edit">
              {GIORNI_LABEL.map((g, i) => (
                <button
                  key={i}
                  className={`sched-giorno-btn${sched.giorni?.includes(i) ? ' on' : ''}`}
                  onClick={() => toggleGiorno(i)}
                >{g}</button>
              ))}
            </div>

            {/* Orario invio percorsi */}
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
                placeholder="HH:MM"
                onChange={e => { setSched(s => ({ ...s, orarioInvio: e.target.value })); setSchedDirty(true) }}
              />
              <span className="sched-invio-hint">
                {sched.orarioInvio
                  ? `I percorsi saranno inviati automaticamente alle ${sched.orarioInvio}`
                  : 'Nessun invio automatico'}
              </span>
            </div>
          </div>

        </div>

        {/* Right col: giri table */}
        <div className="sc-detail-right">
          <div className="card">
            <h3>Giri dello scenario</h3>
            <div className="table-wrap">
              <table className="data-table sc-giri-table">
                <thead>
                  <tr>
                    <th>Giro</th>
                    <th>Stato</th>
                    <th>Mezzo</th>
                    <th>Autista</th>
                    <th>km</th>
                    <th>Durata</th>
                    <th>CI</th>
                  </tr>
                </thead>
                <tbody>
                  {giri.map(g => {
                    const r = risorse[g.id]
                    const mezzoId  = r?.mezzoId  ?? g.mezzoId
                    const autoreId = r?.autoreId ?? g.autoreId
                    const mezzo    = MEZZI.find(m => m.id === mezzoId)
                    const modello  = mezzo ? MODELLI_MEZZI.find(mm => mm.catalogoId === mezzo.catalogoId) : null
                    const driver   = DRIVERS.find(d => d.id === autoreId)
                    const risorseOk = !!(mezzoId && autoreId)
                    const statoStyle = STATO_COLOR[g.stato] || {}
                    return (
                      <tr key={g.id} className={risorseOk ? '' : 'tr-missing'}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{g.nome}</div>
                          <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{g.id}</div>
                        </td>
                        <td>
                          <span className="status-badge" style={{ color: statoStyle.color, background: statoStyle.bg, fontSize: 11 }}>
                            {g.stato}
                          </span>
                        </td>
                        <td>
                          {mezzo ? (
                            <>
                              <div style={{ fontWeight: 500 }}>{mezzo.targa}</div>
                              {modello && <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>{modello.marca} {modello.modello.split(' ')[0]}</div>}
                            </>
                          ) : (
                            <span className="res-missing">Non assegnato</span>
                          )}
                        </td>
                        <td>
                          {driver
                            ? `${driver.cognome} ${driver.nome}`
                            : <span className="res-missing">Non assegnato</span>
                          }
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{g.distanzaKm ?? '—'} km</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{g.durataMin ? formatDurata(g.durataMin) : '—'}</td>
                        <td style={{ color: ciColor(g.ci), fontWeight: 700 }}>{g.ci.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Resource assignment modal */}
      {showRisorse && (
        <div className="risorse-modal-backdrop" onClick={() => setShowRisorse(false)}>
          <div className="risorse-modal" onClick={e => e.stopPropagation()}>
            <div className="risorse-modal-header">
              <h3>Assegna risorse — {filiale.nome}</h3>
              <button className="risorse-modal-close" onClick={() => setShowRisorse(false)}>×</button>
            </div>
            <div className="risorse-modal-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Visualizzati solo mezzi e autisti assegnati alla filiale <strong>{filiale.nome}</strong>
            </div>
            <div className="risorse-modal-body">
              <table className="risorse-table">
                <thead>
                  <tr>
                    <th>Giro</th>
                    <th>Mezzo ({mezziFiliale.length} disponibili)</th>
                    <th>Autista ({driversFiliale.length} disponibili)</th>
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
            <div className="risorse-modal-footer">
              <button className="btn-cancel-modal" onClick={() => setShowRisorse(false)}>Annulla</button>
              <button className="btn-confirm-modal" onClick={saveRisorse}>Salva assegnazioni</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
