// ===== GESTIONE UTENTI FERMOPOINT =====
// filialiIds: null = accesso a tutte le filiali (admin)
// filialiIds: ['F001', 'F002'] = accesso solo alle filiali specificate

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

export const UTENTI_INIT = [
  {
    id: 'U001',
    nome: 'Marco Belloni',
    email: 'admin@fermopoint.it',
    password: 'demo1234',
    ruolo: 'admin',
    filialiIds: null,           // null = tutte le filiali
    stato: 'Attivo',
    dataCreazione: '2016-01-15',
    ultimoAccesso: '2026-04-03',
  },
  {
    id: 'U002',
    nome: 'Sara Conti',
    email: 'ops@fermopoint.it',
    password: 'demo1234',
    ruolo: 'user',
    filialiIds: ['F001', 'F002', 'F003'],
    stato: 'Attivo',
    dataCreazione: '2018-03-20',
    ultimoAccesso: '2026-04-02',
  },
  {
    id: 'U003',
    nome: 'Luca Ferri',
    email: 'l.ferri@fermopoint.it',
    password: 'demo1234',
    ruolo: 'user',
    filialiIds: ['F002'],       // solo Milano Bovisa
    stato: 'Attivo',
    dataCreazione: '2020-06-01',
    ultimoAccesso: '2026-04-01',
  },
  {
    id: 'U004',
    nome: 'Anna Volpe',
    email: 'a.volpe@fermopoint.it',
    password: 'demo1234',
    ruolo: 'user',
    filialiIds: ['F001'],       // solo Napoli Centro
    stato: 'Attivo',
    dataCreazione: '2021-02-14',
    ultimoAccesso: '2026-03-30',
  },
  {
    id: 'U005',
    nome: 'Giorgio Brambilla',
    email: 'g.brambilla@fermopoint.it',
    password: 'demo1234',
    ruolo: 'user',
    filialiIds: ['F003'],       // solo Stezzano
    stato: 'Attivo',
    dataCreazione: '2019-09-10',
    ultimoAccesso: '2026-03-28',
  },
  {
    id: 'U006',
    nome: 'Carla Ricci',
    email: 'c.ricci@fermopoint.it',
    password: 'demo1234',
    ruolo: 'user',
    filialiIds: ['F002', 'F003'],
    stato: 'Inattivo',
    dataCreazione: '2017-11-22',
    ultimoAccesso: '2025-12-15',
  },
  {
    id: 'U007',
    nome: 'Davide Mancini',
    email: 'd.mancini@fermopoint.it',
    password: 'demo1234',
    ruolo: 'user',
    filialiIds: ['F001', 'F002'],
    stato: 'Sospeso',
    dataCreazione: '2022-04-03',
    ultimoAccesso: '2026-02-10',
  },
]
