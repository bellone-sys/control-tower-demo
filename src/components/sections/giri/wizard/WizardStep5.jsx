import { useState, useEffect } from 'react'
import { FILIALI } from '../../../../data/filiali'
import { getCiPudo } from '../../../../data/spedizioni'
import pudosRoma from '../../../../data/pudosRoma.json'
import { MODELLI_MEZZI } from '../../../../data/flotta'
import { SPEDIZIONI_INIT } from '../../../../data/spedizioni'
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

  // Capacità flotta vs fabbisogno
  const flotta = data.flotta ?? []
  const totalePesoKg = flotta.reduce((acc, r) => {
    const m = MODELLI_MEZZI.find(v => v.catalogoId === r.modelloId)
    return acc + (m ? m.caricoKg * r.quantita : 0)
  }, 0)
  const totaleVolumeM3 = flotta.reduce((acc, r) => {
    const m = MODELLI_MEZZI.find(v => v.catalogoId === r.modelloId)
    return acc + (m ? m.volumeM3 * r.quantita : 0)
  }, 0)
  const pudoIds = data.pudoSelezionati instanceof Set ? data.pudoSelezionati : new Set()
  const spedPudo = SPEDIZIONI_INIT.filter(s => pudoIds.has(s.pudoId))
  const fabbisognoPesoKg = spedPudo.reduce((acc, s) => acc + (s.peso ?? 0), 0) * 10
  const fabbisognoVolumeM3 = spedPudo.reduce((acc, s) => acc + (s.volume ?? 0) / 1_000_000, 0) * 10
  const alertPeso = totalePesoKg < fabbisognoPesoKg
  const alertVolume = totaleVolumeM3 < fabbisognoVolumeM3
  const hasFabbisogno = fabbisognoPesoKg > 0 || fabbisognoVolumeM3 > 0

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
            <span className="wc-key">Pausa pranzo</span>
            <span className="wc-val">
              {data.pausaPranzo
                ? `${data.pausaPranzoDurata ?? 30} min (${data.pausaPranzoStart ?? '12:00'}–${data.pausaPranzoEnd ?? '14:00'})`
                : 'Off'}
            </span>
          </div>
          <div className="wc-row">
            <span className="wc-key">Durata fermata</span>
            <span className="wc-val">
              {(data.durataFermataMode ?? 'fixed') === 'fixed'
                ? `${data.durataFermata} min (fisso)`
                : `${data.durataFermataMin ?? 5}–${data.durataFermataMax ?? 20} min (prop. CI)`}
            </span>
          </div>
        </div>

        {/* OptimoRoute params */}
        <div className="wc-card">
          <div className="wc-card-title">Parametri OptimoRoute</div>

          {/* Flotta */}
          {(data.flotta ?? []).map(({ modelloId, quantita }) => {
            const m = MODELLI_MEZZI.find(v => v.catalogoId === modelloId)
            if (!m) return null
            return (
              <div key={modelloId} className="wc-row">
                <span className="wc-key">{m.marca} {m.modello}</span>
                <span className="wc-val">×{quantita}</span>
              </div>
            )
          })}

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
            <span className="wc-key">Priorità default</span>
            <span className="wc-val">{data.prioritaDefault}</span>
          </div>
        </div>

      </div>

      {/* Capacity check */}
      {hasFabbisogno && (
        (alertPeso || alertVolume) ? (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff5f7', border: '1px solid #f5c6cb', borderRadius: 8, fontSize: 12, color: '#DC0032', lineHeight: 1.6 }}>
            ⚠️ <strong>Capacità flotta insufficiente.</strong>{' '}
            {alertPeso && `Peso disponibile ${totalePesoKg.toFixed(0)} kg < ${fabbisognoPesoKg.toFixed(0)} kg richiesti. `}
            {alertVolume && `Volume disponibile ${totaleVolumeM3.toFixed(1)} m³ < ${fabbisognoVolumeM3.toFixed(2)} m³ richiesti.`}
            {' '}Torna al passo 4 per aggiungere mezzi.
          </div>
        ) : (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f1f8f2', border: '1px solid #a5d6a7', borderRadius: 8, fontSize: 12, color: '#2E7D32', lineHeight: 1.6 }}>
            ✓ <strong>Capacità flotta sufficiente.</strong>{' '}
            {totalePesoKg.toFixed(0)} kg / {totaleVolumeM3.toFixed(1)} m³ disponibili coprono il fabbisogno di {fabbisognoPesoKg.toFixed(0)} kg / {fabbisognoVolumeM3.toFixed(2)} m³.
          </div>
        )
      )}

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
