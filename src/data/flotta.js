// ===== FLOTTA STUB DATA =====

export const MODELLI_MEZZI = [
  // Compact
  { catalogoId: 'CAT001', marca: 'Fiat',          modello: 'Fiorino Cargo 1.3 MJet',          tipo: 'compact', carburante: 'Diesel',    consumo: 5.8,  unitaConsumo: 'l/100km', volumeM3: 2.5,  caricoKg: 470,  autonomiaKm: 1100, anno: 2022 },
  { catalogoId: 'CAT002', marca: 'Citroën',        modello: 'Berlingo Van 1.5 BlueHDi 100',    tipo: 'compact', carburante: 'Diesel',    consumo: 5.5,  unitaConsumo: 'l/100km', volumeM3: 3.9,  caricoKg: 800,  autonomiaKm: 1050, anno: 2023 },
  { catalogoId: 'CAT003', marca: 'Volkswagen',     modello: 'Caddy Cargo 2.0 TDI 122',         tipo: 'compact', carburante: 'Diesel',    consumo: 6.2,  unitaConsumo: 'l/100km', volumeM3: 3.7,  caricoKg: 660,  autonomiaKm: 920,  anno: 2023 },
  { catalogoId: 'CAT004', marca: 'Renault',        modello: 'Kangoo E-Tech Van EV45',          tipo: 'compact', carburante: 'Elettrico', consumo: 22.0, unitaConsumo: 'kWh/100km', volumeM3: 3.9, caricoKg: 640, autonomiaKm: 285,  anno: 2024 },
  // Medi
  { catalogoId: 'CAT005', marca: 'Ford',           modello: 'Transit Custom 2.0 EcoBlue 130',  tipo: 'medio',   carburante: 'Diesel',    consumo: 7.9,  unitaConsumo: 'l/100km', volumeM3: 6.0,  caricoKg: 1100, autonomiaKm: 760,  anno: 2023 },
  { catalogoId: 'CAT006', marca: 'Mercedes-Benz',  modello: 'Vito 114 CDI Cargo Long',         tipo: 'medio',   carburante: 'Diesel',    consumo: 7.2,  unitaConsumo: 'l/100km', volumeM3: 5.5,  caricoKg: 900,  autonomiaKm: 830,  anno: 2022 },
  { catalogoId: 'CAT007', marca: 'Volkswagen',     modello: 'Transporter T6.1 2.0 TDI 150',   tipo: 'medio',   carburante: 'Diesel',    consumo: 7.5,  unitaConsumo: 'l/100km', volumeM3: 5.8,  caricoKg: 1000, autonomiaKm: 800,  anno: 2023 },
  { catalogoId: 'CAT008', marca: 'Peugeot',        modello: 'e-Expert Standard 50kWh',         tipo: 'medio',   carburante: 'Elettrico', consumo: 25.0, unitaConsumo: 'kWh/100km', volumeM3: 5.3, caricoKg: 900, autonomiaKm: 330,  anno: 2024 },
  // Grandi
  { catalogoId: 'CAT009', marca: 'Mercedes-Benz',  modello: 'Sprinter 314 CDI L2H2',           tipo: 'grande',  carburante: 'Diesel',    consumo: 9.8,  unitaConsumo: 'l/100km', volumeM3: 10.5, caricoKg: 1500, autonomiaKm: 820,  anno: 2022 },
  { catalogoId: 'CAT010', marca: 'Ford',           modello: 'Transit 2.0 EcoBlue 170 L3H2',   tipo: 'grande',  carburante: 'Diesel',    consumo: 9.5,  unitaConsumo: 'l/100km', volumeM3: 11.6, caricoKg: 1600, autonomiaKm: 750,  anno: 2023 },
  { catalogoId: 'CAT011', marca: 'Renault',        modello: 'Master dCi 150 L3H2',             tipo: 'grande',  carburante: 'Diesel',    consumo: 8.8,  unitaConsumo: 'l/100km', volumeM3: 10.8, caricoKg: 1495, autonomiaKm: 860,  anno: 2023 },
  { catalogoId: 'CAT012', marca: 'Fiat',           modello: 'eDucato 47kWh L3H2',              tipo: 'grande',  carburante: 'Elettrico', consumo: 28.0, unitaConsumo: 'kWh/100km', volumeM3: 10.0, caricoKg: 900, autonomiaKm: 295, anno: 2024 },
  { catalogoId: 'CAT013', marca: 'Iveco',          modello: 'Daily 35S14 Hi-Matic L3H2',       tipo: 'grande',  carburante: 'Diesel',    consumo: 10.2, unitaConsumo: 'l/100km', volumeM3: 12.0, caricoKg: 2000, autonomiaKm: 980,  anno: 2022 },
  { catalogoId: 'CAT014', marca: 'Volkswagen',     modello: 'Crafter 35 2.0 TDI 177 L4H3',    tipo: 'grande',  carburante: 'Diesel',    consumo: 9.1,  unitaConsumo: 'l/100km', volumeM3: 14.4, caricoKg: 1700, autonomiaKm: 900,  anno: 2023 },
]

