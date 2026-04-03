import { useState, useMemo } from 'react'
import { PREZZI_CARBURANTI, CARBURANTI_META } from '../../../data/carburanti'
import '../Sections.css'
import './Flotta.css'
import './TabCarburanti.css'

const CARB_KEYS = ['diesel', 'benzina', 'gpl', 'elettrico']
const RANGE_OPT = [
  { value: 7,  label: '7 giorni'  },
  { value: 15, label: '15 giorni' },
  { value: 30, label: '30 giorni' },
]

// Sorted newest first
const ALL_ROWS = [...PREZZI_CARBURANTI].reverse()

function delta(current, previous) {
  if (previous == null) return null
  return +(current - previous).toFixed(3)
}

function formatPrice(val, decimals = 3) {
  return val.toFixed(decimals)
}

function DeltaBadge({ d, unit }) {
  if (d === null) return <span className="carb-delta-neutral">—</span>
  const pos = d > 0
  const neg = d < 0
  const cls = pos ? 'carb-delta-up' : neg ? 'carb-delta-down' : 'carb-delta-neutral'
  const sign = pos ? '+' : ''
  return (
    <span className={`carb-delta ${cls}`}>
      {pos ? '▲' : neg ? '▼' : '▬'} {sign}{d.toFixed(3)}
    </span>
  )
}

function Sparkline({ values, color }) {
  if (values.length < 2) return null
  const min  = Math.min(...values)
  const max  = Math.max(...values)
  const range = max - min || 0.001
  const w = 80, h = 28, pad = 2
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function TabCarburanti() {
  const [range,   setRange]   = useState(30)
  const [sortKey, setSortKey] = useState('data')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  // Rows with deltas pre-computed (ALL_ROWS is newest-first)
  const rowsWithDelta = useMemo(() => {
    return ALL_ROWS.map((row, i) => {
      const prev = ALL_ROWS[i + 1] // previous = older
      return {
        ...row,
        _delta: Object.fromEntries(
          CARB_KEYS.map(k => [k, delta(row[k], prev?.[k])])
        )
      }
    })
  }, [])

  const sliced = rowsWithDelta.slice(0, range)

  const sorted = useMemo(() => {
    return [...sliced].sort((a, b) => {
      const av = a[sortKey] ?? a.data
      const bv = b[sortKey] ?? b.data
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sliced, sortKey, sortDir])

  // KPI: latest row
  const latest = rowsWithDelta[0]
  const prev   = rowsWithDelta[1]

  // Sparklines (last N values, oldest first for left-to-right rendering)
  const sparkValues = useMemo(() =>
    [...sliced].reverse().reduce((acc, row) => {
      CARB_KEYS.forEach(k => { acc[k] = [...(acc[k] || []), row[k]] })
      return acc
    }, {})
  , [sliced])

  function SortTh({ field, children, style }) {
    const active = sortKey === field
    return (
      <th className={`sortable${active ? ' sort-active' : ''}`} onClick={() => handleSort(field)} style={style}>
        {children}{active ? <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span> : null}
      </th>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ===== KPI BAR ===== */}
      <div className="carb-kpi-grid">
        {CARB_KEYS.map(k => {
          const meta = CARBURANTI_META[k]
          const val  = latest[k]
          const d    = latest._delta[k]
          const trend = d > 0 ? 'up' : d < 0 ? 'down' : 'flat'
          return (
            <div key={k} className="carb-kpi-card">
              <div className="carb-kpi-top">
                <div>
                  <div className="carb-kpi-label">{meta.label}</div>
                  <div className="carb-kpi-value">{formatPrice(val)} <span className="carb-kpi-unit">{meta.unit}</span></div>
                </div>
                <div className={`carb-kpi-trend carb-trend-${trend}`}>
                  {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▬'}
                </div>
              </div>
              <div className="carb-kpi-bottom">
                <DeltaBadge d={d} unit={meta.unit} />
                <span className="carb-kpi-hint">vs ieri</span>
              </div>
              <div className="carb-kpi-spark">
                <Sparkline values={sparkValues[k] || []} color={meta.color} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ===== TABLE ===== */}
      <div className="card">
        <div className="card-header">
          <h3>Storico prezzi carburanti</h3>
          <div className="card-actions">
            <div className="carb-range-tabs">
              {RANGE_OPT.map(o => (
                <button
                  key={o.value}
                  className={`carb-range-tab${range === o.value ? ' active' : ''}`}
                  onClick={() => setRange(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <span className="card-label">{sliced.length} rilevazioni</span>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table carb-table">
            <thead>
              <tr>
                <SortTh field="data" style={{ minWidth: 110 }}>Data</SortTh>
                {CARB_KEYS.map(k => (
                  <SortTh key={k} field={k} style={{ textAlign: 'right' }}>
                    <span className="carb-th-label">
                      {CARBURANTI_META[k].label}
                      <span className="carb-th-unit">{CARBURANTI_META[k].unit}</span>
                    </span>
                  </SortTh>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const isToday = row.data === ALL_ROWS[0].data
                return (
                  <tr key={row.data} className={isToday ? 'carb-row-today' : ''}>
                    <td>
                      <div className="carb-date">
                        {new Date(row.data).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isToday && <span className="carb-today-badge">oggi</span>}
                      </div>
                    </td>
                    {CARB_KEYS.map(k => {
                      const meta = CARBURANTI_META[k]
                      const d    = row._delta[k]
                      return (
                        <td key={k} className="carb-price-cell">
                          <div className="carb-price-val" style={{ color: meta.color }}>
                            {formatPrice(row[k])}
                          </div>
                          <DeltaBadge d={d} unit={meta.unit} />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="carb-footer">
          <span>Prezzi medi nazionali al consumo · Fonte: elaborazione interna</span>
          <span>Aggiornato: {new Date(ALL_ROWS[0].data).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  )
}
