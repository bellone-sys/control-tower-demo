import { useState, useRef } from 'react'
import pudosRoma from '../../../data/pudosRoma.json'
import './GiroSequenceEditor.css'

// ── Constants ────────────────────────────────────────────────────────────────

const PUDO_DB    = Object.fromEntries(pudosRoma.map(p => [p.id, p]))
const DAY_KEYS   = ['lun','mar','mer','gio','ven','sab','dom']
const DAY_LABELS = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']

// ── Pure helpers ─────────────────────────────────────────────────────────────

function sh(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = Math.PI / 180
  const dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2
  return +(R * 2 * Math.asin(Math.sqrt(a)) * 1.38).toFixed(1)
}

function timeDiffMin(t1, t2) {
  if (!t1 || !t2) return 0
  const [h1, m1] = t1.split(':').map(Number)
  const [h2, m2] = t2.split(':').map(Number)
  return (h2 * 60 + m2) - (h1 * 60 + m1)
}

// ── CopyId ────────────────────────────────────────────────────────────────────

function CopyId({ id }) {
  const [ok, setOk] = useState(false)
  function copy(e) {
    e.stopPropagation()
    navigator.clipboard?.writeText(id)
    setOk(true)
    setTimeout(() => setOk(false), 1400)
  }
  return (
    <button className="gse-copy" onClick={copy} title="Copia ID">
      <code className="gse-code">{id}</code>
      {ok
        ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  )
}

// ── PudoExpandedDetail ────────────────────────────────────────────────────────

function PudoExpandedDetail({ tappa }) {
  const pudo = PUDO_DB[tappa.pudoId]
  if (!pudo) return <div className="gse-pudo-nodata">Dettagli non disponibili per questo PUDO.</div>
  return (
    <div className="gse-pudo-expanded">
      <div className="gse-pudo-exp-addr">
        {pudo.via ? `${pudo.via}${pudo.civico ? `, ${pudo.civico}` : ''} — ${pudo.cap}` : pudo.cap}
      </div>
      <div className="gse-pudo-exp-hours">
        {DAY_KEYS.map((d, i) => {
          const slots = pudo.hours?.[d]
          return (
            <div key={d} className="gse-pudo-exp-day">
              <span className="gse-pudo-exp-dlabel">{DAY_LABELS[i]}</span>
              <span className="gse-pudo-exp-dval">
                {slots === null ? <i>Chiuso</i>
                  : !slots || slots.length === 0 ? '—'
                  : slots.map(s => `${s.o}–${s.c}`).join(' / ')}
              </span>
            </div>
          )
        })}
      </div>
      <a
        className="gse-pudo-exp-maplink"
        href={`https://www.openstreetmap.org/?mlat=${tappa.lat}&mlon=${tappa.lng}#map=17/${tappa.lat}/${tappa.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Apri su mappa
      </a>
    </div>
  )
}

// ── TappaCard ─────────────────────────────────────────────────────────────────

function TappaCard({ tappa, color, prevLat, prevLng, onRemove, onDragStart, onDrop, isDragOver }) {
  const [showDetail, setShowDetail] = useState(false)

  const ci      = +(1.5 + (sh(tappa.pudoId + 'ci') % 350) / 100).toFixed(2)
  const peso    = 5 + sh(tappa.pudoId + 'w') % 46
  const volume  = +((5 + sh(tappa.pudoId + 'v') % 76) / 100).toFixed(2)
  const servMin = timeDiffMin(tappa.oraArrivo, tappa.oraPartenza)

  const transitKm  = prevLat != null ? haversineKm(prevLat, prevLng, tappa.lat, tappa.lng) : null
  const transitMin = transitKm != null ? Math.max(3, Math.round(transitKm * 60 / 25)) : null

  return (
    <div
      className={`gse-tappa-wrap${isDragOver ? ' drop-over' : ''}`}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onDrop() }}
    >
      {transitKm !== null && (
        <div className="gse-transit">
          <span className="gse-transit-bar" style={{ background: color }} />
          <span className="gse-transit-label">{transitKm} km · ~{transitMin} min</span>
          <span className="gse-transit-bar" style={{ background: color }} />
        </div>
      )}

      <div
        className={`gse-tappa-card${showDetail ? ' expanded' : ''}`}
        draggable
        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      >
        <div className="gse-handle" title="Trascina per riordinare">⠿</div>
        <div className="gse-seq" style={{ background: color }}>{tappa.ordine}</div>

        <div className="gse-tappa-info">
          <div className="gse-tappa-top">
            <span className="gse-tipo-icon">{tappa.tipo === 'locker' ? '🔒' : '🏪'}</span>
            <span className="gse-nome">{tappa.pudoNome}</span>
            <CopyId id={tappa.pudoId} />
            <span className="gse-tipo-chip">{tappa.tipo === 'locker' ? 'Locker' : 'PUDO'}</span>
          </div>
          <div className="gse-tappa-meta">
            <span>🕐 {tappa.oraArrivo}–{tappa.oraPartenza}</span>
            <span className="gse-dot-sep">·</span>
            <span>CI <strong>{ci}</strong></span>
            <span className="gse-dot-sep">·</span>
            <span>{peso} kg</span>
            <span className="gse-dot-sep">·</span>
            <span>{volume} m³</span>
            <span className="gse-dot-sep">·</span>
            <span>{servMin} min servizio</span>
          </div>
          {showDetail && <PudoExpandedDetail tappa={tappa} />}
        </div>

        <div className="gse-tappa-acts">
          <button
            className={`gse-act-btn${showDetail ? ' active' : ''}`}
            onClick={() => setShowDetail(v => !v)}
            title="Dettagli PUDO (orari + mappa)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>
          <button
            className="gse-act-btn gse-act-remove"
            onClick={onRemove}
            title="Rimuovi dal giro"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function GiroSequenceEditor({ giriWithColor, scenario }) {
  const [expanded,    setExpanded]    = useState(new Set())
  const [giriTappe,   setGiriTappe]   = useState(() =>
    Object.fromEntries(giriWithColor.map(g => [g.id, [...g.tappe].sort((a, b) => a.ordine - b.ordine)]))
  )
  const [unassigned,  setUnassigned]  = useState([])
  const [hasChanges,  setHasChanges]  = useState(false)
  const [needsRecalc, setNeedsRecalc] = useState(false)
  const [savedMsg,    setSavedMsg]    = useState('')
  const [dropOver,    setDropOver]    = useState(null)

  const dragRef = useRef(null)

  function toggleExpand(id) {
    setExpanded(prev => {
      const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
    })
  }

  function markDirty() {
    setHasChanges(true)
    setNeedsRecalc(true)
    setSavedMsg('')
  }

  function removeTappa(giroId, tappaIdx) {
    const tappa = giriTappe[giroId][tappaIdx]
    setGiriTappe(prev => ({
      ...prev,
      [giroId]: prev[giroId]
        .filter((_, i) => i !== tappaIdx)
        .map((t, i) => ({ ...t, ordine: i + 1 })),
    }))
    setUnassigned(prev => [...prev, { ...tappa, _fromGiro: giroId }])
    markDirty()
  }

  function startDrag(source, giroId, idx) {
    const tappa = source === 'pool' ? unassigned[idx] : giriTappe[giroId][idx]
    dragRef.current = { source, giroId, idx, tappa }
  }

  function dropToGiro(targetGiroId, targetIdx) {
    const d = dragRef.current
    if (!d) return
    setDropOver(null)

    setGiriTappe(prev => {
      const next = Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, [...v]]))
      if (d.source === 'giro') next[d.giroId] = next[d.giroId].filter((_, i) => i !== d.idx)
      const sameGiro = d.source === 'giro' && d.giroId === targetGiroId
      const insertAt = sameGiro && d.idx < targetIdx ? targetIdx - 1 : targetIdx
      if (!next[targetGiroId]) next[targetGiroId] = []
      next[targetGiroId].splice(Math.max(0, insertAt), 0, { ...d.tappa })
      if (d.source === 'giro') next[d.giroId] = next[d.giroId].map((t, i) => ({ ...t, ordine: i + 1 }))
      next[targetGiroId] = next[targetGiroId].map((t, i) => ({ ...t, ordine: i + 1 }))
      return next
    })

    if (d.source === 'pool') setUnassigned(prev => prev.filter((_, i) => i !== d.idx))
    dragRef.current = null
    markDirty()
  }

  function dropToPool() {
    const d = dragRef.current
    if (!d || d.source === 'pool') return
    setDropOver(null)
    setGiriTappe(prev => ({
      ...prev,
      [d.giroId]: prev[d.giroId]
        .filter((_, i) => i !== d.idx)
        .map((t, i) => ({ ...t, ordine: i + 1 })),
    }))
    setUnassigned(prev => [...prev, { ...d.tappa, _fromGiro: d.giroId }])
    dragRef.current = null
    markDirty()
  }

  function handleSave() {
    localStorage.setItem(`fp_seq_${scenario.id}`, JSON.stringify({
      giriTappe, unassigned, savedAt: new Date().toISOString(),
    }))
    setHasChanges(false)
    setSavedMsg('✓ Modifiche salvate')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  return (
    <div className="card gse-root">
      <div className="card-header">
        <h3>Sequenza PUDO per giro</h3>
        <div className="gse-toolbar">
          {needsRecalc && (
            <span className="gse-recalc-badge">
              ⚠ Km e durata richiedono ricalcolo via OptimoRoute
            </span>
          )}
          {savedMsg && <span className="gse-save-ok">{savedMsg}</span>}
          {hasChanges && (
            <button className="gse-save-btn" onClick={handleSave}>Salva modifiche</button>
          )}
        </div>
      </div>

      {giriWithColor.map(g => {
        const tappe  = giriTappe[g.id] || []
        const isOpen = expanded.has(g.id)
        const depot  = g.depotLat ? { lat: g.depotLat, lng: g.depotLng } : null

        return (
          <div key={g.id} className="gse-giro">
            <button className={`gse-giro-hdr${isOpen ? ' open' : ''}`} onClick={() => toggleExpand(g.id)}>
              <span className="gse-giro-dot" style={{ background: g.color }} />
              <span className="gse-giro-name">{g.nome}</span>
              <span className="gse-giro-badge">{tappe.length} tappe</span>
              {g.distanzaKm && <span className="gse-giro-badge">{g.distanzaKm} km</span>}
              <svg className={`gse-chev${isOpen ? ' open' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {isOpen && (
              <div className="gse-giro-body">
                {tappe.length === 0 ? (
                  <div
                    className={`gse-drop-zone empty${dropOver === `giro:${g.id}:0` ? ' active' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDropOver(`giro:${g.id}:0`) }}
                    onDrop={e => { e.preventDefault(); dropToGiro(g.id, 0) }}
                  >
                    Trascina un PUDO qui per aggiungerlo a questo giro
                  </div>
                ) : (
                  <>
                    <div
                      className={`gse-drop-zone between${dropOver === `giro:${g.id}:0` ? ' active' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDropOver(`giro:${g.id}:0`) }}
                      onDragLeave={() => setDropOver(null)}
                      onDrop={e => { e.preventDefault(); dropToGiro(g.id, 0) }}
                    />
                    {tappe.map((t, i) => (
                      <div key={`${g.id}-${t.pudoId}-${i}`}>
                        <TappaCard
                          tappa={t}
                          color={g.color}
                          prevLat={i === 0 ? (depot?.lat ?? null) : tappe[i - 1].lat}
                          prevLng={i === 0 ? (depot?.lng ?? null) : tappe[i - 1].lng}
                          onRemove={() => removeTappa(g.id, i)}
                          onDragStart={() => startDrag('giro', g.id, i)}
                          onDrop={() => dropToGiro(g.id, i)}
                          isDragOver={dropOver === `giro:${g.id}:${i}`}
                        />
                        <div
                          className={`gse-drop-zone between${dropOver === `giro:${g.id}:${i + 1}` ? ' active' : ''}`}
                          onDragOver={e => { e.preventDefault(); setDropOver(`giro:${g.id}:${i + 1}`) }}
                          onDragLeave={() => setDropOver(null)}
                          onDrop={e => { e.preventDefault(); dropToGiro(g.id, i + 1) }}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Unassigned pool */}
      <div
        className={`gse-pool${dropOver === 'pool' ? ' drop-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDropOver('pool') }}
        onDragLeave={() => setDropOver(null)}
        onDrop={e => { e.preventDefault(); dropToPool() }}
      >
        <div className="gse-pool-hdr">
          <span>📦 PUDO non assegnati</span>
          {unassigned.length > 0 && <span className="gse-pool-count">{unassigned.length}</span>}
        </div>
        {unassigned.length === 0 ? (
          <div className="gse-pool-empty">
            Rimuovi PUDO dai giri per raccoglierli qui, poi trascinali in un giro
          </div>
        ) : (
          <div className="gse-pool-list">
            {unassigned.map((t, i) => (
              <div
                key={`pool-${t.pudoId}-${i}`}
                className="gse-pool-chip"
                draggable
                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; startDrag('pool', null, i) }}
              >
                <span className="gse-handle">⠿</span>
                <span>{t.tipo === 'locker' ? '🔒' : '🏪'}</span>
                <span className="gse-nome">{t.pudoNome}</span>
                <CopyId id={t.pudoId} />
                {t._fromGiro && (
                  <span className="gse-from-label">
                    ← {giriWithColor.find(g => g.id === t._fromGiro)?.nome ?? t._fromGiro}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
