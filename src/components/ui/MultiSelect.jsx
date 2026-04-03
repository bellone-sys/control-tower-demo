import { useState, useRef, useEffect } from 'react'
import './MultiSelect.css'

export default function MultiSelect({ options, value = [], onChange, placeholder = 'Tutti' }) {
  const [open, setOpen]       = useState(false)
  const [inner, setInner]     = useState('')
  const ref                   = useRef(null)

  useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function toggle(val) {
    onChange(value.includes(val) ? value.filter(v => v !== val) : [...value, val])
  }

  const visible = inner
    ? options.filter(o => o.label.toLowerCase().includes(inner.toLowerCase()))
    : options

  const triggerLabel = value.length === 0
    ? placeholder
    : value.length === 1
    ? (options.find(o => o.value === value[0])?.label ?? value[0])
    : `${value.length} selezionati`

  return (
    <div className="ms-wrap" ref={ref}>
      <button
        type="button"
        className={`ms-trigger${open ? ' open' : ''}${value.length ? ' has-value' : ''}`}
        onClick={() => { setOpen(o => !o); setInner('') }}
      >
        <span className="ms-label">{triggerLabel}</span>
        <svg className="ms-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="ms-dropdown">
          {options.length > 8 && (
            <div className="ms-search-wrap">
              <input
                className="ms-search-input"
                placeholder="Cerca…"
                value={inner}
                onChange={e => setInner(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}
          {value.length > 0 && (
            <button className="ms-clear-all" onClick={() => { onChange([]); setOpen(false) }}>
              Deseleziona tutto ({value.length})
            </button>
          )}
          <div className="ms-options-list">
            {visible.map(opt => (
              <label key={opt.value} className={`ms-option${value.includes(opt.value) ? ' checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
            {visible.length === 0 && <div className="ms-empty">Nessun risultato</div>}
          </div>
        </div>
      )}
    </div>
  )
}
