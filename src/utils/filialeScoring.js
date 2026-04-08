/**
 * Calcola lo score di una filiale BRT in base a:
 * - Distanza dal baricentro dei PUDO ad alto CI
 * - Capacità della filiale
 */
export function calculateFilialeScore({
  filiale,
  center,          // { lat, lng, count, ciMedio }
  maxDistance = 50, // km
  weightDistance = 0.6,
  weightCapacity = 0.4,
  calculateDistance, // funzione
  getCapacityScore,  // funzione
}) {
  if (!center) return null

  // Score distanza (0-100): più vicino = più alto
  const distance = calculateDistance(center.lat, center.lng, filiale.lat, filiale.lng)
  const distanceScore = Math.max(0, 100 - (distance / maxDistance) * 100)

  // Score capacità (0-100)
  const capacityScore = getCapacityScore(filiale)

  // Score finale ponderato
  const finalScore = distanceScore * weightDistance + capacityScore * weightCapacity

  return {
    filialeId: filiale.id,
    filialeNome: filiale.nome,
    filialeCitta: filiale.citta,
    filialeProvincia: filiale.provincia,
    distance: Math.round(distance * 10) / 10,
    distanceScore: Math.round(distanceScore),
    capacityScore: Math.round(capacityScore),
    finalScore: Math.round(finalScore),
    breakdown: {
      distance: {
        value: Math.round(distance * 10) / 10,
        maxValue: maxDistance,
        score: Math.round(distanceScore),
        weight: weightDistance,
      },
      capacity: {
        value: filiale.capacita,
        score: Math.round(capacityScore),
        weight: weightCapacity,
      },
    },
  }
}

/**
 * Assegna capacità a una filiale basata su dati di default
 * @param {Object} filiale
 * @returns {Object} filiale con capacita (m²) e personale
 */
export function enrichFilialeWithCapacity(filiale) {
  // Capacità base per regione/città (in m²)
  const baseCapacity = {
    'Roma': 500,
    'Milano': 550,
    'Napoli': 450,
    'Torino': 400,
    'Palermo': 350,
  }

  const defaultCapacity = 350
  const cityCapacity = baseCapacity[filiale.citta] || defaultCapacity

  // Aggiungi piccola variazione basata su ID
  const idSeed = parseInt(filiale.id.replace(/\D/g, ''), 10)
  const variance = (idSeed % 100 - 50) * 2 // ±100
  const capacita = Math.max(200, cityCapacity + variance)

  return {
    ...filiale,
    capacita: Math.round(capacita / 25) * 25, // Round to nearest 25 m²
    personale: Math.round(capacita / 50), // ~1 persona ogni 50 m²
  }
}

/**
 * Calcola score capacità (0-100)
 * Basato sulla capacità della filiale
 */
export function getCapacityScore(filiale) {
  const maxCapacity = 600
  const minCapacity = 150

  if (!filiale.capacita) return 0

  const normalized = (filiale.capacita - minCapacity) / (maxCapacity - minCapacity)
  return Math.max(0, Math.min(100, normalized * 100))
}

/**
 * Ordina le filiali per score finale
 */
export function rankFilialiByScore(filialeScores) {
  return filialeScores
    .filter(f => f !== null)
    .sort((a, b) => b.finalScore - a.finalScore)
}
