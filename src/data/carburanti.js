// ===== STORICO PREZZI CARBURANTI =====
// Dati storici in json/carburanti.json
// Metadati e configurazione rimangono qui
import _prezzi from './json/carburanti.json'

export const PREZZI_CARBURANTI = _prezzi

// Unità di misura per ogni carburante
export const CARBURANTI_META = {
  diesel:    { label: 'Diesel',     unit: '€/L',   icon: '⛽', color: '#414042', bg: '#f0f0f0' },
  benzina:   { label: 'Benzina 95', unit: '€/L',   icon: '⛽', color: '#F57C00', bg: '#fff3e0' },
  gpl:       { label: 'GPL',        unit: '€/L',   icon: '🔵', color: '#6A1B9A', bg: '#f3e5f5' },
  elettrico: { label: 'Elettrico',  unit: '€/kWh', icon: '⚡', color: '#1565C0', bg: '#e3f0fb' },
}
