import { useState, useMemo } from 'react'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../../data/flotta'
import '../Sections.css'
import './Flotta.css'

function getCatalog(catalogoId) {
  return MODELLI_MEZZI.find(m => m.catalogoId === catalogoId)
}

const DRIVER_STATO_CFG = {
  'In servizio':  { color: '#2E7D32', bg: '#e8f5e9' },
  'Disponibile':  { color: '#1565C0', bg: '#e3f0fb' },
  'Ferie':        { color: '#F57C00', bg: '#fff3e0' },
  'Malattia':     { color: '#DC0032', bg: '#fff0f3' },
}

export default function TabAssociazioni() {
  // Stato locale — in demo le associazioni sono modificabili in memoria
  const [assoc, setAssoc] = useState(() =>
    DRIVERS.reduce((acc, d) => { acc[d.id] = d.mezzoId; return acc }, {})
  )
  const [editingDriver, setEditingDriver] = useState(null)
  const [pendingMezzo, setPendingMezzo] = useState(null)

  const associati   = DRIVERS.filter(d => assoc[d.id])
  const nonAssociati = DRIVERS.filter(d => !assoc[d.id] && d.stato !== 'Malattia' && d.stato !== 'Ferie')
  const nonDisp     = DRIVERS.filter(d => !assoc[d.id] && (d.stato === 'Malattia' || d.stato === 'Ferie'))

  // Mezzi liberi = non assegnati ad alcun autista
  const mezziOccupati = new Set(Object.values(assoc).filter(Boolean))
  const mezziLiberi   = MEZZI.filter(m => !mezziOccupati.has(m.id) && m.stato !== 'Manutenzione')

  function startAssign(driverId) {
    setEditingDriver(driverId)
    setPendingMezzo(assoc[driverId] || '')
  }

  function confirmAssign(driverId) {
    setAssoc(prev => ({ ...prev, [driverId]: pendingMezzo || null }))
    setEditingDriver(null)
  }

  function removeAssoc(driverId) {
    setAssoc(prev => ({ ...prev, [driverId]: null }))
  }

  return (
    <div className="assoc-layout">

      {/* Summary bar */}
      <div className="assoc-summary">
        <div className="assoc-stat">
          <span className="assoc-stat-val" style={{ color: '#2E7D32' }}>{associati.length}</span>
          <span className="assoc-stat-label">Autisti assegnati</span>
        </div>
        <div className="assoc-stat">
          <span className="assoc-stat-val" style={{ color: '#1565C0' }}>{nonAssociati.length}</span>
          <span className="assoc-stat-label">Autisti disponibili</span>
        </div>
        <div className="assoc-stat">
          <span className="assoc-stat-val" style={{ color: '#2E7D32' }}>{mezziLiberi.length}</span>
          <span className="assoc-stat-label">Mezzi liberi</span>
        </div>
        <div className="assoc-stat">
          <span className="assoc-stat-val" style={{ color: '#DC0032' }}>{MEZZI.filter(m => m.stato === 'Manutenzione').length}</span>
          <span className="assoc-stat-label">Mezzi in manutenzione</span>
        </div>
      </div>

      {/* Associazioni attive */}
      <div className="card">
        <div className="card-header">
          <h3>Associazioni attive</h3>
          <span className="card-label">{associati.length} coppie</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Autista</th>
                <th>Stato</th>
                <th>Patente</th>
                <th>Mezzo</th>
                <th>Targa</th>
                <th>Tipo</th>
                <th>Carburante</th>
                <th>Capacità</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {DRIVERS.filter(d => assoc[d.id]).map(d => {
                const mezzoId = assoc[d.id]
                const mezzo   = MEZZI.find(m => m.id === mezzoId)
                const cat     = mezzo ? getCatalog(mezzo.catalogoId) : null
                const cfg     = DRIVER_STATO_CFG[d.stato] || {}
                const isEditing = editingDriver === d.id

                return (
                  <tr key={d.id} className={isEditing ? 'row-editing' : ''}>
                    <td>
                      <div className="driver-cell">
                        <div className="driver-avatar">{d.nome[0]}{d.cognome[0]}</div>
                        <div>
                          <div className="driver-name">{d.nome} {d.cognome}</div>
                          <div className="td-small">{d.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>{d.stato}</span>
                    </td>
                    <td><span className="patente-badge">{d.patente}</span></td>
                    <td>
                      {isEditing ? (
                        <select
                          className="pr-select"
                          value={pendingMezzo}
                          onChange={e => setPendingMezzo(e.target.value)}
                          autoFocus
                        >
                          <option value="">— Rimuovi assegnazione —</option>
                          {/* Mezzo attuale */}
                          {mezzo && cat && (
                            <option value={mezzo.id}>{cat.marca} {cat.modello.split(' ').slice(0,3).join(' ')} ({mezzo.targa})</option>
                          )}
                          {/* Altri mezzi liberi */}
                          {mezziLiberi.filter(m => m.id !== mezzoId).map(m => {
                            const c = getCatalog(m.catalogoId)
                            return c ? (
                              <option key={m.id} value={m.id}>{c.marca} {c.modello.split(' ').slice(0,3).join(' ')} ({m.targa})</option>
                            ) : null
                          })}
                        </select>
                      ) : (
                        <span className="mezzo-ref">{cat ? `${cat.marca} ${cat.modello.split(' ').slice(0,2).join(' ')}` : '—'}</span>
                      )}
                    </td>
                    <td><strong className="targa">{mezzo?.targa}</strong></td>
                    <td className="td-small">{cat ? { compact:'Compact', medio:'Medio', grande:'Grande' }[cat.tipo] : '—'}</td>
                    <td className="td-small">{cat?.carburante}</td>
                    <td className="td-small">{cat ? `${cat.volumeM3} m³ · ${cat.caricoKg.toLocaleString('it-IT')} kg` : '—'}</td>
                    <td>
                      {isEditing ? (
                        <div className="assoc-actions">
                          <button className="btn-confirm" onClick={() => confirmAssign(d.id)}>Salva</button>
                          <button className="btn-cancel"  onClick={() => setEditingDriver(null)}>Annulla</button>
                        </div>
                      ) : (
                        <div className="assoc-actions">
                          <button className="btn-edit"   onClick={() => startAssign(d.id)}>Modifica</button>
                          <button className="btn-remove" onClick={() => removeAssoc(d.id)}>Rimuovi</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Autisti senza mezzo */}
      {nonAssociati.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Autisti disponibili — senza mezzo</h3>
            <span className="card-label">{nonAssociati.length} autisti</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Autista</th>
                  <th>Patente</th>
                  <th>Contatti</th>
                  <th>Assegna mezzo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {nonAssociati.map(d => {
                  const isEditing = editingDriver === d.id
                  const cfg = DRIVER_STATO_CFG[d.stato] || {}
                  return (
                    <tr key={d.id} className={isEditing ? 'row-editing' : ''}>
                      <td>
                        <div className="driver-cell">
                          <div className="driver-avatar">{d.nome[0]}{d.cognome[0]}</div>
                          <div>
                            <div className="driver-name">{d.nome} {d.cognome}</div>
                            <span className="status-badge" style={{ color: cfg.color, background: cfg.bg, fontSize: 11 }}>{d.stato}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="patente-badge">{d.patente}</span></td>
                      <td className="td-small">{d.telefono}</td>
                      <td>
                        {isEditing ? (
                          <select
                            className="pr-select"
                            value={pendingMezzo}
                            onChange={e => setPendingMezzo(e.target.value)}
                            autoFocus
                          >
                            <option value="">Seleziona un mezzo…</option>
                            {mezziLiberi.map(m => {
                              const c = getCatalog(m.catalogoId)
                              return c ? (
                                <option key={m.id} value={m.id}>{c.marca} {c.modello.split(' ').slice(0,3).join(' ')} ({m.targa}) — {c.tipo}</option>
                              ) : null
                            })}
                          </select>
                        ) : (
                          <span className="td-small text-gray">Nessun mezzo assegnato</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="assoc-actions">
                            <button className="btn-confirm" onClick={() => confirmAssign(d.id)} disabled={!pendingMezzo}>Assegna</button>
                            <button className="btn-cancel" onClick={() => setEditingDriver(null)}>Annulla</button>
                          </div>
                        ) : (
                          <button className="btn-assign" onClick={() => startAssign(d.id)}>+ Assegna mezzo</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Autisti non disponibili */}
      {nonDisp.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Non disponibili (ferie / malattia)</h3>
            <span className="card-label">{nonDisp.length} autisti</span>
          </div>
          <div className="unavail-list">
            {nonDisp.map(d => {
              const cfg = DRIVER_STATO_CFG[d.stato] || {}
              return (
                <div key={d.id} className="unavail-row">
                  <div className="driver-avatar sm">{d.nome[0]}{d.cognome[0]}</div>
                  <span className="driver-name">{d.nome} {d.cognome}</span>
                  <span className="status-badge" style={{ color: cfg.color, background: cfg.bg }}>{d.stato}</span>
                  <span className="td-small text-gray">{d.patente}</span>
                  <span className="td-small text-gray">{d.telefono}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
