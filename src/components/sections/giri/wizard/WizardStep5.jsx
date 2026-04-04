import { useState, useEffect } from 'react'
import { FILIALI } from '../../../../data/filiali'
import { getCiPudo } from '../../../../data/spedizioni'
import pudosRoma from '../../../../data/pudosRoma.json'
import { toggleFavorite, isFavorite, generateScenarioId } from '../../../../services/scenarioFavorites'

function formatData(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatBal(b) {
  return { OFF: 'Nessuno', ON: 'Bilanciato', ON_FORCE: 'Forzato (tutti i mezzi)' }[b] || b
}

function ciColor(ci) {
  if (ci >= 4)   return '#2E7D32'
  if (ci >= 2.5) return '#E65100'
  if (ci > 0)    return '#1565C0'
  return '#9E9E9E'
}

export default function WizardStep5({ data }) {
  const [isFav, setIsFav] = useState(false)
  const scenarioId = generateScenarioId(data)

  useEffect(() => {
    setIsFav(isFavorite(scenarioId))
  }, [scenarioId])

  const handleToggleFavorite = () => {
    const newState = toggleFavorite(scenarioId)
    setIsFav(newState)
  }

  const allFiliali = [...FILIALI, ...(data.extraFiliali || [])]
  const filiale = allFiliali.find(f => f.id === data.filialeId)

  const pudoDetails = pudosRoma
    .filter(p => data.pudoSelezionati.has(p.id))
    .map(p => ({ ...p, ci: getCiPudo(p.id, data.periodoGg) }))
    .sort((a, b) => b.ci - a.ci)

  const ciMedio = pudoDetails.length
    ? (pudoDetails.reduce((s, p) => s + p.ci, 0) / pudoDetails.length).toFixed(2)
    : '—'

  return (
    <div className="wizard-full-step">
      <div style={{ fontSize: 13, color: 'var(--fp-gray-mid)', marginBottom: 20, lineHeight: 1.5 }}>
        Verifica i parametri dello scenario prima di inviare la richiesta a <strong>OptimoRoute</strong>.
      </div>

      <div className="wizard-confirm-grid">

        {/* Scenario */}
        <div className="wc-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="wc-card-title">Scenario</div>
            <button
              className="favorite-btn"
              onClick={handleToggleFavorite}
              title={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                opacity: isFav ? 1 : 0.5,
                transition: 'opacity 150ms ease',
              }}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>
          <div className="wc-row">
            <span className="wc-key">Nome</span>
            <span className="wc-val red">{data.nomeScenario || '—'}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Filiale</span>
            <span className="wc-val">{filiale?.nome || '—'}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Province selezionate</span>
            <span className="wc-val">{data.province.length > 0 ? data.province.join(', ') : 'Tutte'}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Periodo CI</span>
            <span className="wc-val">{data.periodoGg} giorni</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">CI minimo</span>
            <span className="wc-val">{data.ciMin.toFixed(1)}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Raggio dalla filiale</span>
            <span className="wc-val">{data.raggioKm} km</span>
          </div>
        </div>

        {/* PUDO */}
        <div className="wc-card">
          <div className="wc-card-title">PUDO selezionati</div>
          <div className="wc-row">
            <span className="wc-key">Totale PUDO</span>
            <span className="wc-val red">{data.pudoSelezionati.size}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">CI medio</span>
            <span className="wc-val">{ciMedio}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">CI alto (≥ 4)</span>
            <span className="wc-val" style={{ color: '#2E7D32' }}>{pudoDetails.filter(p => p.ci >= 4).length}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">CI medio (2.5–4)</span>
            <span className="wc-val" style={{ color: '#E65100' }}>{pudoDetails.filter(p => p.ci >= 2.5 && p.ci < 4).length}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">CI basso ({'<'} 2.5)</span>
            <span className="wc-val" style={{ color: '#1565C0' }}>{pudoDetails.filter(p => p.ci > 0 && p.ci < 2.5).length}</span>
          </div>
          <div className="wc-pudo-chips" style={{ maxHeight: 80, overflowY: 'auto' }}>
            {pudoDetails.slice(0, 20).map(p => (
              <span key={p.id} className="wc-pudo-chip" style={{ borderColor: ciColor(p.ci), color: ciColor(p.ci) }}>
                {p.name.split(' ').slice(0, 2).join(' ')}
              </span>
            ))}
            {pudoDetails.length > 20 && (
              <span className="wc-pudo-chip">+{pudoDetails.length - 20} altri</span>
            )}
          </div>
        </div>

        {/* Pianificazione */}
        <div className="wc-card">
          <div className="wc-card-title">Pianificazione</div>
          <div className="wc-row">
            <span className="wc-key">Data giri</span>
            <span className="wc-val">{formatData(data.dataGiri)}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Finestra turno</span>
            <span className="wc-val">{data.oraTurnoStart} – {data.oraTurnoEnd}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Numero mezzi</span>
            <span className="wc-val">{data.numMezzi}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Durata fermata media</span>
            <span className="wc-val">{data.durataFermata} min</span>
          </div>
        </div>

        {/* OptimoRoute params */}
        <div className="wc-card">
          <div className="wc-card-title">Parametri OptimoRoute</div>
          <div className="wc-row">
            <span className="wc-key">Bilanciamento</span>
            <span className="wc-val">{formatBal(data.balancing)}</span>
          </div>
          {data.balancing !== 'OFF' && (
            <>
              <div className="wc-row">
                <span className="wc-key">Criterio</span>
                <span className="wc-val">{data.balanceBy === 'WT' ? 'Ore lavoro' : 'N° fermate'}</span>
              </div>
              <div className="wc-row">
                <span className="wc-key">Intensità</span>
                <span className="wc-val">{data.balancingFactor.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="wc-row">
            <span className="wc-key">Peso max / mezzo</span>
            <span className="wc-val">{data.pesoMaxKg} kg</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Volume max / mezzo</span>
            <span className="wc-val">{data.volumeMaxM3} m³</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Cluster geografico</span>
            <span className="wc-val">{data.clustering ? '✓ Attivo' : 'Off'}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Rientro deposito</span>
            <span className="wc-val">
              {data.depotTrips ? `✓ Attivo (${data.depotVisitDuration} min sosta)` : 'Off'}
            </span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Compartimentazione</span>
            <span className="wc-val">{data.compartimentazione ? '✓ Attiva' : 'Off'}</span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Priorità default</span>
            <span className="wc-val">{data.prioritaDefault}</span>
          </div>
        </div>

      </div>

      {/* Submit box */}
      <div className="wizard-submit-box" style={{ marginTop: 20 }}>
        <div className="wsb-text">
          <div className="wsb-title">Pronto per l'ottimizzazione</div>
          Verranno inviati <strong>{data.pudoSelezionati.size} PUDO</strong> a OptimoRoute per il giorno <strong>{formatData(data.dataGiri)}</strong>.
          Il sistema calcolerà i giri ottimali e li aggiungerà alla sezione Giri.
        </div>
      </div>
    </div>
  )
}
