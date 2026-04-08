/**
 * Mock data per analisi copertura PUDO per provincia
 * Metriche utilizzate per identificare carenze/eccessi di PUDO sul territorio
 */

export const PROVINCE_COPERTURA = [
  {
    id: 'RM',
    provincia: 'Roma',
    regione: 'Lazio',
    densitaPopolare: 2200,
    spedizioni: 45000,
    pudoCount: 18,
    pudoCapacita: 8500,
    pudoRitiro: 12,
    pudoLocker: 6,
    growth: 12,
    lat: 41.9028,
    lng: 12.4964,
  },
  {
    id: 'MI',
    provincia: 'Milano',
    regione: 'Lombardia',
    densitaPopolare: 1850,
    spedizioni: 52000,
    pudoCount: 22,
    pudoCapacita: 9200,
    pudoRitiro: 15,
    pudoLocker: 7,
    growth: 8,
    lat: 45.4642,
    lng: 9.1900,
  },
  {
    id: 'NA',
    provincia: 'Napoli',
    regione: 'Campania',
    densitaPopolare: 2500,
    spedizioni: 28000,
    pudoCount: 9,
    pudoCapacita: 5200,
    pudoRitiro: 6,
    pudoLocker: 3,
    growth: 5,
    lat: 40.8518,
    lng: 14.2681,
  },
  {
    id: 'PA',
    provincia: 'Palermo',
    regione: 'Sicilia',
    densitaPopolare: 800,
    spedizioni: 12000,
    pudoCount: 5,
    pudoCapacita: 4100,
    pudoRitiro: 3,
    pudoLocker: 2,
    growth: -2,
    lat: 38.1156,
    lng: 13.3615,
  },
  {
    id: 'TO',
    provincia: 'Torino',
    regione: 'Piemonte',
    densitaPopolare: 950,
    spedizioni: 38000,
    pudoCount: 14,
    pudoCapacita: 7200,
    pudoRitiro: 10,
    pudoLocker: 4,
    growth: 15,
    lat: 45.0703,
    lng: 7.6869,
  },
  {
    id: 'GE',
    provincia: 'Genova',
    regione: 'Liguria',
    densitaPopolare: 750,
    spedizioni: 18000,
    pudoCount: 6,
    pudoCapacita: 3500,
    pudoRitiro: 4,
    pudoLocker: 2,
    growth: 3,
    lat: 44.4056,
    lng: 8.9463,
  },
  {
    id: 'VE',
    provincia: 'Venezia',
    regione: 'Veneto',
    densitaPopolare: 1100,
    spedizioni: 32000,
    pudoCount: 11,
    pudoCapacita: 6200,
    pudoRitiro: 8,
    pudoLocker: 3,
    growth: 7,
    lat: 45.4408,
    lng: 12.3155,
  },
  {
    id: 'BA',
    provincia: 'Bari',
    regione: 'Puglia',
    densitaPopolare: 1600,
    spedizioni: 22000,
    pudoCount: 7,
    pudoCapacita: 4800,
    pudoRitiro: 5,
    pudoLocker: 2,
    growth: 10,
    lat: 41.1239,
    lng: 16.8678,
  },
  {
    id: 'FI',
    provincia: 'Firenze',
    regione: 'Toscana',
    densitaPopolare: 1200,
    spedizioni: 25000,
    pudoCount: 10,
    pudoCapacita: 5500,
    pudoRitiro: 7,
    pudoLocker: 3,
    growth: 6,
    lat: 43.7695,
    lng: 11.2558,
  },
  {
    id: 'BO',
    provincia: 'Bologna',
    regione: 'Emilia-Romagna',
    densitaPopolare: 1350,
    spedizioni: 28000,
    pudoCount: 11,
    pudoCapacita: 6300,
    pudoRitiro: 8,
    pudoLocker: 3,
    growth: 9,
    lat: 44.4941,
    lng: 11.3412,
  },
  {
    id: 'CT',
    provincia: 'Catania',
    regione: 'Sicilia',
    densitaPopolare: 1050,
    spedizioni: 15000,
    pudoCount: 5,
    pudoCapacita: 3800,
    pudoRitiro: 3,
    pudoLocker: 2,
    growth: 4,
    lat: 37.4979,
    lng: 15.0873,
  },
  {
    id: 'BR',
    provincia: 'Brescia',
    regione: 'Lombardia',
    densitaPopolare: 1050,
    spedizioni: 21000,
    pudoCount: 7,
    pudoCapacita: 4500,
    pudoRitiro: 5,
    pudoLocker: 2,
    growth: 11,
    lat: 45.5387,
    lng: 10.2197,
  },
  {
    id: 'PD',
    provincia: 'Padova',
    regione: 'Veneto',
    densitaPopolare: 1200,
    spedizioni: 19000,
    pudoCount: 7,
    pudoCapacita: 4200,
    pudoRitiro: 5,
    pudoLocker: 2,
    growth: 8,
    lat: 45.4084,
    lng: 11.8776,
  },
  {
    id: 'TA',
    provincia: 'Taranto',
    regione: 'Puglia',
    densitaPopolare: 900,
    spedizioni: 9000,
    pudoCount: 3,
    pudoCapacita: 2500,
    pudoRitiro: 2,
    pudoLocker: 1,
    growth: 2,
    lat: 40.4668,
    lng: 17.2135,
  },
  {
    id: 'CA',
    provincia: 'Cagliari',
    regione: 'Sardegna',
    densitaPopolare: 650,
    spedizioni: 8500,
    pudoCount: 3,
    pudoCapacita: 2200,
    pudoRitiro: 2,
    pudoLocker: 1,
    growth: 1,
    lat: 39.2238,
    lng: 9.1216,
  },
];

