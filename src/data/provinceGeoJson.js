/**
 * GeoJSON per province italiane - geometrie approssimate
 * I polygon sono basati su coordinate reali dei confini approssimati
 */

export const PROVINCE_GEOJSON = {
  RM: {
    type: 'Feature',
    properties: { id: 'RM', provincia: 'Roma' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [12.356, 41.756], [12.843, 41.756], [12.843, 42.230], [12.356, 42.230], [12.356, 41.756]
      ]]
    }
  },
  MI: {
    type: 'Feature',
    properties: { id: 'MI', provincia: 'Milano' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [8.916, 45.268], [9.507, 45.268], [9.507, 45.661], [8.916, 45.661], [8.916, 45.268]
      ]]
    }
  },
  NA: {
    type: 'Feature',
    properties: { id: 'NA', provincia: 'Napoli' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [13.970, 40.652], [14.567, 40.652], [14.567, 41.053], [13.970, 41.053], [13.970, 40.652]
      ]]
    }
  },
  PA: {
    type: 'Feature',
    properties: { id: 'PA', provincia: 'Palermo' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [13.097, 37.889], [13.628, 37.889], [13.628, 38.343], [13.097, 38.343], [13.097, 37.889]
      ]]
    }
  },
  TO: {
    type: 'Feature',
    properties: { id: 'TO', provincia: 'Torino' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [7.407, 44.870], [8.256, 44.870], [8.256, 45.271], [7.407, 45.271], [7.407, 44.870]
      ]]
    }
  },
  GE: {
    type: 'Feature',
    properties: { id: 'GE', provincia: 'Genova' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [8.611, 44.141], [9.281, 44.141], [9.281, 44.671], [8.611, 44.671], [8.611, 44.141]
      ]]
    }
  },
  VE: {
    type: 'Feature',
    properties: { id: 'VE', provincia: 'Venezia' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [12.118, 45.234], [12.512, 45.234], [12.512, 45.647], [12.118, 45.647], [12.118, 45.234]
      ]]
    }
  },
  BA: {
    type: 'Feature',
    properties: { id: 'BA', provincia: 'Bari' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [16.479, 41.024], [16.899, 41.024], [16.899, 41.223], [16.479, 41.223], [16.479, 41.024]
      ]]
    }
  },
  FI: {
    type: 'Feature',
    properties: { id: 'FI', provincia: 'Firenze' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [11.088, 43.569], [11.851, 43.569], [11.851, 43.970], [11.088, 43.970], [11.088, 43.569]
      ]]
    }
  },
  BO: {
    type: 'Feature',
    properties: { id: 'BO', provincia: 'Bologna' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [11.207, 44.302], [11.679, 44.302], [11.679, 44.686], [11.207, 44.686], [11.207, 44.302]
      ]]
    }
  },
  CT: {
    type: 'Feature',
    properties: { id: 'CT', provincia: 'Catania' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [14.975, 37.298], [15.582, 37.298], [15.582, 37.697], [14.975, 37.697], [14.975, 37.298]
      ]]
    }
  },
  BR: {
    type: 'Feature',
    properties: { id: 'BR', provincia: 'Brescia' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [10.069, 45.406], [10.474, 45.406], [10.474, 45.669], [10.069, 45.669], [10.069, 45.406]
      ]]
    }
  },
  PD: {
    type: 'Feature',
    properties: { id: 'PD', provincia: 'Padova' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [11.645, 45.232], [12.110, 45.232], [12.110, 45.585], [11.645, 45.585], [11.645, 45.232]
      ]]
    }
  },
  TA: {
    type: 'Feature',
    properties: { id: 'TA', provincia: 'Taranto' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [17.024, 40.367], [17.459, 40.367], [17.459, 40.570], [17.024, 40.570], [17.024, 40.367]
      ]]
    }
  },
  CA: {
    type: 'Feature',
    properties: { id: 'CA', provincia: 'Cagliari' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [8.917, 39.087], [9.326, 39.087], [9.326, 39.385], [8.917, 39.385], [8.917, 39.087]
      ]]
    }
  },
};

/**
 * Funzione helper per ottenere GeoJSON per una provincia
 */
export function getProvinceGeoJson(provinceId) {
  return PROVINCE_GEOJSON[provinceId];
}

/**
 * Funzione helper per ottenere tutti i GeoJSON come FeatureCollection
 */
export function getAllProvinceGeoJson() {
  return {
    type: 'FeatureCollection',
    features: Object.values(PROVINCE_GEOJSON)
  };
}
