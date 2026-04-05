// ===== FILIALI BRT =====
// Dati puri (200 sedi) in json/filialiBrt.json
import _FILIALI_BRT from './json/filialiBrt.json'

export const FILIALI_BRT  = _FILIALI_BRT
export const PROVINCE_BRT = [...new Set(FILIALI_BRT.map(f => f.provincia))].sort()
export const REGIONI_BRT  = [...new Set(FILIALI_BRT.map(f => f.regione))].sort()
export default FILIALI_BRT
