/**
 * Scenario Favorites Service
 * Manages favorite scenarios with localStorage persistence
 */

const STORAGE_KEY = 'fp_ct_scenario_favorites'

/**
 * Initialize favorites from localStorage
 * @returns {array} Array of favorite scenario IDs
 */
export function loadFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (e) {
    console.error('Error loading favorites:', e)
    return []
  }
}

/**
 * Save favorites to localStorage
 * @param {array} favorites - Array of favorite scenario IDs
 */
function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (e) {
    console.error('Error saving favorites:', e)
  }
}

/**
 * Toggle scenario as favorite
 * @param {string} scenarioId - Unique scenario identifier
 * @returns {boolean} New favorite state (true = added, false = removed)
 */
export function toggleFavorite(scenarioId) {
  const favorites = loadFavorites()
  const index = favorites.indexOf(scenarioId)

  if (index > -1) {
    // Remove from favorites
    favorites.splice(index, 1)
    saveFavorites(favorites)
    return false
  } else {
    // Add to favorites
    favorites.push(scenarioId)
    saveFavorites(favorites)
    return true
  }
}

/**
 * Check if scenario is in favorites
 * @param {string} scenarioId - Unique scenario identifier
 * @returns {boolean} True if favorite
 */
export function isFavorite(scenarioId) {
  const favorites = loadFavorites()
  return favorites.includes(scenarioId)
}

/**
 * Add scenario to favorites
 * @param {string} scenarioId - Unique scenario identifier
 */
export function addFavorite(scenarioId) {
  const favorites = loadFavorites()
  if (!favorites.includes(scenarioId)) {
    favorites.push(scenarioId)
    saveFavorites(favorites)
  }
}

/**
 * Remove scenario from favorites
 * @param {string} scenarioId - Unique scenario identifier
 */
export function removeFavorite(scenarioId) {
  const favorites = loadFavorites()
  const index = favorites.indexOf(scenarioId)
  if (index > -1) {
    favorites.splice(index, 1)
    saveFavorites(favorites)
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Get count of favorite scenarios
 * @returns {number} Number of favorite scenarios
 */
export function getFavoritesCount() {
  return loadFavorites().length
}

/**
 * Get all favorite scenario IDs
 * @returns {array} Array of favorite scenario IDs
 */
export function getFavorites() {
  return loadFavorites()
}

/**
 * Generate scenario ID from scenario parameters
 * Useful for uniquely identifying scenarios
 * @param {object} scenarioData - The scenario parameters
 * @returns {string} Unique scenario identifier
 */
export function generateScenarioId(scenarioData) {
  const key = `${scenarioData.filialeId}_${scenarioData.dataGiri}_${Array.from(scenarioData.pudoSelezionati).sort().join(',')}`
  // Simple hash function
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
