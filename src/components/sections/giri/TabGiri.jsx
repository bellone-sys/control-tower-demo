import { useState, useMemo } from 'react'
import { FILIALI } from '../../../data/filiali'
import { DRIVERS } from '../../../data/flotta'
import { STATI_GIRO } from '../../../data/giri'
import MultiSelect from '../../ui/MultiSelect'
import DetailGiro from './DetailGiro'
import '../Sections.css'

const PAGE_SIZE = 15

const FILIALI_OPT = FILIALI.map(f => ({ value: f.id, label: f.nome }))
const DRIVERS_OPT = DRIVERS.map(d => ({ value: d.id, label: `${d.cognome} ${d.nome}` }))
const STATI_OPT   = STATI_GIRO.map(s => ({ value: s, label: s }))

function formatData(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatDurata(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  return `${h}h ${String(m).padStart(2, '0')}min`
}

function getStatoClass(stato) {
  const map = {
    'Pianificato': 'stato-pianificato',
    'In corso':    'stato-in-corso',
    'Completato':  'stato-completato',
    'Annullato':   'stato-annullato',
  }
  return map[stato] || ''
}

function isWithinDays(dateStr, days) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff < days
}

function isSameDay(dateStr, refStr) {
  return dateStr === refStr
}

function PaginationPages({ current, total, onPage }) {
  const pages = []
  const delta = 2
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }
  return (
    <>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`page-btn${p === current ? ' active' : ''}`}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        )
      )}
    </>
  )
}

