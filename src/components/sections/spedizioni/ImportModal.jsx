import { useState, useRef, useEffect } from 'react'
import { PROVINCE_PER_REGIONE } from '../../../data/province'
import '../flotta/Flotta.css'
import './ImportModal.css'

// ─── ProvinceSelect ─────────────────────────────────────────────────────────

function ProvinceSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const allCodes = PROVINCE_PER_REGIONE.flatMap(r => r.province.map(p => p.codice))
  const totalCount = allCodes.length

  useEffect(() => {
    function handleOut(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOut)
    return () => document.removeEventListener('mousedown', handleOut)
  }, [open])

  const selectAll = () => onChange(allCodes)
  const selectNone = () => onChange([])

  const toggleRegion = (region) => {
    const codes = region.province.map(p => p.codice)
    const allIn = codes.every(c => selected.includes(c))
    if (allIn) {
      onChange(selected.filter(c => !codes.includes(c)))
    } else {
      const next = [...selected]
      codes.forEach(c => { if (!next.includes(c)) next.push(c) })
      onChange(next)
    }
  }

  const toggleProvincia = (codice) => {
    if (selected.includes(codice)) {
      onChange(selected.filter(c => c !== codice))
    } else {
      onChange([...selected, codice])
    }
  }

  const regioneCheck = (region) => {
    const codes = region.province.map(p => p.codice)
    const countIn = codes.filter(c => selected.includes(c)).length
    if (countIn === 0) return '☐'
    if (countIn === codes.length) return '☑'
    return '⊟'
  }

  const filteredRegioni = PROVINCE_PER_REGIONE.map(r => ({
    ...r,
    province: r.province.filter(
      p =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.codice.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(r => r.province.length > 0 || r.regione.toLowerCase().includes(search.toLowerCase()))

  const label =
    selected.length === 0
      ? 'Seleziona province…'
      : selected.length === totalCount
      ? 'Tutte le province'
      : `${selected.length} province selezionate`

  return (
    <div className="province-select" ref={ref}>
      <button
        type="button"
        className="province-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <span>{label}</span>
        <span style={{ fontSize: 10, color: 'var(--fp-gray-mid)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="province-dropdown">
          <div className="province-search">
            <input
              type="text"
              placeholder="Cerca provincia…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="province-quick">
            <button type="button" onClick={selectAll}>Tutte</button>
            <button type="button" onClick={selectNone}>Nessuna</button>
          </div>
          <div className="province-list">
            {filteredRegioni.map(region => {
              const codes = region.province.map(p => p.codice)
              const countIn = codes.filter(c => selected.includes(c)).length
              return (
                <div key={region.regione}>
                  <button
                    type="button"
                    className="province-region-header"
                    onClick={() => toggleRegion(region)}
                  >
                    <span>{regioneCheck(region)}</span>
                    <span>{region.regione}</span>
                    <span className="province-region-count">
                      {countIn}/{region.province.length}
                    </span>
                  </button>
                  <div className="province-items">
                    {region.province.map(p => {
                      const isSel = selected.includes(p.codice)
                      return (
                        <button
                          key={p.codice}
                          type="button"
                          className={`province-item${isSel ? ' selected' : ''}`}
                          onClick={() => toggleProvincia(p.codice)}
                        >
                          <span className="province-check">{isSel ? '✓' : ' '}</span>
                          <span className="province-code">{p.codice}</span>
                          <span className="province-nome">{p.nome}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selected.length > 0 && selected.length < totalCount && (
        <div className="province-selected-summary">
          Selezionate: {selected.join(', ')}
        </div>
      )}
    </div>
  )
}

// ─── ImportModal ─────────────────────────────────────────────────────────────

const MESI_OPTIONS = [
  { value: 1, label: 'Ultimo mese' },
  { value: 3, label: 'Ultimi 3 mesi' },
  { value: 6, label: 'Ultimi 6 mesi' },
  { value: 12, label: 'Ultimo anno' },
]

export default function ImportModal({ onClose, onConfirm }) {
  const [tab, setTab] = useState('api')
  const [mesi, setMesi] = useState(3)
  const [province, setProvince] = useState([])
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleBrowse = () => fileInputRef.current?.click()

  const handleFileInput = (e) => {
    const f = e.target.files[0]
    if (f) handleFile(f)
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const downloadTemplate = () => {
    const headers = 'id;tipo;destinatario;pudoId;pudoNome;peso_kg;dim_l_cm;dim_h_cm;dim_p_cm;priorita;data'
    const example = '1;standard;Mario Rossi;PUD001;FermoPoint Milano Centro;1.5;30;20;15;normale;2024-01-15'
    const csvContent = `${headers}\n${example}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_spedizioni.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const canConfirm =
    tab === 'api' ? province.length > 0 : file !== null

  const handleConfirm = () => {
    if (!canConfirm) return
    if (tab === 'api') {
      onConfirm({ mode: 'api', mesi, province })
    } else {
      onConfirm({ mode: 'file', file, fileName: file.name })
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box import-modal">
        <div className="modal-header">
          <h3 className="modal-title">Importa spedizioni</h3>
          <button className="modal-close" onClick={onClose} aria-label="Chiudi">×</button>
        </div>

        <div className="import-tabs">
          <button
            type="button"
            className={`import-tab${tab === 'api' ? ' active' : ''}`}
            onClick={() => setTab('api')}
          >
            Sincronizzazione API
          </button>
          <button
            type="button"
            className={`import-tab${tab === 'file' ? ' active' : ''}`}
            onClick={() => setTab('file')}
          >
            Carica file
          </button>
        </div>

        <div className="modal-body">
          {tab === 'api' && (
            <>
              <div className="import-section-title">Periodo storico</div>
              <div className="mesi-toggle">
                {MESI_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`mesi-btn${mesi === opt.value ? ' active' : ''}`}
                    onClick={() => setMesi(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="import-section-title" style={{ marginTop: 20 }}>
                Area geografica
              </div>
              <p style={{ fontSize: 12, color: 'var(--fp-gray-mid)', marginBottom: 8, marginTop: 0 }}>
                Seleziona le province da sincronizzare
              </p>
              <ProvinceSelect selected={province} onChange={setProvince} />

              <div className="import-info-box">
                La sincronizzazione scarica le spedizioni dal sistema AS/400 per il periodo e le province selezionate.
                Il processo può richiedere diversi minuti.
              </div>
            </>
          )}

          {tab === 'file' && (
            <>
              <div className="import-section-title">Template</div>
              <button type="button" className="template-btn" onClick={downloadTemplate}>
                ⬇ Scarica template CSV
              </button>

              <div className="import-section-title">File</div>

              {!file ? (
                <div
                  className={`drop-zone${dragOver ? ' drag-over' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={handleBrowse}
                >
                  <div className="drop-zone-icon">📁</div>
                  <div className="drop-zone-text">Trascina qui il file CSV</div>
                  <div className="drop-zone-or">oppure</div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={e => { e.stopPropagation(); handleBrowse() }}
                  >
                    Sfoglia file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className="file-selected">
                  <span style={{ fontSize: 20 }}>📄</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    className="notif-close"
                    onClick={removeFile}
                    aria-label="Rimuovi file"
                    style={{ opacity: 0.6, fontSize: 20 }}
                  >
                    ×
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />
                </div>
              )}

              <div className="import-info-box">
                Il file deve rispettare il formato del template. Scarica il template per vedere la struttura richiesta.
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Annulla
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {tab === 'api' ? 'Avvia sincronizzazione' : 'Importa file'}
          </button>
        </div>
      </div>
    </div>
  )
}
