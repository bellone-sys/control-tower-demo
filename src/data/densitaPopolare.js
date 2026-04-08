export const DENSITA_AREE = [
  { id: "R_00100", cap: "00100-00186", area: "Centro Storico", densita: 4200, abitanti: 84000, kmq: 20, zona: "Centro" },
  { id: "R_00118", cap: "00118-00142", area: "Testaccio / Ostiense", densita: 3850, abitanti: 52000, kmq: 13.5, zona: "Sud-Centro" },
  { id: "R_00185", cap: "00185-00198", area: "Esquilino / Monti", densita: 3650, abitanti: 48000, kmq: 13.1, zona: "Est-Centro" },
  { id: "R_00187", cap: "00187", area: "Trevi / Quirinale", densita: 3200, abitanti: 35000, kmq: 10.9, zona: "Centro" },
  { id: "R_00193", cap: "00193-00196", area: "Prati / Vaticano", densita: 2950, abitanti: 42000, kmq: 14.2, zona: "Nord-Centro" },
  { id: "R_00153", cap: "00153-00154", area: "Trastevere", densita: 2850, abitanti: 38000, kmq: 13.3, zona: "Sud-Centro" },
  { id: "R_00128", cap: "00128", area: "EUR / Laurentina", densita: 2100, abitanti: 55000, kmq: 26.2, zona: "Sud" },
  { id: "R_00161", cap: "00161", area: "Nomentano", densita: 1950, abitanti: 48000, kmq: 24.6, zona: "Nord-Est" },
  { id: "R_00139", cap: "00139-00141", area: "Prenestino / Centocelle", densita: 1850, abitanti: 52000, kmq: 28.1, zona: "Est" },
  { id: "R_00173", cap: "00173-00176", area: "Tuscolano", densita: 1650, abitanti: 45000, kmq: 27.3, zona: "Sud-Est" },
  { id: "R_00131", cap: "00131-00133", area: "Appio Latino", densita: 1500, abitanti: 42000, kmq: 28.0, zona: "Sud" },
  { id: "R_00157", cap: "00157-00159", area: "Garbatella / San Paolo", densita: 1450, abitanti: 40000, kmq: 27.6, zona: "Sud" },
  { id: "R_00177", cap: "00177-00179", area: "Guidonia / Settecamini", densita: 980, abitanti: 35000, kmq: 35.7, zona: "Est-Periferia" },
  { id: "R_00188", cap: "00188-00189", area: "Primasole / Settebagni", densita: 850, abitanti: 28000, kmq: 32.9, zona: "Nord-Periferia" },
  { id: "R_00169", cap: "00169-00172", area: "Capanelle / Numidico", densita: 720, abitanti: 22000, kmq: 30.6, zona: "Sud-Periferia" }
]

export function getDensitaColor(densita) {
  if (densita >= 3500) return "#8B0000"
  if (densita >= 2500) return "#DC143C"
  if (densita >= 1500) return "#FF6347"
  if (densita >= 800) return "#FFA500"
  return "#FFD700"
}
