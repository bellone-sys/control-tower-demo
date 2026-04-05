/**
 * Address Normalization Service
 * Simulates AWS Location Services address normalization
 * Mock implementation using fuzzy matching and known address database
 */

import pudosRoma from '../data/pudosRoma.json'
import { FILIALI } from '../data/filiali'
import { FILIALI_BRT } from '../data/brtFiliali'

/**
 * Simple Levenshtein distance calculation
 * Returns number of edits needed to transform one string into another
 */
function levenshteinDistance(a, b) {
  const aLen = a.length
  const bLen = b.length
  const dp = Array(bLen + 1).fill(0).map(() => Array(aLen + 1).fill(0))

  for (let i = 0; i <= aLen; i++) dp[0][i] = i
  for (j = 0; j <= bLen; j++) dp[j][0] = j

  for (let j = 1; j <= bLen; j++) {
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[j][i] = Math.min(
        dp[j][i - 1] + 1,      // insertion
        dp[j - 1][i] + 1,      // deletion
        dp[j - 1][i - 1] + cost // substitution
      )
    }
  }
  return dp[bLen][aLen]
}

/**
 * Calculate similarity score (0-1) between two strings
 * Higher = more similar
 */
function similarityScore(a, b) {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  return 1 - (distance / maxLen)
}

/**
 * Build knowledge base of known addresses
 */
function buildKnowledgeBase() {
  const addresses = []

  // Add PUDO addresses
  pudosRoma.forEach(pudo => {
    addresses.push({
      type: 'pudo',
      original: pudo.name,
      normalized: pudo.name,
      id: pudo.id,
      lat: pudo.lat,
      lng: pudo.lng,
      city: 'Roma',
      province: 'RM',
      region: 'Lazio',
      country: 'Italia',
      confidence: 1,
    })
  })

  // Add Filiali addresses
  FILIALI.forEach(filiale => {
    addresses.push({
      type: 'filiale',
      original: `${filiale.via}, ${filiale.citta}`,
      normalized: `${filiale.via.toUpperCase()}, ${filiale.cap} ${filiale.citta.toUpperCase()}, ${filiale.provincia}`,
      id: filiale.id,
      lat: filiale.lat,
      lng: filiale.lng,
      city: filiale.citta,
      province: filiale.provincia,
      region: filiale.regione,
      country: 'Italia',
      confidence: 1,
    })
  })

  // Add BRT Filiali addresses
  FILIALI_BRT.forEach(filiale => {
    addresses.push({
      type: 'filiale_brt',
      original: `${filiale.via}, ${filiale.citta}`,
      normalized: `${filiale.via.toUpperCase()}, ${filiale.cap} ${filiale.citta.toUpperCase()}, ${filiale.provincia}`,
      id: filiale.id,
      lat: filiale.lat,
      lng: filiale.lng,
      city: filiale.citta,
      province: filiale.provincia,
      region: filiale.regione,
      country: 'Italia',
      confidence: 1,
    })
  })

  return addresses
}

const KNOWLEDGE_BASE = buildKnowledgeBase()

/**
 * Normalize a single address
 * Returns: { original, normalized, components, confidence, type, id?, lat?, lng? }
 */
export async function normalizeAddress(input) {
  if (!input || input.trim().length === 0) {
    return null
  }

  const inputClean = input.trim()

  // Try exact match first
  const exactMatch = KNOWLEDGE_BASE.find(addr =>
    addr.original.toLowerCase() === inputClean.toLowerCase() ||
    addr.normalized.toLowerCase() === inputClean.toLowerCase()
  )

  if (exactMatch) {
    return {
      original: inputClean,
      normalized: exactMatch.normalized,
      confidence: 1,
      type: exactMatch.type,
      id: exactMatch.id,
      components: {
        street: exactMatch.original,
        city: exactMatch.city,
        postalCode: '',
        province: exactMatch.province,
        region: exactMatch.region,
        country: exactMatch.country,
      },
      lat: exactMatch.lat,
      lng: exactMatch.lng,
    }
  }

  // Fuzzy match
  const matches = KNOWLEDGE_BASE
    .map(addr => ({
      ...addr,
      score: similarityScore(inputClean, addr.original),
    }))
    .filter(m => m.score > 0.5)
    .sort((a, b) => b.score - a.score)

  if (matches.length > 0) {
    const best = matches[0]
    return {
      original: inputClean,
      normalized: best.normalized,
      confidence: Math.round(best.score * 100) / 100,
      type: best.type,
      id: best.id,
      components: {
        street: best.original,
        city: best.city,
        postalCode: '',
        province: best.province,
        region: best.region,
        country: best.country,
      },
      lat: best.lat,
      lng: best.lng,
    }
  }

  // No match found
  return {
    original: inputClean,
    normalized: inputClean,
    confidence: 0,
    type: 'unknown',
    components: {
      street: inputClean,
      city: '',
      postalCode: '',
      province: '',
      region: '',
      country: 'Italia',
    },
  }
}

/**
 * Suggest addresses based on partial input
 * Returns: array of suggestions with confidence scores
 */
export async function suggestAddresses(partial, limit = 5) {
  if (!partial || partial.trim().length < 2) {
    return []
  }

  const inputClean = partial.trim().toLowerCase()

  const suggestions = KNOWLEDGE_BASE
    .map(addr => ({
      ...addr,
      score: similarityScore(inputClean, addr.original),
    }))
    .filter(m => m.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(m => ({
      original: m.original,
      normalized: m.normalized,
      confidence: Math.round(m.score * 100) / 100,
      type: m.type,
      id: m.id,
      city: m.city,
      province: m.province,
    }))

  return suggestions
}

/**
 * Batch normalize multiple addresses
 */
export async function normalizeAddressesBatch(addresses) {
  return Promise.all(addresses.map(addr => normalizeAddress(addr)))
}