export default function TabGiri({ giri, setGiri, templates, setTemplates }) {
  const [search,        setSearch]        = useState('')
  const [filterFiliale, setFilterFiliale] = useState([])
  const [filterAutore,  setFilterAutore]  = useState([])
  const [filterStato,   setFilterStato]   = useState([])
  const [page,          setPage]          = useState(1)
  const [selectedId,    setSelectedId]    = useState(null)
  const [savedMsg,      setSavedMsg]      = useState('')

  // Set degli id giro già salvati come template (via sourceGiroId)
  const savedGiroIds = useMemo(
    () => new Set(templates.map(t => t.sourceGiroId).filter(Boolean)),
    [templates]
  )

  const oggi = new Date().toISOString().slice(0, 10) // '2026-04-03'

  // KPI
  const giriOggi      = useMemo(() => giri.filter(g => isSameDay(g.data, oggi)), [giri, oggi])
  const giriSettimana = useMemo(() => giri.filter(g => isWithinDays(g.data, 7)), [giri])
  const tappePianif   = useMemo(() => giri
    .filter(g => g.stato !== 'Completato' && g.stato !== 'Annullato')
    .reduce((sum, g) => sum + g.tappe.length, 0), [giri])
  const kmOggi        = useMemo(() => giriOggi.reduce((sum, g) => sum + g.distanzaKm, 0).toFixed(1), [giriOggi])

  // Filtro
  const filtered = useMemo(() => {
    let list = giri
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(g =>
        g.nome.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q)
      )
    }
    if (filterFiliale.length) list = list.filter(g => filterFiliale.includes(g.filialeId))
    if (filterAutore.length)  list = list.filter(g => filterAutore.includes(g.autoreId))
    if (filterStato.length)   list = list.filter(g => filterStato.includes(g.stato))

    // Ordinamento: prima per data desc, poi per id
    return [...list].sort((a, b) => {
      if (b.data !== a.data) return b.data.localeCompare(a.data)
      return a.id.localeCompare(b.id)
    })
  }, [giri, search, filterFiliale, filterAutore, filterStato])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(v) { setSearch(v); setPage(1) }

  function handleToggleTemplate(giro) {
    const exists = templates.find(t => t.sourceGiroId === giro.id)
    if (exists) {
      // già salvato → rimuovi
      setTemplates(prev => prev.filter(t => t.sourceGiroId !== giro.id))
    } else {
      // non salvato → crea template
      const tpl = {
        id: 'TPL' + Date.now(),
        nome: 'Template ' + giro.nome,
        filialeId: giro.filialeId,
        autoreId: giro.autoreId,
        mezzoId: giro.mezzoId,
        depotLat: giro.depotLat,
        depotLng: giro.depotLng,
        note: '',
        sourceGiroId: giro.id,
        tappe: giro.tappe,
      }
      setTemplates(prev => [tpl, ...prev])
      setSavedMsg('Template salvato!')
      setTimeout(() => setSavedMsg(''), 2500)
    }
  }

  const selectedGiro = selectedId ? giri.find(g => g.id === selectedId) : null

  const tableBlock = (
    <div className="giri-table-col">
      {/* KPI */}
      <div className="giri-kpi-row">
        <div className="giri-kpi">
          <div className="giri-kpi-val">{giriOggi.length}</div>
          <div className="giri-kpi-label">Giri oggi</div>
        </div>
        <div className="giri-kpi">
          <div className="giri-kpi-val">{giriSettimana.length}</div>
          <div className="giri-kpi-label">Giri ultimi 7gg</div>
        </div>
        <div className="giri-kpi">
          <div className="giri-kpi-val">{tappePianif}</div>
          <div className="giri-kpi-label">Tappe pianificate</div>
        </div>
        <div className="giri-kpi">
          <div className="giri-kpi-val">{kmOggi}</div>
          <div className="giri-kpi-label">Km totali oggi</div>
        </div>
      </div>

      {/* Card tabella */}
      <div className="card">
        <div className="card-header">
          <h3>Giri di consegna</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {savedMsg && (
              <span style={{ fontSize: 12, color: '#2E7D32', fontWeight: 500 }}>{savedMsg}</span>
            )}
            <span className="card-label">{filtered.length} giri</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cerca giro…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => handleSearch('')}>×</button>
            )}
          </div>
          <MultiSelect
            placeholder="Tutte le filiali"
            options={FILIALI_OPT}
            value={filterFiliale}
            onChange={v => { setFilterFiliale(v); setPage(1) }}
          />
          <MultiSelect
            placeholder="Tutti gli autisti"
            options={DRIVERS_OPT}
            value={filterAutore}
            onChange={v => { setFilterAutore(v); setPage(1) }}
          />
          <MultiSelect
            placeholder="Tutti gli stati"
            options={STATI_OPT}
            value={filterStato}
            onChange={v => { setFilterStato(v); setPage(1) }}
          />
        </div>

        {/* Tabella */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Giro</th>
                <th>Filiale</th>
                <th>Autista</th>
                <th>Tappe</th>
                <th>Km</th>
                <th>Durata</th>
                <th>Stato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(g => {
                const filiale = FILIALI.find(f => f.id === g.filialeId)
                const driver  = DRIVERS.find(d => d.id === g.autoreId)
                return (
                  <tr
                    key={g.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedId(g.id === selectedId ? null : g.id)}
                  >
                    <td className="td-small">{formatData(g.data)}</td>
                    <td style={{ fontWeight: 500 }}>{g.nome}</td>
                    <td className="td-small">{filiale ? filiale.nome : g.filialeId}</td>
                    <td className="td-small">{driver ? `${driver.cognome} ${driver.nome}` : g.autoreId}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 24,
                        height: 22,
                        padding: '0 7px',
                        borderRadius: 11,
                        background: 'var(--fp-cool-gray)',
                        color: 'var(--fp-charcoal)',
                        fontWeight: 600,
                        fontSize: 12,
                      }}>
                        {g.tappe.length}
                      </span>
                    </td>
                    <td className="td-small">{g.distanzaKm} km</td>
                    <td className="td-small">{formatDurata(g.durataMin)}</td>
                    <td>
                      <span className={`status-badge ${getStatoClass(g.stato)}`}>{g.stato}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="row-actions">
                        <button
                          className="btn-icon"
                          title="Apri dettaglio"
                          onClick={() => setSelectedId(g.id === selectedId ? null : g.id)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button
                          className={`btn-icon btn-star${savedGiroIds.has(g.id) ? ' saved' : ''}`}
                          title={savedGiroIds.has(g.id) ? 'Rimuovi template' : 'Salva come template'}
                          onClick={() => handleToggleTemplate(g)}
                        >
                          {savedGiroIds.has(g.id) ? '★' : '☆'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {pageData.length === 0 && (
            <div className="table-empty">Nessun giro trovato con i filtri correnti.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            <PaginationPages current={page} total={totalPages} onPage={setPage} />
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            <span className="page-info">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} di {filtered.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  if (selectedGiro) {
    return (
      <div className="giri-layout">
        {tableBlock}
        <DetailGiro
          giro={selectedGiro}
          onClose={() => setSelectedId(null)}
          isSaved={savedGiroIds.has(selectedGiro.id)}
          onToggleTemplate={handleToggleTemplate}
        />
      </div>
    )
  }

  return tableBlock
}
