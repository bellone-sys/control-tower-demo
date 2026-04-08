/**
 * Dati di monitoraggio servizio Milkrun
 * Economics, Quality, Performance
 */

// ─────────────────────────────────────────────────────────────
// ECONOMICS - Analisi costi
// ─────────────────────────────────────────────────────────────

export const ECONOMICS_DATA = {
  giriAttuali: 26,
  costTotaleGironi: 18250,
  costTotalePacchi: 2340,
  costTotaleScenari: 4560,

  costPerPacco: {
    medio: 0.89,
    minimo: 0.45,
    massimo: 1.25,
    trend: [0.92, 0.90, 0.89, 0.88, 0.87, 0.86], // Ultimi 6 mesi
  },

  costPerGiro: {
    medio: 701.92,
    minimo: 420,
    massimo: 980,
    perScenario: {
      'Roma Laurentina': { cost: 756, pacchi: 45, costo_pacco: 0.88 },
      'Napoli Centro': { cost: 520, pacchi: 38, costo_pacco: 0.82 },
      'Milano Bovisa': { cost: 890, pacchi: 52, costo_pacco: 0.92 },
      'Stezzano': { cost: 620, pacchi: 42, costo_pacco: 0.85 },
      'Milano Bovisa (copia)': { cost: 870, pacchi: 50, costo_pacco: 0.90 },
    }
  },

  costPerScenario: {
    totale: 4560,
    percorso: 0.65, // €/km
    manodopera: 0.22, // €/ora
    risorse: 0.13, // €/risorsa
    trend: [4800, 4720, 4680, 4620, 4560], // Ultimi 5 periodi
  },

  breakdownCosti: {
    carburante: 0.32,
    manodopera: 0.35,
    veicoli: 0.18,
    infrastrutture: 0.10,
    amministrazione: 0.05,
  }
};

// ─────────────────────────────────────────────────────────────
// QUALITY - Analisi qualità e puntualità
// ─────────────────────────────────────────────────────────────

export const QUALITY_DATA = {
  puntualita: {
    partenzaFiliale: {
      inOrario: 0.92,
      ritardo: 0.06,
      anticipo: 0.02,
      ritardoMedio: 3.2, // minuti
    },
    arrivoFiliale: {
      inOrario: 0.88,
      ritardo: 0.10,
      anticipo: 0.02,
      ritardoMedio: 8.5, // minuti
    },
    arrivoPudo: {
      inOrario: 0.85,
      ritardo: 0.12,
      anticipo: 0.03,
      ritardoMedio: 6.8, // minuti
    },
  },

  pudoMetriche: {
    totaleVisitati: 1240,
    completatiSuccesso: 1158, // 93.4%
    rigettatiTempo: 45, // 3.6%
    rigettatiAltro: 37, // 3.0%

    pudoPerGiro: {
      medio: 47.7,
      minimo: 28,
      massimo: 62,
    },
  },

  pacchiMetriche: {
    totaleConsegnati: 2340,
    lasciatInFiliale: 23, // 0.98%
    noConsegna: 12, // 0.51%
    danneggiati: 5, // 0.21%

    tempoServizioMedio: {
      perPudo: 2.8, // minuti
      min: 1.2,
      max: 8.5,
    },
  },

  scoreSoddisfazione: 4.7, // 0-5
  reclami: 8,
  recdamiPerMille: 3.4,
};

// ─────────────────────────────────────────────────────────────
// PERFORMANCE - Trend e andamenti temporali
// ─────────────────────────────────────────────────────────────

export const PERFORMANCE_DATA = {
  periodiStorici: [
    { periodo: 'Gen 2026', giri: 24, pacchi: 2100, costo: 1850, puntualita: 0.83, pudoSuccess: 0.91 },
    { periodo: 'Feb 2026', giri: 25, pacchi: 2210, costo: 1920, puntualita: 0.85, pudoSuccess: 0.92 },
    { periodo: 'Mar 2026', giri: 26, pacchi: 2340, costo: 1870, puntualita: 0.88, pudoSuccess: 0.93 },
    { periodo: 'Apr 2026', giri: 26, pacchi: 2380, costo: 1825, puntualita: 0.88, pudoSuccess: 0.934 },
  ],

  andamentiSettimanali: [
    { settimana: 'Sett 1', giri: 6, pacchi: 580, costo: 420, puntualita: 0.86, pudoSuccess: 0.925 },
    { settimana: 'Sett 2', giri: 7, pacchi: 610, costo: 450, puntualita: 0.89, pudoSuccess: 0.935 },
    { settimana: 'Sett 3', giri: 6, pacchi: 590, costo: 435, puntualita: 0.88, pudoSuccess: 0.930 },
    { settimana: 'Sett 4', giri: 7, pacchi: 600, costo: 520, puntualita: 0.88, pudoSuccess: 0.936 },
  ],

  // Metriche per singolo giro/scenario
  dettagliGiri: [
    {
      id: 1,
      scenario: 'Roma Laurentina',
      data: '08/04/2026',
      giri: 8,
      pacchi: 45,
      costo: 756,
      costPacco: 0.88,
      puntualitaInizio: 0.93,
      puntualitaFine: 0.89,
      pudoVisitati: 48,
      pudoSuccess: 45,
      pudoRigettati: 3,
      pacchiLasciati: 2,
      tempoMedio: 2.9,
    },
    {
      id: 2,
      scenario: 'Napoli Centro',
      data: '08/04/2026',
      giri: 4,
      pacchi: 38,
      costo: 520,
      costPacco: 0.82,
      puntualitaInizio: 0.95,
      puntualitaFine: 0.92,
      pudoVisitati: 42,
      pudoSuccess: 40,
      pudoRigettati: 2,
      pacchiLasciati: 0,
      tempoMedio: 2.5,
    },
    {
      id: 3,
      scenario: 'Milano Bovisa',
      data: '08/04/2026',
      giri: 5,
      pacchi: 52,
      costo: 890,
      costPacco: 0.92,
      puntualitaInizio: 0.90,
      puntualitaFine: 0.85,
      pudoVisitati: 56,
      pudoSuccess: 52,
      pudoRigettati: 4,
      pacchiLasciati: 8,
      tempoMedio: 3.2,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────

export function getEconomicsTrend(metrica) {
  if (metrica === 'costPerPacco') {
    return ECONOMICS_DATA.costPerPacco.trend;
  }
  if (metrica === 'costPerScenario') {
    return ECONOMICS_DATA.costPerScenario.trend;
  }
  return [];
}

export function getQualityScore() {
  const { puntualita, pudoMetriche } = QUALITY_DATA;
  const avgPuntualita = (
    puntualita.partenzaFiliale.inOrario +
    puntualita.arrivoFiliale.inOrario +
    puntualita.arrivoPudo.inOrario
  ) / 3;

  const pudoSuccessRate = pudoMetriche.completatiSuccesso / pudoMetriche.totaleVisitati;

  return {
    puntualitaMedia: avgPuntualita,
    pudoSuccessRate: pudoSuccessRate,
    score: (avgPuntualita * 0.4 + pudoSuccessRate * 0.6) * 5, // 0-5
  };
}

export function getPerformanceTrend(metrica) {
  return PERFORMANCE_DATA.periodiStorici.map(p => ({
    periodo: p.periodo,
    value: p[metrica]
  }));
}
