// ===== STUB DATA — Fermopoint Control Tower =====

// DEMO_USERS è ora derivato da UTENTI_INIT in utenti.js
// Manteniamo questo array per compatibilità col Login
import { UTENTI_INIT } from './utenti'

export const DEMO_USERS = UTENTI_INIT.map(u => ({
  id:          u.id,
  email:       u.email,
  password:    u.password,
  name:        u.nome,
  ruolo:       u.ruolo,
  filialiIds:  u.filialiIds,
  avatar:      u.nome.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(),
}))

export const KPI = {
  spedizioniOggi: 1248,
  spedizioniOggiDelta: +8.3,
  tassoConsegna: 94.2,
  tassoConsegnaDelta: +1.1,
  eccezioniAperte: 37,
  eccezioniAperteDelta: -12.4,
  puntiRitiroAttivi: 312,
  puntiRitiroDelta: +4,
}

export const SPEDIZIONI = [
  { id: 'FP240001', destinatario: 'Giovanni Rossi', comune: 'Milano', punto: 'Tabaccheria Centrale', stato: 'In custodia', data: '2026-04-03', giorni: 1, priorita: 'normal' },
  { id: 'FP240002', destinatario: 'Lucia Bianchi', comune: 'Roma', punto: 'Edicola Prati', stato: 'Consegnato', data: '2026-04-02', giorni: 0, priorita: 'normal' },
  { id: 'FP240003', destinatario: 'Marco Ferrari', comune: 'Torino', punto: 'Bar Sport Lingotto', stato: 'In transito', data: '2026-04-03', giorni: null, priorita: 'normal' },
  { id: 'FP240004', destinatario: 'Anna Greco', comune: 'Napoli', punto: 'Cartolibreria Napoli Centro', stato: 'Scaduto', data: '2026-03-28', giorni: 6, priorita: 'high' },
  { id: 'FP240005', destinatario: 'Carlo Russo', comune: 'Bologna', punto: 'Supermercato Coop Bologna', stato: 'In custodia', data: '2026-04-01', giorni: 2, priorita: 'normal' },
  { id: 'FP240006', destinatario: 'Elena Marino', comune: 'Firenze', punto: 'Tabaccheria Santa Croce', stato: 'In custodia', data: '2026-04-03', giorni: 1, priorita: 'normal' },
  { id: 'FP240007', destinatario: 'Davide Conti', comune: 'Genova', punto: 'Edicola Porto', stato: 'Eccezione', data: '2026-04-02', giorni: null, priorita: 'high' },
  { id: 'FP240008', destinatario: 'Paola Esposito', comune: 'Palermo', punto: 'Bar Centrale Palermo', stato: 'Consegnato', data: '2026-04-02', giorni: 0, priorita: 'normal' },
  { id: 'FP240009', destinatario: 'Luca Ricci', comune: 'Venezia', punto: 'Cartoleria Mestre', stato: 'In transito', data: '2026-04-03', giorni: null, priorita: 'normal' },
  { id: 'FP240010', destinatario: 'Martina Costa', comune: 'Verona', punto: 'Tabaccheria Veronese', stato: 'In custodia', data: '2026-04-02', giorni: 2, priorita: 'normal' },
  { id: 'FP240011', destinatario: 'Roberto Gallo', comune: 'Bari', punto: 'Bar del Porto Bari', stato: 'Scaduto', data: '2026-03-29', giorni: 5, priorita: 'high' },
  { id: 'FP240012', destinatario: 'Simona Martini', comune: 'Catania', punto: 'Edicola Etna', stato: 'Consegnato', data: '2026-04-01', giorni: 0, priorita: 'normal' },
]

