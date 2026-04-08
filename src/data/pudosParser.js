/**
 * Parser per CSV PUDO Fermopoint
 * Normalizza righe JSON-stringificate in strutture usabili
 */

// Cache globale per evitare riparse
let PARSED_PUDOS_CACHE = null
let PARSING_PROMISE = null

/**
 * Parsa una riga CSV (4 colonne JSON-stringificate)
 */
function parseCSVRow(row) {
  try {
    // Split per virgola ma rispettando le quote
    const cols = row.split('","')

    if (cols.length < 4) return null

    // Rimuovi le virgolette iniziali/finali e unescape
    const pudoStr = cols[0].replace(/^"/, '').replace(/""/, '"')
    const locStr = cols[1].replace(/""/, '"')
    const schedStr = cols[2].replace(/""/, '"')
    const timeStr = cols[3].replace(/""/, '"').replace(/"$/, '').replace(/""/, '"')

    const pudo = JSON.parse(pudoStr)
    const location = JSON.parse(locStr)
    const schedule = JSON.parse(schedStr)
    const timeSlot = JSON.parse(timeStr)

    return { pudo, location, schedule, timeSlot }
  } catch (e) {
    console.error('Parse error:', e.message)
    return null
  }
}

/**
 * Normalizza i dati parsati in un oggetto PUDO completo
 */
function normalizePudo(parsed) {
  const { pudo, location, schedule, timeSlot } = parsed

  return {
    id: pudo.id,
    name: pudo.name,
    municipality: location.municipality,
    region: location.region,
    subRegion: location.sub_region, // es. RM, MI, NA
    postalCode: location.postal_code,
    street: location.street,
    houseNumber: location.house_number,
    latitude: location.latitude,
    longitude: location.longitude,
    dayOfWeek: schedule.day_of_week,
    isClosed: schedule.closed,
    openingTime: timeSlot.opening_time,
    closingTime: timeSlot.closing_time,
    active: pudo.active,
    available: pudo.available,
    archived: pudo.archived,
    createdDate: pudo.creation_date,
    modifiedDate: pudo.last_modified_date,
    modifiedBy: pudo.last_modified_user,
    ci: pudo.ci,
  }
}

/**
 * Carica e parsa il CSV PUDO
 * Ritorna un array di PUDO normalizzati
 */
async function loadAndParsePudos() {
  // Se è già in cache, ritorna
  if (PARSED_PUDOS_CACHE) {
    return PARSED_PUDOS_CACHE
  }

  // Se parsing è già in corso, aspetta
  if (PARSING_PROMISE) {
    return PARSING_PROMISE
  }

  PARSING_PROMISE = (async () => {
    try {
      console.log('📦 Caricamento PUDO in corso...')
      const response = await fetch('/control-tower-demo/pudos_202604081423.csv')
      const text = await response.text()

      const lines = text.split('\n').slice(1) // Skip header
      const pudos = []

      console.log(`📊 Parsing ${lines.length} righe...`)

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parsed = parseCSVRow(line)
        if (parsed) {
          const normalized = normalizePudo(parsed)
          pudos.push(normalized)
        }

        // Log progress ogni 50K righe
        if ((i + 1) % 50000 === 0) {
          console.log(`  ✓ Processati ${i + 1}/${lines.length} (${Math.round((i + 1) / lines.length * 100)}%)`)
        }
      }

      PARSED_PUDOS_CACHE = pudos
      console.log(`✅ Caricamento completato: ${pudos.length} PUDO`)

      return pudos
    } catch (err) {
      console.error('❌ Errore durante il caricamento:', err)
      throw err
    }
  })()

  return PARSING_PROMISE
}

/**
 * Filtra PUDO per regione/provincia
 */
function filterPudos(pudos, { region, subRegion, municipality, isActive = true, isArchived = false }) {
  return pudos.filter(p => {
    if (region && p.region !== region) return false
    if (subRegion && p.subRegion !== subRegion) return false
    if (municipality && p.municipality !== municipality) return false
    if (isActive !== null && p.active !== isActive) return false
    if (isArchived !== null && p.archived !== isArchived) return false
    return true
  })
}

/**
 * Raggruppa PUDO per provincia
 */
function groupBySubRegion(pudos) {
  const groups = {}
  pudos.forEach(p => {
    const key = p.subRegion || 'UNKNOWN'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(p)
  })
  return groups
}

/**
 * Raggruppa PUDO per comune
 */
function groupByMunicipality(pudos) {
  const groups = {}
  pudos.forEach(p => {
    const key = p.municipality || 'UNKNOWN'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(p)
  })
  return groups
}

/**
 * Ottieni statistiche sui PUDO
 */
function getStatistics(pudos) {
  return {
    total: pudos.length,
    active: pudos.filter(p => p.active).length,
    available: pudos.filter(p => p.available).length,
    archived: pudos.filter(p => p.archived).length,
    bySubRegion: Object.keys(groupBySubRegion(pudos)),
    byMunicipality: Object.keys(groupByMunicipality(pudos)),
  }
}

/**
 * Ricerca PUDO per nome
 */
function searchPudos(pudos, searchTerm) {
  const term = searchTerm.toLowerCase()
  return pudos.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.municipality.toLowerCase().includes(term) ||
    p.postalCode.includes(term) ||
    p.street.toLowerCase().includes(term)
  )
}

export {
  loadAndParsePudos,
  filterPudos,
  groupBySubRegion,
  groupByMunicipality,
  getStatistics,
  searchPudos,
}
