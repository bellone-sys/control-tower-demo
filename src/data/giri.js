// ===== GIRI FERMOPOINT =====

import { GIRI_ROMA } from './giri/roma'
import { GIRI_NAPOLI } from './giri/napoli'
import { GIRI_MILANO } from './giri/milano'
import { GIRI_STEZZANO } from './giri/stezzano'

export const STATI_GIRO = ['Pianificato', 'In corso', 'Completato', 'Annullato']

// ────────────────────────────────────────────────────────
// GIRI INIT — Aggregati da dataset per filiale
// ────────────────────────────────────────────────────────
export const GIRI_INIT = [
  ...GIRI_ROMA,
  ...GIRI_NAPOLI,
  ...GIRI_MILANO,
  ...GIRI_STEZZANO,
]

// ────────────────────────────────────────────────────────
// TEMPLATE — 3 template predefiniti
// ────────────────────────────────────────────────────────
export const TEMPLATE_INIT = [
  {
    id: 'TPL001',
    nome: 'Template Roma Est',
    filialeId: 'F001',
    autoreId: 'D001',
    mezzoId: 'M003',
    depotLat: 41.9042,
    depotLng: 12.4618,
    note: 'Giro mattutino zona est con locker e negozi',
    tappe: [
      { pudoId: 'IT16481', pudoNome: 'Espresso 32', lat: 41.8945, lng: 12.5090, tipo: 'locker',  oraArrivo: '07:30', oraPartenza: '07:45', ordine: 1 },
      { pudoId: 'IT10025', pudoNome: 'Gomma Matita e...', lat: 41.9435, lng: 12.5174, tipo: 'negozio', oraArrivo: '08:05', oraPartenza: '08:20', ordine: 2 },
      { pudoId: 'IT10124', pudoNome: 'Tabacchi - Roma1', lat: 41.8655, lng: 12.4950, tipo: 'negozio', oraArrivo: '08:50', oraPartenza: '09:05', ordine: 3 },
      { pudoId: 'IT16850', pudoNome: 'Conad Roma 2', lat: 41.8590, lng: 12.5680, tipo: 'locker',  oraArrivo: '09:30', oraPartenza: '09:45', ordine: 4 },
      { pudoId: 'IT10178', pudoNome: 'Nuova Ottica Romanina', lat: 41.8510, lng: 12.5990, tipo: 'negozio', oraArrivo: '10:10', oraPartenza: '10:25', ordine: 5 },
      { pudoId: 'IT15887', pudoNome: 'Centro Sportivo Roma 70', lat: 41.8776, lng: 12.6268, tipo: 'locker',  oraArrivo: '10:50', oraPartenza: '11:05', ordine: 6 },
    ],
  },
  {
    id: 'TPL002',
    nome: 'Template Roma Sud',
    filialeId: 'F001',
    autoreId: 'D003',
    mezzoId: 'M001',
    depotLat: 41.7900,
    depotLng: 12.4500,
    note: 'Giro zona sud con estensione ai Castelli',
    tappe: [
      { pudoId: 'IT10157', pudoNome: 'Compro Oro - Roma', lat: 41.7906, lng: 12.4082, tipo: 'negozio', oraArrivo: '07:30', oraPartenza: '07:45', ordine: 1 },
      { pudoId: 'IT10133', pudoNome: 'Ferramenta Proietti', lat: 41.7607, lng: 12.3033, tipo: 'negozio', oraArrivo: '08:20', oraPartenza: '08:35', ordine: 2 },
      { pudoId: 'IT10149', pudoNome: 'G & T Travel', lat: 41.7383, lng: 12.2862, tipo: 'negozio', oraArrivo: '09:05', oraPartenza: '09:20', ordine: 3 },
      { pudoId: 'IT10160', pudoNome: 'Bar la Grotta', lat: 41.6226, lng: 12.4655, tipo: 'negozio', oraArrivo: '10:10', oraPartenza: '10:25', ordine: 4 },
      { pudoId: 'IT15452', pudoNome: 'IP Matic', lat: 41.5869, lng: 12.4994, tipo: 'locker',  oraArrivo: '11:00', oraPartenza: '11:15', ordine: 5 },
    ],
  },
  {
    id: 'TPL003',
    nome: 'Template Roma Nord',
    filialeId: 'F002',
    autoreId: 'D002',
    mezzoId: 'M007',
    depotLat: 41.9300,
    depotLng: 12.4700,
    note: 'Giro zona nord con estensione Monterotondo',
    tappe: [
      { pudoId: 'IT12447', pudoNome: 'Insectum Store', lat: 41.9129, lng: 12.4157, tipo: 'locker',  oraArrivo: '07:45', oraPartenza: '08:00', ordine: 1 },
      { pudoId: 'IT10006', pudoNome: 'Ricevitoria-Gastronomia', lat: 41.9176, lng: 12.3743, tipo: 'negozio', oraArrivo: '08:25', oraPartenza: '08:40', ordine: 2 },
      { pudoId: 'IT10127', pudoNome: 'GM Servizi', lat: 42.1020, lng: 12.5591, tipo: 'negozio', oraArrivo: '09:20', oraPartenza: '09:35', ordine: 3 },
      { pudoId: 'IT10040', pudoNome: 'Non solo video', lat: 41.8789, lng: 12.4622, tipo: 'negozio', oraArrivo: '10:15', oraPartenza: '10:30', ordine: 4 },
    ],
  },
]
