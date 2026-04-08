import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Rectangle, Tooltip, FeatureGroup } from 'react-leaflet'
import { DENSITA_AREE, getDensitaColor, getDensitaLabel } from '../../data/densitaPopolare'
import './DensitaPopolare.css'

const PAGE_SIZE = 15

function SortTh({ field, sk, sd, onSort, children, style }) {
  const active = sk === field
  return (
    <th className={`sortable ${active ? 'sort-active' : ''}`} onClick={() => onSort(field)} style={style}>
      {children}
      {active ? <span className="sort-arrow">{sd === 'asc' ? ' ↑' : ' ↓'}</span> : null}
    </th>
  )
}

function Pagination({ page, total, onPage, pageSize, total_items }) {
  if (total <= 1) return null
  const pages = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - 2 && i <= page + 2)) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(1)} disabled={page === 1}>«</button>
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="page-ellipsis">…</span>
          : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === total}>›</button>
      <button className="page-btn" onClick={() => onPage(total)} disabled={page === total}>»</button>
      <span className="page-info">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total_items)} di {total_items}</span>
    </div>
  )
}

export default function DensitaPopolare() {
  const [view, setView] = useState('lista')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('densita')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [selectedArea, setSelectedArea] = useState(null)

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    let list = DENSITA_AREE
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        d =>
          d.area.toLowerCase().includes(q) ||
          d.cap.toLowerCase().includes(q) ||
          d.zona.toLowerCase().includes(q) ||
          d.citta.toLowerCase().includes(q) ||
          d.provincia.toLowerCase().includes(q) ||
          d.regione.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      let av = a[sortKey] ?? '',
        bv = b[sortKey] ?? ''
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'it')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [search, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // KPI calculations
  const densities = filtered.map(a => a.densita)
  const minDensita = densities.length > 0 ? Math.min(...densities) : 0
  const maxDensita = densities.length > 0 ? Math.max(...densities) : 0
  const avgDensita = densities.length > 0 ? Math.round(densities.reduce((a, b) => a + b) / densities.length) : 0
  const totalAbitanti = filtered.reduce((sum, a) => sum + a.abitanti, 0)

  return (
    <div className="section-content">
      <div className="densita-kpi-row">
        <div className="densita-kpi">
          <span className="densita-kpi-val">{minDensita}</span>
          <span className="densita-kpi-label">Densità minima</span>
          <span className="densita-kpi-sub">ab/km²</span>
        </div>
        <div className="densita-kpi">
          <span className="densita-kpi-val">{maxDensita}</span>
          <span className="densita-kpi-label">Densità massima</span>
          <span className="densita-kpi-sub">ab/km²</span>
        </div>
        <div className="densita-kpi">
          <span className="densita-kpi-val">{avgDensita}</span>
          <span className="densita-kpi-label">Densità media</span>
          <span className="densita-kpi-sub">ab/km²</span>
        </div>
        <div className="densita-kpi">
          <span className="densita-kpi-val">{(totalAbitanti / 1000).toFixed(0)}k</span>
          <span className="densita-kpi-label">Popolazione</span>
          <span className="densita-kpi-sub">totale</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Densità di Popolazione</h3>
          <div className="card-actions">
            <span className="card-label">{filtered.length} di {DENSITA_AREE.length}</span>
            <div className="densita-view-toggle">
              <button
                className={`toggle-btn ${view === 'lista' ? 'active' : ''}`}
                onClick={() => {
                  setView('lista')
                  setPage(1)
                }}
              >
                Lista
              </button>
              <button
                className={`toggle-btn ${view === 'mappa' ? 'active' : ''}`}
                onClick={() => setView('mappa')}
              >
                Mappa
              </button>
            </div>
          </div>
        </div>

        {view === 'lista' && (
          <>
            <div className="table-toolbar">
              <div className="search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Cerca area, CAP, zona, città, provincia, regione…"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
                {search && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setSearch('')
                      setPage(1)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <SortTh field="cap" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      CAP
                    </SortTh>
                    <SortTh field="area" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      Area
                    </SortTh>
                    <SortTh field="citta" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      Città
                    </SortTh>
                    <SortTh field="provincia" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      Provincia
                    </SortTh>
                    <SortTh field="regione" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      Regione
                    </SortTh>
                    <SortTh field="zona" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      Zona
                    </SortTh>
                    <SortTh field="abitanti" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      Abitanti
                    </SortTh>
                    <SortTh field="kmq" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      km²
                    </SortTh>
                    <SortTh field="densita" sk={sortKey} sd={sortDir} onSort={handleSort}>
                      Densità
                    </SortTh>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(area => {
                    const color = getDensitaColor(area.densita)
                    const isSelected = selectedArea?.id === area.id
                    return (
                      <tr
                        key={area.id}
                        className={`densita-row ${isSelected ? 'row-selected' : ''}`}
                        style={{ borderLeftColor: color }}
                        onClick={() => setSelectedArea(area)}
                      >
                        <td>
                          <code className="id-code">{area.cap}</code>
                        </td>
                        <td className="densita-area">{area.area}</td>
                        <td className="densita-location">{area.citta}</td>
                        <td className="densita-location">{area.provincia}</td>
                        <td className="densita-location">{area.regione}</td>
                        <td className="densita-zona">{area.zona}</td>
                        <td className="densita-val">{area.abitanti.toLocaleString('it-IT')}</td>
                        <td className="densita-val">{area.kmq}</td>
                        <td>
                          <span
                            className="densita-badge"
                            style={{ backgroundColor: color, color: '#fff' }}
                          >
                            {area.densita}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {pageData.length === 0 && <div className="table-empty">Nessuna area trovata.</div>}
            </div>

            <Pagination page={page} total={totalPages} onPage={setPage} pageSize={PAGE_SIZE} total_items={filtered.length} />
          </>
        )}

        {view === 'mappa' && (
          <div className="densita-map-container">
            <div className="densita-legend">
              <div className="legend-title">Densità ab/km²</div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#8B0000' }}></div>
                <span className="legend-label">≥ 3500 Densitissimo</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#DC143C' }}></div>
                <span className="legend-label">2500–3499 Molto denso</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FF6347' }}></div>
                <span className="legend-label">1500–2499 Denso</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FFA500' }}></div>
                <span className="legend-label">800–1499 Moderato</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FFD700' }}></div>
                <span className="legend-label">&lt; 800 Basso</span>
              </div>
            </div>

            <MapContainer center={[41.9028, 12.4964]} zoom={11} className="densita-map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                maxZoom={13}
              />
              <FeatureGroup>
                {filtered.map(area => {
                  const color = getDensitaColor(area.densita)
                  const isSelected = selectedArea?.id === area.id
                  return (
                    <Rectangle
                      key={area.id}
                      bounds={[
                        [area.bounds.lat1, area.bounds.lng1],
                        [area.bounds.lat2, area.bounds.lng2],
                      ]}
                      pathOptions={{
                        color: isSelected ? '#000' : color,
                        weight: isSelected ? 3 : 1,
                        opacity: 0.7,
                        fill: true,
                        fillColor: color,
                        fillOpacity: isSelected ? 0.6 : 0.4,
                      }}
                      eventHandlers={{
                        click: () => setSelectedArea(area),
                      }}
                    >
                      <Tooltip sticky>
                        <div className="map-tooltip">
                          <div className="tooltip-area">{area.area}</div>
                          <div className="tooltip-densita">{area.densita} ab/km²</div>
                          <div className="tooltip-abitanti">{area.abitanti.toLocaleString('it-IT')} abitanti</div>
                        </div>
                      </Tooltip>
                    </Rectangle>
                  )
                })}
              </FeatureGroup>
            </MapContainer>

            {selectedArea && (
              <div className="densita-detail">
                <div className="detail-header">
                  <h4>{selectedArea.area}</h4>
                  <button className="detail-close" onClick={() => setSelectedArea(null)}>
                    ×
                  </button>
                </div>
                <div className="detail-body">
                  <div className="detail-row">
                    <span className="detail-label">CAP</span>
                    <span className="detail-val">{selectedArea.cap}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Zona</span>
                    <span className="detail-val">{selectedArea.zona}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Abitanti</span>
                    <span className="detail-val">{selectedArea.abitanti.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Superficie</span>
                    <span className="detail-val">{selectedArea.kmq} km²</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Densità</span>
                    <span className="detail-val" style={{ color: getDensitaColor(selectedArea.densita) }}>
                      {selectedArea.densita} ab/km²
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Categoria</span>
                    <span className="detail-val">{getDensitaLabel(selectedArea.densita)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
