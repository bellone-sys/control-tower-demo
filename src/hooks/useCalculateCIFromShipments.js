import { useMemo } from 'react'
import pudosRoma from '../data/pudosRoma.json'

/**
 * Hook per calcolare il Consolidation Index (CI) di ogni PUDO
 * CI = numero medio di pacchi in entrata e uscita per PUDO in un arco temporale
 *
 * In una vera app, calcolerebbe dai dati di spedizioni storiche.
 * Qui usiamo una simulazione basata su dati statici.
 */
export function useCalculateCIFromShipments(shipments = []) {
  const ciMap = useMemo(() => {
    // Simulazione: assegna CI basato su ID PUDO (deterministico)
    // In produzione, calcolerebbe dai shipments reali
    const map = {}

    pudosRoma.forEach(pudo => {
      // Generiamo un CI semi-casuale ma consistente basato sull'ID
      const seed = parseInt(pudo.id.replace(/\D/g, ''), 10)
      const baseCI = 15 + (seed % 40) // CI tra 15 e 55

      // I locker hanno CI più basso (meno transazioni)
      const isLocker = pudo.name.toLowerCase().includes('locker')
      const ci = isLocker ? baseCI * 0.6 : baseCI

      map[pudo.id] = Math.round(ci * 10) / 10 // Una cifra decimale
    })

    return map
  }, [shipments])

  /**
   * Filtra e ordina PUDO per CI
   * @param {number} minCI - Valore minimo di CI da considerare
   * @returns {Array} PUDO con CI >= minCI, ordinati per CI descending
   */
  const getPudosByCI = (minCI = 0) => {
    return pudosRoma
      .map(p => ({ ...p, ci: ciMap[p.id] || 0 }))
      .filter(p => p.ci >= minCI)
      .sort((a, b) => b.ci - a.ci)
  }

  /**
   * Calcola il baricentro geografico di un set di PUDO
   * @param {Array} pudos - Array di PUDO
   * @returns {Object} { lat, lng, count, ciMedio }
   */
  const getGeometricCenter = (pudos) => {
    if (!pudos.length) return null

    const sum = pudos.reduce(
      (acc, p) => ({
        lat: acc.lat + p.lat,
        lng: acc.lng + p.lng,
        ci: acc.ci + (ciMap[p.id] || 0),
      }),
      { lat: 0, lng: 0, ci: 0 }
    )

    return {
      lat: sum.lat / pudos.length,
      lng: sum.lng / pudos.length,
      count: pudos.length,
      ciMedio: Math.round((sum.ci / pudos.length) * 10) / 10,
    }
  }

  /**
   * Calcola distanza in km tra due coordinate
   * @param {number} lat1, lng1, lat2, lng2
   * @returns {number} Distanza in km (formula approssimata)
   */
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // raggio terra in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return {
    ciMap,
    getPudosByCI,
    getGeometricCenter,
    calculateDistance,
  }
}