export const MEZZI = [
  { id: 'M001', catalogoId: 'CAT009', targa: 'FB 452 KL', stato: 'In servizio',   km: 87420,  autoreId: 'D003' },
  { id: 'M002', catalogoId: 'CAT001', targa: 'EK 218 MR', stato: 'Disponibile',   km: 34100,  autoreId: null   },
  { id: 'M003', catalogoId: 'CAT005', targa: 'GH 731 PA', stato: 'In servizio',   km: 61850,  autoreId: 'D001' },
  { id: 'M004', catalogoId: 'CAT002', targa: 'DC 904 YT', stato: 'Manutenzione',  km: 112300, autoreId: null   },
  { id: 'M005', catalogoId: 'CAT010', targa: 'AT 067 BN', stato: 'In servizio',   km: 43600,  autoreId: 'D005' },
  { id: 'M006', catalogoId: 'CAT004', targa: 'RP 389 CV', stato: 'Disponibile',   km: 12400,  autoreId: null   },
  { id: 'M007', catalogoId: 'CAT007', targa: 'LM 555 ZQ', stato: 'In servizio',   km: 78900,  autoreId: 'D002' },
  { id: 'M008', catalogoId: 'CAT012', targa: 'VN 120 EX', stato: 'Disponibile',   km: 8700,   autoreId: null   },
  { id: 'M009', catalogoId: 'CAT013', targa: 'SB 641 GT', stato: 'Manutenzione',  km: 156000, autoreId: null   },
  { id: 'M010', catalogoId: 'CAT003', targa: 'QF 772 HU', stato: 'In servizio',   km: 29300,  autoreId: 'D004' },
  { id: 'M011', catalogoId: 'CAT006', targa: 'JK 438 WS', stato: 'Disponibile',   km: 51200,  autoreId: null   },
  { id: 'M012', catalogoId: 'CAT008', targa: 'TZ 290 LC', stato: 'In servizio',   km: 19800,  autoreId: 'D006' },
]

export const DRIVERS = [
  { id: 'D001', nome: 'Marco',    cognome: 'Ferretti',   patente: 'B+C',  telefono: '+39 347 112 3344', email: 'ferretti.m@dpd.it',   dataNascita: '1985-03-12', stato: 'In servizio',  mezzoId: 'M003', km_anno: 42300 },
  { id: 'D002', nome: 'Giulia',   cognome: 'Marchetti',  patente: 'B',    telefono: '+39 349 876 5432', email: 'marchetti.g@dpd.it',  dataNascita: '1991-07-24', stato: 'In servizio',  mezzoId: 'M007', km_anno: 38100 },
  { id: 'D003', nome: 'Antonio',  cognome: 'De Luca',    patente: 'B+C',  telefono: '+39 333 245 6789', email: 'deluca.a@dpd.it',     dataNascita: '1978-11-05', stato: 'In servizio',  mezzoId: 'M001', km_anno: 55700 },
  { id: 'D004', nome: 'Sara',     cognome: 'Rizzo',      patente: 'B',    telefono: '+39 320 987 1234', email: 'rizzo.s@dpd.it',      dataNascita: '1994-02-18', stato: 'In servizio',  mezzoId: 'M010', km_anno: 29800 },
  { id: 'D005', nome: 'Luca',     cognome: 'Conforti',   patente: 'B+C',  telefono: '+39 346 543 8900', email: 'conforti.l@dpd.it',   dataNascita: '1982-09-30', stato: 'In servizio',  mezzoId: 'M005', km_anno: 48200 },
  { id: 'D006', nome: 'Elena',    cognome: 'Caruso',     patente: 'B',    telefono: '+39 351 678 2211', email: 'caruso.e@dpd.it',     dataNascita: '1997-05-14', stato: 'In servizio',  mezzoId: 'M012', km_anno: 21400 },
  { id: 'D007', nome: 'Roberto',  cognome: 'Gentile',    patente: 'B+C',  telefono: '+39 338 901 4455', email: 'gentile.r@dpd.it',    dataNascita: '1975-12-22', stato: 'Disponibile',  mezzoId: null,   km_anno: 61000 },
  { id: 'D008', nome: 'Chiara',   cognome: 'Monti',      patente: 'B',    telefono: '+39 328 112 9900', email: 'monti.c@dpd.it',      dataNascita: '1989-08-07', stato: 'Disponibile',  mezzoId: null,   km_anno: 33500 },
  { id: 'D009', nome: 'Francesco','cognome':'Palmieri',  patente: 'B+C',  telefono: '+39 342 654 3322', email: 'palmieri.f@dpd.it',   dataNascita: '1987-04-03', stato: 'Ferie',        mezzoId: null,   km_anno: 44800 },
  { id: 'D010', nome: 'Valentina','cognome':'Greco',     patente: 'B',    telefono: '+39 335 789 6677', email: 'greco.v@dpd.it',      dataNascita: '1993-10-19', stato: 'Malattia',     mezzoId: null,   km_anno: 18700 },
]
