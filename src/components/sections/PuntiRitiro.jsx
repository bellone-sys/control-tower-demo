import { useState, useMemo, useEffect } from 'react'
import pudosRoma from '../../data/pudosRoma.json'
import { usePudosLoader } from '../../hooks/usePudosLoader'
import PuntiRitiroDetail from './PuntiRitiroDetail'
import AuditPanel from '../ui/AuditPanel'
import MultiSelect from '../ui/MultiSelect'
import SortTh from '../ui/SortTh'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './Sections.css'
import Pagination from '../ui/Pagination'
import './PuntiRitiro.css'

const PAGE_SIZE = 25

const CAPS     = [...new Set(pudosRoma.map(p => p.cap))].sort()
const CAPS_OPT = CAPS.map(c => ({ value: c, label: c }))

const TIPO_OPT = [
  { value: 'negozio', label: '🏪 Negozio' },
  { value: 'locker',  label: '🔒 Locker'  },
]

function getPudoTipo(pudo) {
  const name = (pudo.name || '').toLowerCase()
  if (
    name.includes('locker') ||
    name.includes('solo locker') ||
    name.includes('automatico') ||
    name.includes('mail boxes')
  ) {
    return 'locker'
  }
  return 'negozio'
}

function getPudoVolumeM3(pudo) {
  const n = parseInt(pudo.id.replace(/\D/g, ''), 10) || 0
  return getPudoTipo(pudo) === 'locker'
    ? +(0.20 + (n % 30) / 100).toFixed(2)
    : +(0.80 + (n % 200) / 100).toFixed(2)
}

function getPudoVolumeLibero(pudo) {
  const tot = getPudoVolumeM3(pudo)
  // occupazione simulata deterministica: 30–80% del volume
  const n = parseInt(pudo.id.replace(/\D/g, ''), 10) || 0
  const pct = 0.30 + (n % 51) / 100
  return +(tot * (1 - pct)).toFixed(2)
}

