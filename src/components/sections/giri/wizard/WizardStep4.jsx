export default function WizardStep4({ data, onChange }) {
  function toggle(field) {
    onChange({ [field]: !data[field] })
  }

  const today = new Date().toISOString().split('T')[0]

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
                <input
                  type="time"
                  className="wp-input"
                  value={data.oraTurnoStart}
                  onChange={e => onChange({ oraTurnoStart: e.target.value })}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--fp-gray-mid)', marginBottom: 4 }}>Fine</div>
                <input
                  type="time"
                  className="wp-input"
                  value={data.oraTurnoEnd}
                  onChange={e => onChange({ oraTurnoEnd: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="wp-field">
            <label className="wp-label">Numero di mezzi</label>
            <input
              type="number"
              className="wp-input"
              value={data.numMezzi}
              min={1} max={20}
              onChange={e => onChange({ numMezzi: parseInt(e.target.value, 10) || 1 })}
            />
            <span className="wp-hint">Numero di veicoli disponibili per la giornata.</span>
          </div>
        </div>

        {/* Bilanciamento */}
        <div className="wizard-params-card">
          <div className="wizard-params-card-title">⚖️ Bilanciamento giri</div>

          <div className="wp-field">
            <label className="wp-label">Modalità bilanciamento</label>
            <div className="wp-seg">
              {[
                { val: 'OFF',      label: 'Off' },
                { val: 'ON',       label: 'Bilanciato' },
                { val: 'ON_FORCE', label: 'Forzato' },
              ].map(opt => (
                <button
                  key={opt.val}
                  className={data.balancing === opt.val ? 'active' : ''}
                  onClick={() => onChange({ balancing: opt.val })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="wp-hint">
              {data.balancing === 'OFF' && 'Usa solo i mezzi necessari, senza bilanciare il carico.'}
              {data.balancing === 'ON' && 'Distribuisce il lavoro in modo equilibrato tra i mezzi.'}
              {data.balancing === 'ON_FORCE' && 'Bilancia e forza l\'uso di tutti i mezzi disponibili.'}
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
                  <input
                    type="range"
                    className="ws-range"
                    min={0} max={1} step={0.05}
                    value={data.balancingFactor}
                    onChange={e => onChange({ balancingFactor: parseFloat(e.target.value) })}
                  />
                  <span className="wp-slider-val">{data.balancingFactor.toFixed(2)}</span>
                </div>
                <span className="wp-hint">
                  0 = priorità efficienza · 1 = priorità bilanciamento totale
                </span>
              </div>
            </>
          )}
        </div>

        {/* Capacità mezzi */}
        <div className="wizard-params-card">
          <div className="wizard-params-card-title">🚐 Capacità mezzi</div>

          <div className="wp-field">
            <label className="wp-label">Peso massimo per mezzo (kg)</label>
            <input
              type="number"
              className="wp-input"
              value={data.pesoMaxKg}
              min={100} max={5000} step={50}
              onChange={e => onChange({ pesoMaxKg: parseInt(e.target.value, 10) || 700 })}
            />
            <span className="wp-hint">Corrisponde a load1 in OptimoRoute.</span>
          </div>

          <div className="wp-field">
            <label className="wp-label">Volume massimo per mezzo (m³)</label>
            <input
              type="number"
              className="wp-input"
              value={data.volumeMaxM3}
              min={1} max={50} step={0.5}
              onChange={e => onChange({ volumeMaxM3: parseFloat(e.target.value) || 8 })}
            />
            <span className="wp-hint">Corrisponde a load2 in OptimoRoute.</span>
          </div>

          <div className="wp-field">
            <div className="wp-toggle-row">
              <div>
                <div className="wp-label">Compartimentazione (multi-load)</div>
                <div className="wp-hint" style={{ marginTop: 2 }}>
                  Usa load1/load2 come compartimenti separati (es. ambiente/refrigerato).
                </div>
              </div>
              <label className="wp-toggle">
                <input
                  type="checkbox"
                  checked={data.compartimentazione}
                  onChange={() => toggle('compartimentazione')}
                />
                <div className="wp-toggle-track" />
                <div className="wp-toggle-thumb" />
              </label>
            </div>
          </div>
        </div>

        {/* Ottimizzazione avanzata */}
        <div className="wizard-params-card">
          <div className="wizard-params-card-title">⚙️ Ottimizzazione avanzata</div>

          <div className="wp-field">
            <div className="wp-toggle-row">
              <div>
                <div className="wp-label">Cluster geografico</div>
                <div className="wp-hint" style={{ marginTop: 2 }}>
                  Riduce la sovrapposizione geografica tra giri diversi.
                </div>
              </div>
              <label className="wp-toggle">
                <input type="checkbox" checked={data.clustering} onChange={() => toggle('clustering')} />
                <div className="wp-toggle-track" />
                <div className="wp-toggle-thumb" />
              </label>
            </div>
          </div>

          <div className="wp-field">
            <div className="wp-toggle-row">
              <div>
                <div className="wp-label">Rientro a deposito</div>
                <div className="wp-hint" style={{ marginTop: 2 }}>
                  Permette ai mezzi di tornare al deposito per ricaricare durante il turno.
                </div>
              </div>
              <label className="wp-toggle">
                <input type="checkbox" checked={data.depotTrips} onChange={() => toggle('depotTrips')} />
                <div className="wp-toggle-track" />
                <div className="wp-toggle-thumb" />
              </label>
            </div>
          </div>

          {data.depotTrips && (
            <div className="wp-field">
              <label className="wp-label">Durata sosta al deposito (min)</label>
              <input
                type="number"
                className="wp-input"
                value={data.depotVisitDuration}
                min={5} max={120} step={5}
                onChange={e => onChange({ depotVisitDuration: parseInt(e.target.value, 10) || 15 })}
              />
              <span className="wp-hint">Tempo necessario per ricaricare al deposito.</span>
            </div>
          )}

          <div className="wp-field">
            <label className="wp-label">Durata media fermata (min)</label>
            <input
              type="number"
              className="wp-input"
              value={data.durataFermata}
              min={1} max={60} step={1}
              onChange={e => onChange({ durataFermata: parseInt(e.target.value, 10) || 12 })}
            />
            <span className="wp-hint">Tempo di servizio stimato per ogni PUDO (campo duration).</span>
          </div>

          <div className="wp-field">
            <label className="wp-label">Priorità ordini (default)</label>
            <select
              className="wp-select"
              value={data.prioritaDefault}
              onChange={e => onChange({ prioritaDefault: e.target.value })}
            >
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
