import { MODELLI_MEZZI } from '../../../../data/flotta'
import { SPEDIZIONI_INIT } from '../../../../data/spedizioni'

function tipoIcon(m) {
  if (m.carburante === 'Elettrico') return '⚡'
  if (m.tipo === 'grande') return '🚛'
  return '🚐'
}

export default function WizardStep4({ data, onChange }) {
  function toggle(field) {
    onChange({ [field]: !data[field] })
  }

  const today = new Date().toISOString().split('T')[0]

  // ── Flotta ─────────────────────────────────────────────────────────────────
  const flotta = data.flotta ?? [{ modelloId: 'CAT005', quantita: 3 }]

  function setFlotta(next) { onChange({ flotta: next }) }

  function addModello(modelloId) {
    if (flotta.some(r => r.modelloId === modelloId)) return
    setFlotta([...flotta, { modelloId, quantita: 1 }])
  }

  function removeModello(modelloId) {
    setFlotta(flotta.filter(r => r.modelloId !== modelloId))
  }

  function setQuantita(modelloId, q) {
    setFlotta(flotta.map(r => r.modelloId === modelloId ? { ...r, quantita: Math.max(1, q) } : r))
  }

  // Capacità totale flotta
  const totalePesoKg = flotta.reduce((acc, r) => {
    const m = MODELLI_MEZZI.find(v => v.catalogoId === r.modelloId)
    return acc + (m ? m.caricoKg * r.quantita : 0)
  }, 0)
  const totaleVolumeM3 = flotta.reduce((acc, r) => {
    const m = MODELLI_MEZZI.find(v => v.catalogoId === r.modelloId)
    return acc + (m ? m.volumeM3 * r.quantita : 0)
  }, 0)
  const totaleMezzi = flotta.reduce((acc, r) => acc + r.quantita, 0)

  // Fabbisogno dai PUDO selezionati
  const pudoIds = data.pudoSelezionati instanceof Set ? data.pudoSelezionati : new Set()
  const spedPudo = SPEDIZIONI_INIT.filter(s => pudoIds.has(s.pudoId))
  const fabbisognoPesoKg = spedPudo.reduce((acc, s) => acc + (s.peso ?? 0), 0) * 10
  const fabbisognoVolumeM3 = spedPudo.reduce((acc, s) => acc + (s.volume ?? 0) / 1_000_000, 0) * 10

  const alertPeso   = totalePesoKg   < fabbisognoPesoKg
  const alertVolume = totaleVolumeM3 < fabbisognoVolumeM3

  // Modelli non ancora in flotta
  const modelliDisponibili = MODELLI_MEZZI.filter(v => !flotta.some(r => r.modelloId === v.catalogoId))

  return (
    <div className="wizard-full-step">
      <div style={{ fontSize: 13, color: 'var(--fp-gray-mid)', marginBottom: 20, lineHeight: 1.5 }}>
        Configura i parametri inviati ad <strong>OptimoRoute</strong> per il calcolo dei giri.
      </div>

      <div className="wizard-params-grid">

        {/* Pianificazione */}
        <div className="wizard-params-card">
          <div className="wizard-params-card-title">📅 Pianificazione</div>

          <div className="wp-field">
            <label className="wp-label">Data giri *</label>
            <input
              type="date"
              className="wp-input"
              value={data.dataGiri || today}
              min={today}
              onChange={e => onChange({ dataGiri: e.target.value })}
            />
            <span className="wp-hint">Data in cui verranno eseguiti i giri pianificati.</span>
          </div>

          <div className="wp-field">
            <label className="wp-label">Finestra turno</label>
            <div className="wp-row2">
              <div>
                <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginBottom: 4 }}>Inizio</div>
                <input type="time" className="wp-input" value={data.oraTurnoStart}
                  onChange={e => onChange({ oraTurnoStart: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginBottom: 4 }}>Fine</div>
                <input type="time" className="wp-input" value={data.oraTurnoEnd}
                  onChange={e => onChange({ oraTurnoEnd: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="wp-field">
            <div className="wp-toggle-row">
              <div>
                <div className="wp-label">Pausa pranzo</div>
                <div className="wp-hint" style={{ marginTop: 2 }}>Inserisce una pausa obbligatoria durante il turno.</div>
              </div>
              <label className="wp-toggle">
                <input type="checkbox" checked={!!data.pausaPranzo} onChange={() => toggle('pausaPranzo')} />
                <div className="wp-toggle-track" /><div className="wp-toggle-thumb" />
              </label>
            </div>

            {data.pausaPranzo && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginBottom: 4 }}>Durata (min)</div>
                  <input type="number" className="wp-input"
                    value={data.pausaPranzoDurata ?? 30} min={10} max={120} step={5}
                    onChange={e => onChange({ pausaPranzoDurata: parseInt(e.target.value, 10) || 30 })} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginBottom: 4 }}>Finestra temporale</div>
                  <div className="wp-row2">
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--fp-gray-mid)', marginBottom: 3 }}>Dalle</div>
                      <input type="time" className="wp-input" value={data.pausaPranzoStart ?? '12:00'}
                        onChange={e => onChange({ pausaPranzoStart: e.target.value })} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--fp-gray-mid)', marginBottom: 3 }}>Alle</div>
                      <input type="time" className="wp-input" value={data.pausaPranzoEnd ?? '14:00'}
                        onChange={e => onChange({ pausaPranzoEnd: e.target.value })} />
                    </div>
                  </div>
                </div>
                <span className="wp-hint">
                  La pausa verrà inserita in un momento qualsiasi tra {data.pausaPranzoStart ?? '12:00'} e {data.pausaPranzoEnd ?? '14:00'}.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bilanciamento */}
        <div className="wizard-params-card">
          <div className="wizard-params-card-title">⚖️ Bilanciamento giri</div>

          <div className="wp-field">
            <label className="wp-label">Modalità bilanciamento</label>
            <div className="wp-seg">
              {[
                { val: 'OFF', label: 'Off' },
                { val: 'ON', label: 'Bilanciato' },
                { val: 'ON_FORCE', label: 'Forzato' },
              ].map(opt => (
                <button key={opt.val} className={data.balancing === opt.val ? 'active' : ''}
                  onClick={() => onChange({ balancing: opt.val })}>
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="wp-hint">
              {data.balancing === 'OFF' && 'Usa solo i mezzi necessari, senza bilanciare il carico.'}
              {data.balancing === 'ON' && 'Distribuisce il lavoro in modo equilibrato tra i mezzi.'}
              {data.balancing === 'ON_FORCE' && "Bilancia e forza l'uso di tutti i mezzi disponibili."}
            </span>
          </div>

          {data.balancing !== 'OFF' && (
            <>
              <div className="wp-field">
                <label className="wp-label">Criterio di bilanciamento</label>
                <div className="wp-seg">
                  <button className={data.balanceBy === 'WT' ? 'active' : ''} onClick={() => onChange({ balanceBy: 'WT' })}>Ore lavoro</button>
                  <button className={data.balanceBy === 'NUM' ? 'active' : ''} onClick={() => onChange({ balanceBy: 'NUM' })}>N° fermate</button>
                </div>
                <span className="wp-hint">
                  {data.balanceBy === 'WT' ? 'Bilancia le ore di lavoro tra i conducenti.' : 'Bilancia il numero di fermate per mezzo.'}
                </span>
              </div>

              <div className="wp-field">
                <label className="wp-label">Intensità bilanciamento</label>
                <div className="wp-slider-row">
                  <input type="range" className="ws-range" min={0} max={1} step={0.05}
                    value={data.balancingFactor}
                    onChange={e => onChange({ balancingFactor: parseFloat(e.target.value) })} />
                  <span className="wp-slider-val">{data.balancingFactor.toFixed(2)}</span>
                </div>
                <span className="wp-hint">0 = priorità efficienza · 1 = priorità bilanciamento totale</span>
              </div>
            </>
          )}
        </div>

        {/* Flotta / Capacità mezzi */}
        <div className="wizard-params-card">
          <div className="wizard-params-card-title">🚐 Flotta</div>

          {/* Righe flotta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {flotta.map(({ modelloId, quantita }) => {
              const m = MODELLI_MEZZI.find(v => v.catalogoId === modelloId)
              if (!m) return null
              return (
                <div key={modelloId} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fp-bg)', borderRadius: 7, padding: '8px 10px', border: '1px solid var(--fp-border)' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{tipoIcon(m)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fp-charcoal)' }}>{m.marca} {m.modello}</div>
                    <div style={{ fontSize: 10, color: 'var(--fp-gray-mid)' }}>{m.caricoKg} kg · {m.volumeM3} m³</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setQuantita(modelloId, quantita - 1)}
                      style={{ width: 22, height: 22, border: '1px solid var(--fp-border)', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{quantita}</span>
                    <button onClick={() => setQuantita(modelloId, quantita + 1)}
                      style={{ width: 22, height: 22, border: '1px solid var(--fp-border)', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button onClick={() => removeModello(modelloId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fp-gray-mid)', fontSize: 16, padding: '0 2px', flexShrink: 0 }}>×</button>
                </div>
              )
            })}
          </div>

          {/* Aggiungi modello */}
          {modelliDisponibili.length > 0 && (
            <div className="wp-field">
              <label className="wp-label">Aggiungi modello</label>
              <select className="wp-select" value="" onChange={e => e.target.value && addModello(e.target.value)}>
                <option value="">Seleziona modello…</option>
                {modelliDisponibili.map(m => (
                  <option key={m.catalogoId} value={m.catalogoId}>{tipoIcon(m)} {m.marca} {m.modello} — {m.caricoKg} kg · {m.volumeM3} m³</option>
                ))}
              </select>
            </div>
          )}

          {/* Riepilogo capacità vs fabbisogno */}
          <div style={{ marginTop: 4, borderTop: '1px solid var(--fp-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fp-gray-mid)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>
              Capacità flotta ({totaleMezzi} mezz{totaleMezzi === 1 ? 'o' : 'i'})
            </div>

            {/* Peso */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, flex: 1 }}>Peso</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: alertPeso ? '#DC0032' : '#2E7D32' }}>
                {totalePesoKg.toFixed(0)} kg
              </span>
              {fabbisognoPesoKg > 0 && (
                <span style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>
                  / {fabbisognoPesoKg.toFixed(1)} kg richiesti
                </span>
              )}
              {alertPeso && <span style={{ color: '#DC0032', fontSize: 13 }}>⚠️</span>}
            </div>

            {/* Volume */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, flex: 1 }}>Volume</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: alertVolume ? '#DC0032' : '#2E7D32' }}>
                {totaleVolumeM3.toFixed(1)} m³
              </span>
              {fabbisognoVolumeM3 > 0 && (
                <span style={{ fontSize: 11, color: 'var(--fp-gray-mid)' }}>
                  / {fabbisognoVolumeM3.toFixed(3)} m³ richiesti
                </span>
              )}
              {alertVolume && <span style={{ color: '#DC0032', fontSize: 13 }}>⚠️</span>}
            </div>

            {(alertPeso || alertVolume) && (
              <div style={{ marginTop: 4, padding: '6px 10px', background: '#fff5f7', border: '1px solid #f5c6cb', borderRadius: 6, fontSize: 11, color: '#DC0032', lineHeight: 1.5 }}>
                ⚠️ La capacità della flotta è insufficiente a coprire il fabbisogno dei PUDO selezionati. Aggiungi mezzi o riduci i PUDO.
              </div>
            )}

            {fabbisognoPesoKg === 0 && fabbisognoVolumeM3 === 0 && (
              <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', fontStyle: 'italic' }}>
                Nessuna spedizione trovata per i PUDO selezionati.
              </div>
            )}
          </div>
        </div>

        {/* Ottimizzazione avanzata */}
        <div className="wizard-params-card">
          <div className="wizard-params-card-title">⚙️ Ottimizzazione avanzata</div>

          <div className="wp-field">
            <div className="wp-toggle-row">
              <div>
                <div className="wp-label">Cluster geografico</div>
                <div className="wp-hint" style={{ marginTop: 2 }}>Riduce la sovrapposizione geografica tra giri diversi.</div>
              </div>
              <label className="wp-toggle">
                <input type="checkbox" checked={data.clustering} onChange={() => toggle('clustering')} />
                <div className="wp-toggle-track" /><div className="wp-toggle-thumb" />
              </label>
            </div>
          </div>

          <div className="wp-field">
            <div className="wp-toggle-row">
              <div>
                <div className="wp-label">Rientro a deposito</div>
                <div className="wp-hint" style={{ marginTop: 2 }}>Permette ai mezzi di tornare al deposito per ricaricare durante il turno.</div>
              </div>
              <label className="wp-toggle">
                <input type="checkbox" checked={data.depotTrips} onChange={() => toggle('depotTrips')} />
                <div className="wp-toggle-track" /><div className="wp-toggle-thumb" />
              </label>
            </div>
          </div>

          {data.depotTrips && (
            <div className="wp-field">
              <label className="wp-label">Durata sosta al deposito (min)</label>
              <input type="number" className="wp-input" value={data.depotVisitDuration}
                min={5} max={120} step={5}
                onChange={e => onChange({ depotVisitDuration: parseInt(e.target.value, 10) || 15 })} />
              <span className="wp-hint">Tempo necessario per ricaricare al deposito.</span>
            </div>
          )}

          <div className="wp-field">
            <label className="wp-label">Durata media fermata (min)</label>
            <div className="wp-seg" style={{ marginBottom: 8 }}>
              <button className={(data.durataFermataMode ?? 'fixed') === 'fixed' ? 'active' : ''}
                onClick={() => onChange({ durataFermataMode: 'fixed' })}>Valore fisso</button>
              <button className={(data.durataFermataMode ?? 'fixed') === 'ci' ? 'active' : ''}
                onClick={() => onChange({ durataFermataMode: 'ci' })}>Proporzionale al CI</button>
            </div>

            {(data.durataFermataMode ?? 'fixed') === 'fixed' ? (
              <>
                <input type="number" className="wp-input" value={data.durataFermata}
                  min={1} max={60} step={1}
                  onChange={e => onChange({ durataFermata: parseInt(e.target.value, 10) || 12 })} />
                <span className="wp-hint">Valore fisso applicato a ogni PUDO (campo duration).</span>
              </>
            ) : (
              <>
                <div className="wp-row2" style={{ alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginBottom: 4 }}>Min (CI basso)</div>
                    <input type="number" className="wp-input" value={data.durataFermataMin ?? 5}
                      min={1} max={(data.durataFermataMax ?? 20) - 1} step={1}
                      onChange={e => onChange({ durataFermataMin: parseInt(e.target.value, 10) || 5 })} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginBottom: 4 }}>Max (CI alto)</div>
                    <input type="number" className="wp-input" value={data.durataFermataMax ?? 20}
                      min={(data.durataFermataMin ?? 5) + 1} max={60} step={1}
                      onChange={e => onChange({ durataFermataMax: parseInt(e.target.value, 10) || 20 })} />
                  </div>
                </div>
                <span className="wp-hint">
                  La durata scala linearmente con il CI del PUDO: {data.durataFermataMin ?? 5} min (CI = 0) → {data.durataFermataMax ?? 20} min (CI ≥ 5).
                </span>
              </>
            )}
          </div>

          <div className="wp-field">
            <label className="wp-label">Priorità ordini (default)</label>
            <select className="wp-select" value={data.prioritaDefault}
              onChange={e => onChange({ prioritaDefault: e.target.value })}>
              <option value="M">M — Media (default)</option>
              <option value="L">L — Bassa</option>
              <option value="H">H — Alta</option>
              <option value="C">C — Critica</option>
            </select>
            <span className="wp-hint">Priorità assegnata agli ordini senza priorità esplicita.</span>
          </div>
        </div>

      </div>
    </div>
  )
}
