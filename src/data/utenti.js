// ===== GESTIONE UTENTI FERMOPOINT =====
// filialiIds: null = accesso a tutte le filiali (admin)
// filialiIds: ['F001', 'F002'] = accesso solo alle filiali specificate
// Dati puri in json/utenti.json
import _UTENTI from './json/utenti.json'

export const UTENTI_INIT = _UTENTI

export const AUTH_TYPES = ['password', 'sso']

export const AUTH_TYPE_CFG = {
  password: { label: 'Password', color: '#1565C0', bg: '#e3f0fb' },
  sso:      { label: 'SSO',      color: '#6B21A8', bg: '#f3e8ff' },
}

export const RUOLI = ['admin', 'user']

export const RUOLO_CFG = {
  admin: { label: 'Admin',  color: '#DC0032', bg: '#fff0f3' },
  user:  { label: 'User',   color: '#1565C0', bg: '#e3f0fb' },
}

export const STATI_UTENTE = ['Attivo', 'Inattivo', 'Sospeso']

export const STATO_UTENTE_CFG = {
  'Attivo':   { color: '#2E7D32', bg: '#e8f5e9' },
  'Inattivo': { color: '#808285', bg: '#f0f0f0' },
  'Sospeso':  { color: '#F57C00', bg: '#fff3e0' },
}