/**
 * Calcola l'indice di carenza/eccesso
 * Positivo = CARENZA (serve più capacità)
 * Negativo = ECCESSO (troppa capacità)
 */
export function calculateCarenzaIndex(provincia) {
  // Normalizza densità popolazione (scala 0-3000)
  const densitaNorm = Math.min(provincia.densitaPopolare / 1000, 3);

  // Normalizza spedizioni (scala 0-60000)
  const spedNorm = Math.min(provincia.spedizioni / 20000, 3);

  // Capacità offerta (scala 0-10000)
  const capacitaNorm = provincia.pudoCapacita / 1000;

  // Formula: (densità + spedizioni) / capacità
  // Risultato > 1 = carenza, < 1 = eccesso
  const index = (densitaNorm + spedNorm) / Math.max(capacitaNorm, 0.5);

  return Math.round((index - 1) * 100) / 100;
}

/**
 * Calcola utilization rate (%)
 */
export function calculateUtilization(provincia) {
  const utilizz = (provincia.spedizioni / (provincia.pudoCapacita * 20)) * 100;
  return Math.round(utilizz);
}

/**
 * Determina lo stato (CARENZA, OK, ECCESSO)
 */
export function getStatoCobertura(carenzaIndex) {
  if (carenzaIndex > 0.5) return 'CARENZA';
  if (carenzaIndex < -0.3) return 'ECCESSO';
  return 'OK';
}

/**
 * Suggerisce il numero di PUDO da aggiungere/rimuovere
 */
export function suggerisciAzione(provincia) {
  const carenzaIndex = calculateCarenzaIndex(provincia);

  if (carenzaIndex > 1.0) return { tipo: 'AGGIUNGI', quantita: 3, messaggio: 'Aggiungi 3 PUDO' };
  if (carenzaIndex > 0.5) return { tipo: 'AGGIUNGI', quantita: 2, messaggio: 'Aggiungi 2 PUDO' };
  if (carenzaIndex > 0.2) return { tipo: 'AGGIUNGI', quantita: 1, messaggio: 'Aggiungi 1 PUDO' };
  if (carenzaIndex < -0.8) return { tipo: 'DIMETTI', quantita: 2, messaggio: 'Dimetti 2 PUDO' };
  if (carenzaIndex < -0.5) return { tipo: 'DIMETTI', quantita: 1, messaggio: 'Dimetti 1 PUDO' };
  return { tipo: 'MANTIENI', quantita: 0, messaggio: 'Mantieni attuale' };
}

/**
 * Calcola statistiche globali
 */
export function calcolaStatistiche(province) {
  const conCarenza = province.filter(p => getStatoCobertura(calculateCarenzaIndex(p)) === 'CARENZA').length;
  const conEccesso = province.filter(p => getStatoCobertura(calculateCarenzaIndex(p)) === 'ECCESSO').length;
  const spedizioneTotale = province.reduce((sum, p) => sum + p.spedizioni, 0);
  const capacitaTotale = province.reduce((sum, p) => sum + p.pudoCapacita, 0);
  const coberturaNazionale = Math.round((capacitaTotale / spedizioneTotale) * 10000);

  return {
    conCarenza,
    conEccesso,
    conOk: province.length - conCarenza - conEccesso,
    spedizioneTotale,
    capacitaTotale,
    coberturaNazionale: coberturaNazionale / 100, // Capacità gestibile su spedizioni
  };
}