export const PUNTI_RITIRO = [
  { id: 'PR001', nome: 'Tabaccheria Centrale', comune: 'Milano', indirizzo: 'Via Torino 12', cap: '20123', stato: 'Attivo', capienza: 20, occupazione: 14, tipo: 'Tabaccheria', lat: 45.463, lng: 9.187 },
  { id: 'PR002', nome: 'Edicola Prati', comune: 'Roma', indirizzo: 'Via Cola di Rienzo 45', cap: '00192', stato: 'Attivo', capienza: 15, occupazione: 3, tipo: 'Edicola', lat: 41.908, lng: 12.459 },
  { id: 'PR003', nome: 'Bar Sport Lingotto', comune: 'Torino', indirizzo: 'Via Nizza 230', cap: '10126', stato: 'Attivo', capienza: 25, occupazione: 18, tipo: 'Bar', lat: 45.038, lng: 7.671 },
  { id: 'PR004', nome: 'Cartolibreria Napoli Centro', comune: 'Napoli', indirizzo: 'Via Toledo 88', cap: '80132', stato: 'Pieno', capienza: 10, occupazione: 10, tipo: 'Cartoleria', lat: 40.839, lng: 14.252 },
  { id: 'PR005', nome: 'Supermercato Coop Bologna', comune: 'Bologna', indirizzo: 'Via Rizzoli 6', cap: '40125', stato: 'Attivo', capienza: 40, occupazione: 12, tipo: 'Supermercato', lat: 44.494, lng: 11.343 },
  { id: 'PR006', nome: 'Tabaccheria Santa Croce', comune: 'Firenze', indirizzo: 'Piazza Santa Croce 3', cap: '50122', stato: 'Attivo', capienza: 12, occupazione: 7, tipo: 'Tabaccheria', lat: 43.769, lng: 11.261 },
  { id: 'PR007', nome: 'Edicola Porto', comune: 'Genova', indirizzo: 'Via Gramsci 10', cap: '16126', stato: 'Manutenzione', capienza: 18, occupazione: 0, tipo: 'Edicola', lat: 44.408, lng: 8.932 },
  { id: 'PR008', nome: 'Bar Centrale Palermo', comune: 'Palermo', indirizzo: 'Via Maqueda 65', cap: '90133', stato: 'Attivo', capienza: 15, occupazione: 4, tipo: 'Bar', lat: 38.113, lng: 13.360 },
]

export const ECCEZIONI = [
  { id: 'EC001', spedizioneId: 'FP240004', tipo: 'Scaduto', descrizione: 'Pacco non ritirato entro 6 giorni lavorativi', comune: 'Napoli', gravita: 'alta', data: '2026-04-02', assegnato: 'Ops Team', stato: 'Aperta' },
  { id: 'EC002', spedizioneId: 'FP240007', tipo: 'Indirizzo errato', descrizione: 'Destinatario sconosciuto al PUDO', comune: 'Genova', gravita: 'alta', data: '2026-04-02', assegnato: 'Ops Team', stato: 'In gestione' },
  { id: 'EC003', spedizioneId: 'FP240011', tipo: 'Scaduto', descrizione: 'Pacco non ritirato entro 5 giorni lavorativi', comune: 'Bari', gravita: 'alta', data: '2026-04-01', assegnato: 'Ops Team', stato: 'Aperta' },
  { id: 'EC004', spedizioneId: 'FP240003', tipo: 'Ritardo consegna', descrizione: 'Ritardo stimato di 24h per condizioni meteo', comune: 'Torino', gravita: 'media', data: '2026-04-03', assegnato: 'Corriere', stato: 'Monitoraggio' },
  { id: 'EC005', spedizioneId: 'FP240009', tipo: 'Punto pieno', descrizione: 'PUDO ha raggiunto la capienza massima', comune: 'Venezia', gravita: 'media', data: '2026-04-03', assegnato: 'Ops Team', stato: 'In gestione' },
  { id: 'EC006', spedizioneId: 'FP240006', tipo: 'Documento mancante', descrizione: 'Manca documento di identità destinatario', comune: 'Firenze', gravita: 'bassa', data: '2026-04-03', assegnato: 'Customer Care', stato: 'Aperta' },
]

export const TREND_SETTIMANALE = [
  { giorno: 'Lun', consegnate: 210, eccezioni: 8 },
  { giorno: 'Mar', consegnate: 245, eccezioni: 6 },
  { giorno: 'Mer', consegnate: 198, eccezioni: 11 },
  { giorno: 'Gio', consegnate: 267, eccezioni: 5 },
  { giorno: 'Ven', consegnate: 289, eccezioni: 4 },
  { giorno: 'Sab', consegnate: 156, eccezioni: 3 },
  { giorno: 'Dom', consegnate: 83, eccezioni: 0 },
]

export const ATTIVITA_RECENTI = [
  { ora: '09:47', evento: 'FP240001 depositato', punto: 'Tabaccheria Centrale, Milano', tipo: 'deposito' },
  { ora: '09:31', evento: 'FP240002 ritirato', punto: 'Edicola Prati, Roma', tipo: 'ritiro' },
  { ora: '09:15', evento: 'Eccezione aperta EC001', punto: 'Cartolibreria Napoli Centro', tipo: 'eccezione' },
  { ora: '08:58', evento: 'FP240008 ritirato', punto: 'Bar Centrale Palermo', tipo: 'ritiro' },
  { ora: '08:44', evento: 'PR007 in manutenzione', punto: 'Edicola Porto, Genova', tipo: 'sistema' },
  { ora: '08:30', evento: 'FP240006 depositato', punto: 'Tabaccheria Santa Croce, Firenze', tipo: 'deposito' },
]
