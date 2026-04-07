const SCENARI_KEY = 'fp_scenari_meta'
const RISORSE_KEY = 'fp_giri_risorse'
const EXTRAS_KEY  = 'fp_scenari_extras'

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') }
  catch { return {} }
}
function loadArr(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') }
  catch { return [] }
}

export function getScenarioMeta(id) {
  return load(SCENARI_KEY)[id] || {}
}

export function saveScenarioMeta(id, patch) {
  const all = load(SCENARI_KEY)
  all[id] = { ...all[id], ...patch }
  localStorage.setItem(SCENARI_KEY, JSON.stringify(all))
  return all[id]
}

export function getRisorseGiro(giroId) {
  return load(RISORSE_KEY)[giroId] || null
}

export function saveRisorseGiro(giroId, risorse) {
  const all = load(RISORSE_KEY)
  all[giroId] = risorse
  localStorage.setItem(RISORSE_KEY, JSON.stringify(all))
}

export function getAllRisorse() {
  return load(RISORSE_KEY)
}

export function isActivoOggi(meta) {
  if (!meta?.attivo) return false
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const todayDay = today.getDay()
  const s = meta.schedulazione
  if (!s) return true
  if (s.dataInizio && todayStr < s.dataInizio) return false
  if (s.dataFine && todayStr > s.dataFine) return false
  if (s.giorni?.length && !s.giorni.includes(todayDay)) return false
  return true
}

export function isInRange(meta) {
  const s = meta?.schedulazione
  if (!s) return true
  const today = new Date().toISOString().slice(0, 10)
  if (s.dataInizio && today < s.dataInizio) return false
  if (s.dataFine && today > s.dataFine) return false
  return true
}

// ── Extra / cloned scenarios ────────────────────────────────────────────────

export function getExtraScenari() {
  return loadArr(EXTRAS_KEY)
}

export function addExtraScenario(filialeId, label) {
  const extras = loadArr(EXTRAS_KEY)
  const id = `SC_${filialeId}_${Date.now()}`
  extras.push({ id, filialeId, label })
  localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras))
  return id
}

export function deleteExtraScenario(id) {
  const extras = loadArr(EXTRAS_KEY).filter(e => e.id !== id)
  localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras))
  // also remove its meta
  const all = load(SCENARI_KEY)
  delete all[id]
  localStorage.setItem(SCENARI_KEY, JSON.stringify(all))
}
