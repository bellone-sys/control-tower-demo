/**
 * History Service — Cronologia modifiche per entità
 *
 * Architettura:
 *  - Mock: localStorage (sviluppo/demo)
 *  - Produzione: swap con chiamate REST → /api/history/:entityType/:entityId
 *
 * Modello dati di un evento:
 * {
 *   id:         string   — UUID evento
 *   entityType: string   — 'giro' | 'pudo' | 'filiale' | 'scenario'
 *   entityId:   string   — ID dell'entità modificata
 *   action:     string   — 'create' | 'update' | 'delete' | 'status_change'
 *   field:      string?  — campo modificato (per action 'update')
 *   oldValue:   any?     — valore precedente
 *   newValue:   any?     — nuovo valore
 *   label:      string   — descrizione leggibile
 *   userId:     string   — ID utente che ha eseguito l'azione
 *   userName:   string   — nome utente
 *   timestamp:  string   — ISO 8601
 * }
 */

const STORAGE_KEY = 'fp_ct_history'
const MAX_EVENTS  = 2000   // cap per non saturare localStorage in demo

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(events) {
  try {
    // Keep only the most recent MAX_EVENTS
    const trimmed = events.slice(-MAX_EVENTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch { /* ignore quota errors in demo */ }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Record a history event for an entity.
 * @param {object} params
 * @param {'giro'|'pudo'|'filiale'|'scenario'} params.entityType
 * @param {string}  params.entityId
 * @param {'create'|'update'|'delete'|'status_change'} params.action
 * @param {string}  params.label       — human-readable description
 * @param {string}  [params.field]     — modified field name
 * @param {any}     [params.oldValue]
 * @param {any}     [params.newValue]
 * @param {string}  [params.userId]
 * @param {string}  [params.userName]
 * @returns {object} the recorded event
 */
export function recordEvent({ entityType, entityId, action, label, field, oldValue, newValue, userId = 'U001', userName = 'Utente' }) {
  const event = {
    id:         uid(),
    entityType,
    entityId,
    action,
    field:      field     ?? null,
    oldValue:   oldValue  ?? null,
    newValue:   newValue  ?? null,
    label,
    userId,
    userName,
    timestamp:  new Date().toISOString(),
  }
  const all = loadAll()
  all.push(event)
  saveAll(all)
  return event
}

/**
 * Get history for a specific entity.
 * @param {'giro'|'pudo'|'filiale'|'scenario'} entityType
 * @param {string} entityId
 * @param {number} [limit=50]
 * @returns {object[]} events sorted newest first
 */
export function getEntityHistory(entityType, entityId, limit = 50) {
  const all = loadAll()
  return all
    .filter(e => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}

/**
 * Get history for all entities of a given type.
 * @param {'giro'|'pudo'|'filiale'|'scenario'} entityType
 * @param {number} [limit=100]
 * @returns {object[]} events sorted newest first
 */
export function getTypeHistory(entityType, limit = 100) {
  const all = loadAll()
  return all
    .filter(e => e.entityType === entityType)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}

/**
 * Get global history across all entities.
 * @param {number} [limit=200]
 * @returns {object[]}
 */
export function getGlobalHistory(limit = 200) {
  const all = loadAll()
  return all
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}

/**
 * Clear history for a specific entity (admin only).
 */
export function clearEntityHistory(entityType, entityId) {
  const all = loadAll().filter(e => !(e.entityType === entityType && e.entityId === entityId))
  saveAll(all)
}

/**
 * Clear all history (admin only).
 */
export function clearAllHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Seed some demo events so the timeline isn't empty on first load.
 */
export function seedDemoHistory() {
  const existing = loadAll()
  if (existing.length > 0) return  // already seeded

  const now   = Date.now()
  const day   = 86_400_000
  const seeds = [
    { entityType: 'giro',    entityId: 'GR001', action: 'create',        label: 'Giro "Roma Est AM" creato',            userId: 'U001', userName: 'Admin',   timestamp: new Date(now - 5 * day).toISOString() },
    { entityType: 'giro',    entityId: 'GR001', action: 'update',        label: 'Numero tappe aggiornato (5 → 6)',       userId: 'U002', userName: 'Manager', timestamp: new Date(now - 4 * day).toISOString(), field: 'tappe', oldValue: 5, newValue: 6 },
    { entityType: 'giro',    entityId: 'GR002', action: 'create',        label: 'Giro "Roma Nord" creato',              userId: 'U001', userName: 'Admin',   timestamp: new Date(now - 4 * day).toISOString() },
    { entityType: 'giro',    entityId: 'GR001', action: 'status_change', label: 'Stato: Pianificato → In corso',        userId: 'U002', userName: 'Manager', timestamp: new Date(now - 2 * day).toISOString(), field: 'stato', oldValue: 'Pianificato', newValue: 'In corso' },
    { entityType: 'giro',    entityId: 'GR001', action: 'status_change', label: 'Stato: In corso → Completato',         userId: 'U002', userName: 'Manager', timestamp: new Date(now - 1 * day).toISOString(), field: 'stato', oldValue: 'In corso',    newValue: 'Completato' },
    { entityType: 'filiale', entityId: 'F_ROMA', action: 'update',       label: 'Email responsabile aggiornata',        userId: 'U001', userName: 'Admin',   timestamp: new Date(now - 3 * day).toISOString(), field: 'emailResponsabile', oldValue: 'vecchia@fp.it', newValue: 'rossi.r@fermopoint.it' },
    { entityType: 'filiale', entityId: 'F002',   action: 'update',       label: 'Superficie aggiornata (1800 → 1850)',  userId: 'U001', userName: 'Admin',   timestamp: new Date(now - 6 * day).toISOString(), field: 'superficie', oldValue: 1800, newValue: 1850 },
    { entityType: 'pudo',    entityId: 'IT16481', action: 'update',      label: 'Stato modificato: Attivo → Inattivo',  userId: 'U002', userName: 'Manager', timestamp: new Date(now - 2 * day).toISOString(), field: 'stato', oldValue: 'Attivo', newValue: 'Inattivo' },
    { entityType: 'pudo',    entityId: 'IT10025', action: 'create',      label: 'PUDO "Gomma Matita" registrato',       userId: 'U001', userName: 'Admin',   timestamp: new Date(now - 7 * day).toISOString() },
    { entityType: 'scenario', entityId: 'SC001',  action: 'create',      label: 'Scenario "Roma Est Q2" creato',        userId: 'U002', userName: 'Manager', timestamp: new Date(now - 1 * day).toISOString() },
  ].map(e => ({ id: uid(), ...e }))

  saveAll(seeds)
}
