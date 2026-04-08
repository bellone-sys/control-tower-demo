import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  loadAndParsePudos,
  filterPudos,
  groupBySubRegion,
  groupByMunicipality,
  getStatistics,
  searchPudos,
} from '../data/pudosParser'

/**
 * Hook per caricamento lazy PUDO
 * Supporta filtering per regione, provincia, comune, ricerca
 */
export function usePudosLoader() {
  const [allPudos, setAllPudos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carica tutti i PUDO al mount
  useEffect(() => {
    loadAndParsePudos()
      .then(setAllPudos)
      .catch(err => {
        setError(err)
        console.error('Errore caricamento PUDO:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  // Filtra per parametri
  const filteredPudos = useCallback(
    (filters = {}) => {
      if (!allPudos) return []
      return filterPudos(allPudos, filters)
    },
    [allPudos]
  )

  // Ricerca per testo
  const searchPudosByTerm = useCallback(
    (term) => {
      if (!allPudos) return []
      return searchPudos(allPudos, term)
    },
    [allPudos]
  )

  // Statistiche generali
  const stats = useMemo(
    () => (allPudos ? getStatistics(allPudos) : null),
    [allPudos]
  )

  // Raggruppi per provincia
  const bySubRegion = useMemo(
    () => (allPudos ? groupBySubRegion(allPudos) : {}),
    [allPudos]
  )

  // Raggruppi per comune
  const byMunicipality = useMemo(
    () => (allPudos ? groupByMunicipality(allPudos) : {}),
    [allPudos]
  )

  // Carica PUDO per provincia specifica (con paginazione)
  const getPudosBySubRegion = useCallback(
    (subRegion, limit = 100, offset = 0) => {
      const filtered = filteredPudos({ subRegion, isActive: true })
      return {
        total: filtered.length,
        pudos: filtered.slice(offset, offset + limit),
        hasMore: offset + limit < filtered.length,
      }
    },
    [filteredPudos]
  )

  // Carica PUDO per comune specifica
  const getPudosByMunicipality = useCallback(
    (municipality, limit = 100, offset = 0) => {
      const filtered = filteredPudos({ municipality, isActive: true })
      return {
        total: filtered.length,
        pudos: filtered.slice(offset, offset + limit),
        hasMore: offset + limit < filtered.length,
      }
    },
    [filteredPudos]
  )

  // Carica PUDO in box geografico (per mappa)
  const getPudosInBounds = useCallback(
    (bounds) => {
      if (!allPudos) return []
      const { north, south, east, west } = bounds
      return allPudos.filter(p =>
        p.latitude >= south &&
        p.latitude <= north &&
        p.longitude >= west &&
        p.longitude <= east &&
        p.active
      )
    },
    [allPudos]
  )

  // Dettagli singolo PUDO
  const getPudoById = useCallback(
    (id) => {
      if (!allPudos) return null
      return allPudos.find(p => p.id === id) || null
    },
    [allPudos]
  )

  return {
    // Stato
    allPudos,
    loading,
    error,
    stats,

    // Accesso ai dati
    filteredPudos,
    searchPudosByTerm,
    getPudoById,
    getPudosBySubRegion,
    getPudosByMunicipality,
    getPudosInBounds,

    // Grouping
    bySubRegion,
    byMunicipality,
  }
}

/**
 * Hook semplificato per carica PUDO di una provincia
 */
export function usePudosBySubRegion(subRegion, limit = 100, offset = 0) {
  const { getPudosBySubRegion, loading } = usePudosLoader()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!loading) {
      const result = getPudosBySubRegion(subRegion, limit, offset)
      setData(result)
    }
  }, [subRegion, limit, offset, loading, getPudosBySubRegion])

  return { data, loading }
}

/**
 * Hook semplificato per PUDO in bounds geografico
 */
export function usePudosInBounds(bounds) {
  const { getPudosInBounds, loading } = usePudosLoader()
  const [pudos, setPudos] = useState([])

  useEffect(() => {
    if (!loading && bounds) {
      const result = getPudosInBounds(bounds)
      setPudos(result)
    }
  }, [bounds, loading, getPudosInBounds])

  return { pudos, loading }
}