function CopyId({ id }) {
  const [copied, setCopied] = useState(false)
  function copy(e) {
    e.stopPropagation()
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }
  return (
    <button
      className="copy-id-btn"
      onClick={copy}
      title="Copia codice"
    >
      <code className="id-code">{id}</code>
      {copied
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  )
}

function PudoBoundsSync({ points }) {
  const map = useMap()
  useEffect(() => {
    const valid = points.filter(p => p.lat && p.lng)
    if (!valid.length) return
    const bounds = L.latLngBounds(valid.map(p => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
  }, [points.length])
  return null
}

export default function PuntiRitiro() {
  // Loader per CSV Fermopoint
  const { allPudos: fermoPointPudos, loading: loadingFermoPoint, stats } = usePudosLoader()

  // UI State
  const [dataSource, setDataSource] = useState('roma') // 'roma' | 'fermopoint'
  const [search, setSearch]     = useState('')
  const [filterCap, setFilterCap] = useState([])
  const [filterTipo, setFilterTipo] = useState([])
  const [sortKey, setSortKey]   = useState('name')
  const [sortDir, setSortDir]   = useState('asc')
  const [page, setPage]         = useState(1)
  const [selected,   setSelected]   = useState(null)
  const [auditPudo,  setAuditPudo]  = useState(null)
  const [viewMode, setViewMode] = useState('list')

  // Scegli datasource
  const pudosData = dataSource === 'fermopoint' ? (fermoPointPudos || []) : pudosRoma

  const filtered = useMemo(() => {
    let list = pudosData
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p => {
        const name = p.name ? p.name.toLowerCase() : ''
        const id = p.id ? p.id.toLowerCase() : ''
        const cap = p.cap ? p.cap.toString() : (p.postalCode || '')
        return name.includes(q) || id.includes(q) || cap.includes(q)
      })
    }

    // Per Fermopoint CSV: filterCap non è disponibile, filtra solo per tipo
    if (dataSource === 'roma') {
      if (filterCap.length) list = list.filter(p => filterCap.includes(p.cap))
    }
    if (filterTipo.length) list = list.filter(p => filterTipo.includes(getPudoTipo(p)))

    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [search, filterCap, filterTipo, sortKey, sortDir, pudosData, dataSource])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(v) { setSearch(v); setPage(1) }
  function handleCap(v)    { setFilterCap(v);  setPage(1) }
  function handleTipo(v)   { setFilterTipo(v); setPage(1) }
  function handleSort(field) {
    if (sortKey === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(field); setSortDir('asc') }
    setPage(1)
  }

  const listBlock = (
    <div className="section-content">
      <div className="card">
        <div className="card-header">
          <h3>Pudo e Locker</h3>
          <div className="card-actions">
            <span className="card-label">
              {filtered.length} PUDO su {pudosData.length}
              {dataSource === 'fermopoint' && stats && ` (${stats.total.toLocaleString('it-IT')} totali)`}
            </span>
            <div style={{ display: 'flex', border: '1px solid var(--fp-border)', borderRadius: 7, overflow: 'hidden' }}>
              <button onClick={() => setViewMode('list')} title="Elenco"
                style={{ padding: '5px 10px', background: viewMode === 'list' ? 'var(--fp-charcoal)' : 'white', color: viewMode === 'list' ? 'white' : 'var(--fp-gray-mid)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
              <button onClick={() => setViewMode('map')} title="Mappa"
                style={{ padding: '5px 10px', background: viewMode === 'map' ? 'var(--fp-charcoal)' : 'white', color: viewMode === 'map' ? 'white' : 'var(--fp-gray-mid)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--fp-border)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="table-toolbar pr-toolbar">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca per nome, codice o CAP…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => handleSearch('')}>×</button>
            )}
          </div>

          <MultiSelect
            placeholder="Tutti i CAP"
            options={CAPS_OPT}
            value={filterCap}
            onChange={handleCap}
          />

          <MultiSelect
            placeholder="Tutti i tipi"
            options={TIPO_OPT}
            value={filterTipo}
            onChange={handleTipo}
          />
        </div>

        {/* MAP VIEW */}
        {viewMode === 'map' && (
          <div style={{ height: 520, margin: '0 0 8px', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--fp-border)' }}>
            <MapContainer key="pudo-map" center={[41.9028, 12.4964]} zoom={11} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <PudoBoundsSync points={filtered} />
              {filtered.filter(p => p.lat && p.lng).map(p => {
                const tipo = getPudoTipo(p)
                const color = tipo === 'locker' ? '#1565C0' : '#2E7D32'
                return (
                  <CircleMarker
                    key={p.id}
                    center={[p.lat, p.lng]}
                    radius={5}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 1.5 }}
                  >
                    <Popup>
                      <div style={{ minWidth: 160, fontFamily: 'sans-serif' }}>
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>
                          {tipo === 'locker' ? '🔒' : '🏪'} {p.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#555' }}>
                          {p.via ? `${p.via}${p.civico ? ` ${p.civico}` : ''}` : `CAP ${p.cap}${p.civico ? `, n. ${p.civico}` : ''}`}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</div>
                        <button
                          style={{ fontSize: 11, padding: '3px 10px', background: '#DC0032', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                          onClick={() => setSelected(p)}
                        >Dettaglio</button>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        )}

        {/* Table */}
        {viewMode === 'list' && <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <SortTh field="id" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Codice</SortTh>
                <SortTh field="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Nome</SortTh>
                <th>Indirizzo</th>
                <th>Capienza</th>
                <th>Orari</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(p => {
                const oggi = ['dom','lun','mar','mer','gio','ven','sab'][new Date().getDay()]
                const orariOggi = p.hours[oggi]
                return (
                  <tr key={p.id} className="pr-row" onClick={() => setSelected(p)}>
                    <td><CopyId id={p.id} /></td>
                    <td className="pr-name">
                      <span className="pudo-tipo-icon">{getPudoTipo(p) === 'locker' ? '🔒' : '🏪'}</span>
                      {p.name}
                    </td>
                    <td className="td-addr">
                      <div>{p.via ? `${p.via}${p.civico ? `, ${p.civico}` : ''}, ` : ''}{p.cap} — Roma (RM)</div>
                      <div className="coord-inline">
                        <CopyId id={`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`} />
                      </div>
                    </td>
                    <td className="td-small">
                      {getPudoVolumeLibero(p)} m³
                    </td>
                    <td>
                      {orariOggi && orariOggi.length > 0 ? (
                        <span className="orari-oggi">
                          {orariOggi.map(s => `${s.o}–${s.c}`).join(' / ')}
                        </span>
                      ) : orariOggi === null ? (
                        <span className="orari-chiuso">Chiuso oggi</span>
                      ) : (
                        <span className="orari-chiuso">—</span>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn-icon" title="Dettaglio" onClick={e => { e.stopPropagation(); setSelected(p) }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button className="btn-icon" title="Cronologia" style={{ marginLeft: 4 }} onClick={e => { e.stopPropagation(); setAuditPudo(p) }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {pageData.length === 0 && (
            <div className="table-empty">Nessun PUDO trovato.</div>
          )}
        </div>}

        {/* Pagination */}
        {viewMode === 'list' && totalPages > 1 && (
          <Pagination page={page} total={totalPages} onPage={setPage} pageSize={PAGE_SIZE} total_items={filtered.length} />
        )}
      </div>

      {auditPudo && (
        <AuditPanel
          open={true}
          onClose={() => setAuditPudo(null)}
          entityType="pudo"
          entityId={auditPudo.id}
          entityLabel={`${auditPudo.id} · ${auditPudo.name}`}
        />
      )}
    </div>
  )

  return (
    <>
      {listBlock}
      {selected && <PuntiRitiroDetail pudo={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
