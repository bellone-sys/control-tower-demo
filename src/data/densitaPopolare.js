/**
 * Population Density Data for Rome
 * 15 zones with varying population densities (inhabitants/km²)
 */

export const DENSITA_AREE = [
  // Centro Storico - Highest density
  {
    id: 'R_00100',
    cap: '00100-00186',
    area: 'Centro Storico',
    densita: 4200,
    abitanti: 84000,
    kmq: 20,
    zona: 'Centro',
    bounds: { lat1: 41.8949, lng1: 12.4839, lat2: 41.9076, lng2: 12.5000 }
  },
  // Monti / Repubblica
  {
    id: 'R_00184',
    cap: '00184',
    area: 'Rioni Monti - Repubblica',
    densita: 3800,
    abitanti: 62000,
    kmq: 16.3,
    zona: 'Centro',
    bounds: { lat1: 41.8979, lng1: 12.4879, lat2: 41.9122, lng2: 12.5089 }
  },
  // Trevi / Pantheon
  {
    id: 'R_00186',
    cap: '00186',
    area: 'Trevi - Pantheon',
    densita: 3600,
    abitanti: 54000,
    kmq: 15,
    zona: 'Centro',
    bounds: { lat1: 41.8949, lng1: 12.4689, lat2: 41.9062, lng2: 12.4879 }
  },
  // Trastevere
  {
    id: 'R_00153',
    cap: '00153',
    area: 'Trastevere',
    densita: 3200,
    abitanti: 48000,
    kmq: 15,
    zona: 'Centro',
    bounds: { lat1: 41.8789, lng1: 12.4639, lat2: 41.8929, lng2: 12.4839 }
  },
  // Prati
  {
    id: 'R_00193',
    cap: '00193',
    area: 'Prati - Vaticano',
    densita: 2800,
    abitanti: 42000,
    kmq: 15,
    zona: 'Centro-Nord',
    bounds: { lat1: 41.9076, lng1: 12.4489, lat2: 41.9239, lng2: 12.4689 }
  },
  // Testaccio
  {
    id: 'R_00153',
    cap: '00153-00146',
    area: 'Testaccio - Ostiense',
    densita: 2600,
    abitanti: 39000,
    kmq: 15,
    zona: 'Centro-Sud',
    bounds: { lat1: 41.8639, lng1: 12.4739, lat2: 41.8789, lng2: 12.4939 }
  },
  // Nord - Flaminio
  {
    id: 'R_00196',
    cap: '00196',
    area: 'Flaminio - Ponte Milvio',
    densita: 1900,
    abitanti: 28500,
    kmq: 15,
    zona: 'Nord',
    bounds: { lat1: 41.9239, lng1: 12.4539, lat2: 41.9439, lng2: 12.4839 }
  },
  // Nord - Salario
  {
    id: 'R_00198',
    cap: '00198',
    area: 'Salario - Nomentano',
    densita: 2100,
    abitanti: 31500,
    kmq: 15,
    zona: 'Nord',
    bounds: { lat1: 41.9122, lng1: 12.5089, lat2: 41.9322, lng2: 12.5389 }
  },
  // Nord-Est - Monti
  {
    id: 'R_00189',
    cap: '00189',
    area: 'San Lorenzo - Verano',
    densita: 2400,
    abitanti: 36000,
    kmq: 15,
    zona: 'Nord-Est',
    bounds: { lat1: 41.9122, lng1: 12.5089, lat2: 41.9322, lng2: 12.5389 }
  },
  // Est - Tuscolano
  {
    id: 'R_00182',
    cap: '00182-00181',
    area: 'Esquilino - Tuscolano',
    densita: 2200,
    abitanti: 33000,
    kmq: 15,
    zona: 'Est',
    bounds: { lat1: 41.8979, lng1: 12.5089, lat2: 41.9162, lng2: 12.5389 }
  },
  // Sud - Appio Latino
  {
    id: 'R_00179',
    cap: '00179-00178',
    area: 'Appio Latino - Cinecittà',
    densita: 1500,
    abitanti: 22500,
    kmq: 15,
    zona: 'Sud',
    bounds: { lat1: 41.8579, lng1: 12.5089, lat2: 41.8779, lng2: 12.5389 }
  },
  // Sud-Ovest - Gianicolense
  {
    id: 'R_00152',
    cap: '00152-00151',
    area: 'Gianicolense - Aurelio',
    densita: 1600,
    abitanti: 24000,
    kmq: 15,
    zona: 'Sud-Ovest',
    bounds: { lat1: 41.8639, lng1: 12.4339, lat2: 41.8839, lng2: 12.4639 }
  },
  // Ovest - Primavalle
  {
    id: 'R_00189',
    cap: '00189-00188',
    area: 'Primavalle',
    densita: 1200,
    abitanti: 18000,
    kmq: 15,
    zona: 'Ovest',
    bounds: { lat1: 41.9239, lng1: 12.4189, lat2: 41.9439, lng2: 12.4489 }
  },
  // Nord-Ovest - Monte Mario
  {
    id: 'R_00195',
    cap: '00195',
    area: 'Monte Mario',
    densita: 800,
    abitanti: 12000,
    kmq: 15,
    zona: 'Nord-Ovest',
    bounds: { lat1: 41.9439, lng1: 12.4189, lat2: 41.9639, lng2: 12.4589 }
  },
  // Periferia Est - Ponte Lungo
  {
    id: 'R_00175',
    cap: '00175',
    area: 'Ponte Lungo',
    densita: 950,
    abitanti: 14250,
    kmq: 15,
    zona: 'Periferia',
    bounds: { lat1: 41.8379, lng1: 12.5289, lat2: 41.8579, lng2: 12.5589 }
  }
]

/**
 * Get color for population density
 * @param {number} densita - Population density in inhabitants/km²
 * @returns {string} Hex color code
 */
export function getDensitaColor(densita) {
  if (densita >= 3500) return '#8B0000'    // Rosso scuro (densitissimo)
  if (densita >= 2500) return '#DC143C'    // Rosso (molto denso)
  if (densita >= 1500) return '#FF6347'    // Arancio-rosso (denso)
  if (densita >= 800)  return '#FFA500'    // Arancio (moderato)
  return '#FFD700'                          // Giallo (basso)
}
