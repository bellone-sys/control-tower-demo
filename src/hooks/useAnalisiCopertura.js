import { useMemo } from 'react'
import { PROVINCE_COPERTURA, calculateCarenzaIndex, calculateUtilization, getStatoCobertura, suggerisciAzione, calcolaStatistiche } from '../data/analisiCopertura'

/**
 * Hook per analisi copertura PUDO
 * Calcola metriche e stati per tutte le province
 */
export function useAnalisiCopertura(filtri = {}) {
  const { stato = 'tutti', regione = null, ordinamento = 'criticita' } = filtri

  // Arricchisci dati con metriche calcolate
  const provinceArricchite = useMemo(() => {
    return PROVINCE_COPERTURA.map(prov => {
      const carenzaIndex = calculateCarenzaIndex(prov)
      const utilizz = calculateUtilization(prov)
      const statoCobertura = getStatoCobertura(carenzaIndex)
      const azione = suggerisciAzione(prov)

      return {
        ...prov,
        carenzaIndex,
        utilizz,
        statoCobertura,
        azione,
        criticita: Math.abs(carenzaIndex), // Valore assoluto per ordinamento
      }
    })
  }, [])

  // Applica filtri
  const provinceAlterate = useMemo(() => {
    let filtered = [...provinceArricchite]

    // Filtro stato
    if (stato !== 'tutti') {
      filtered = filtered.filter(p => p.statoCobertura === stato)
    }

    // Filtro regione
    if (regione) {
      filtered = filtered.filter(p => p.regione === regione)
    }

    // Ordinamento
    if (ordinamento === 'criticita') {
      filtered.sort((a, b) => b.criticita - a.criticita)
    } else if (ordinamento === 'nome') {
      filtered.sort((a, b) => a.provincia.localeCompare(b.provincia))
    } else if (ordinamento === 'spedizioni') {
      filtered.sort((a, b) => b.spedizioni - a.spedizioni)
    }

    return filtered
  }, [provinceArricchite, stato, regione, ordinamento])

  // Calcola statistiche globali
  const statistiche = useMemo(() => {
    return calcolaStatistiche(provinceArricchite)
  }, [provinceArricchite])

  // Top 10 province per criticità
  const top10Criticita = useMemo(() => {
    return [...provinceArricchite].sort((a, b) => b.criticita - a.criticita).slice(0, 10)
  }, [provinceArricchite])

  // Regioni uniche per dropdown
  const regioni = useMemo(() => {
    const unique = new Set(PROVINCE_COPERTURA.map(p => p.regione))
    return Array.from(unique).sort()
  }, [])

  return {
    province: provinceAlterate,
    statistiche,
    top10Criticita,
    regioni,
    totaleProvince: PROVINCE_COPERTURA.length,
  }
}
