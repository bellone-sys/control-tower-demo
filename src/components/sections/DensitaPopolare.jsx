import { useState, useMemo } from "react"
import { DENSITA_AREE, getDensitaColor } from "../../data/densitaPopolare"
import "./DensitaPopolare.css"

export default function DensitaPopolare() {
  const [view, setView] = useState("lista")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState("densita")
  const [sortDir, setSortDir] = useState("desc")
  const [page, setPage] = useState(1)
  const [selectedArea, setSelectedArea] = useState(null)
  const itemsPerPage = 15

  const filtered = useMemo(() => {
    let result = DENSITA_AREE.filter(a =>
      a.area.toLowerCase().includes(search.toLowerCase()) ||
      a.cap.toLowerCase().includes(search.toLowerCase())
    )
    result.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [search, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const densitas = DENSITA_AREE.map(a => a.densita)
  const densitaMin = Math.min(...densitas)
  const densitaMax = Math.max(...densitas)
  const densitaMedia = (DENSITA_AREE.reduce((s, a) => s + a.densita, 0) / DENSITA_AREE.length).toFixed(0)
  const totalPopolo = DENSITA_AREE.reduce((s, a) => s + a.abitanti, 0)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const handleRowClick = (area) => {
    setSelectedArea(selectedArea?.id === area.id ? null : area)
  }

  return (
    <div className="densita-wrap">
      <div className="densita-kpi-row">
        <div className="densita-kpi">
          <div className="densita-kpi-val">{densitaMin}</div>
          <div className="densita-kpi-label">Densita minima</div>
          <div className="densita-kpi-sub">ab/kmq</div>
        </div>
        <div className="densita-kpi">
          <div className="densita-kpi-val">{densitaMax}</div>
          <div className="densita-kpi-label">Densita massima</div>
          <div className="densita-kpi-sub">ab/kmq</div>
        </div>
        <div className="densita-kpi">
          <div className="densita-kpi-val">{densitaMedia}</div>
          <div className="densita-kpi-label">Densita media</div>
          <div className="densita-kpi-sub">ab/kmq</div>
        </div>
        <div className="densita-kpi">
          <div className="densita-kpi-val">{(totalPopolo / 1000).toFixed(0)}k</div>
          <div className="densita-kpi-label">Popolazione totale</div>
          <div className="densita-kpi-sub">abitanti</div>
        </div>
      </div>

      <div className="densita-toolbar">
        <div style={{flex: 1}}>
          <input type="text" placeholder="Cerca area o CAP..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="densita-search" />
        </div>
        <div className="densita-view-toggle">
          <button className={`toggle-btn ${view === 'lista' ? 'active' : ''}`} onClick={() => setView('lista')}>Lista</button>
          <button className={`toggle-btn ${view === 'mappa' ? 'active' : ''}`} onClick={() => setView('mappa')}>Mappa</button>
        </div>
      </div>

      {view === 'lista' && (
        <div className="densita-list-view">
          <table className="densita-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('cap')} style={{cursor: 'pointer'}}>CAP</th>
                <th onClick={() => handleSort('area')} style={{cursor: 'pointer'}}>Area</th>
                <th onClick={() => handleSort('zona')} style={{cursor: 'pointer'}}>Zona</th>
                <th onClick={() => handleSort('abitanti')} style={{cursor: 'pointer'}}>Abitanti</th>
                <th onClick={() => handleSort('kmq')} style={{cursor: 'pointer'}}>kmq</th>
                <th onClick={() => handleSort('densita')} style={{cursor: 'pointer'}}>Densita</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((area) => (
                <tr key={area.id} className={`densita-row ${selectedArea?.id === area.id ? 'row-selected' : ''}`} onClick={() => handleRowClick(area)} style={{borderLeftColor: getDensitaColor(area.densita)}}>
                  <td className="densita-cap">{area.cap}</td>
                  <td className="densita-area">{area.area}</td>
                  <td className="densita-zona">{area.zona}</td>
                  <td className="densita-val">{area.abitanti.toLocaleString()}</td>
                  <td className="densita-val">{area.kmq.toFixed(1)}</td>
                  <td className="densita-val"><span className="densita-badge" style={{backgroundColor: getDensitaColor(area.densita), color: 'white'}}>{area.densita}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="densita-pagination">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Precedente</button>
            <span>Pagina {page} di {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Prossima</button>
          </div>
        </div>
      )}

      {view === 'mappa' && (
        <div className="densita-map-container">
          <div className="densita-map"><div style={{padding: 20, color: '#666'}}>Mappa interattiva</div></div>
          <div className="densita-legend">
            <div className="legend-title">Densita abitativa</div>
            <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#8B0000'}}></div><div className="legend-label">Densitissimo (3500+)</div></div>
            <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#DC143C'}}></div><div className="legend-label">Molto denso (2500-3500)</div></div>
            <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#FF6347'}}></div><div className="legend-label">Denso (1500-2500)</div></div>
            <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#FFA500'}}></div><div className="legend-label">Moderato (800-1500)</div></div>
            <div className="legend-item"><div className="legend-color" style={{backgroundColor: '#FFD700'}}></div><div className="legend-label">Basso (sotto 800)</div></div>
          </div>
          {selectedArea && (
            <div className="densita-detail">
              <div className="detail-header"><h4>{selectedArea.area}</h4><button className="detail-close" onClick={() => setSelectedArea(null)}>X</button></div>
              <div className="detail-body">
                <div className="detail-row"><span className="detail-label">CAP</span><span className="detail-val">{selectedArea.cap}</span></div>
                <div className="detail-row"><span className="detail-label">Zona</span><span className="detail-val">{selectedArea.zona}</span></div>
                <div className="detail-row"><span className="detail-label">Abitanti</span><span className="detail-val">{selectedArea.abitanti.toLocaleString()}</span></div>
                <div className="detail-row"><span className="detail-label">Superficie</span><span className="detail-val">{selectedArea.kmq.toFixed(1)} kmq</span></div>
                <div className="detail-row"><span className="detail-label">Densita</span><span className="detail-val" style={{color: getDensitaColor(selectedArea.densita)}}>{selectedArea.densita} ab/kmq</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
