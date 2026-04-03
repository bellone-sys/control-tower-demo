import { useState } from 'react'
import { DRIVERS, MEZZI, MODELLI_MEZZI } from '../../data/flotta'
import TabAutisti from './flotta/TabAutisti'
import TabMezzi from './flotta/TabMezzi'
import TabAssociazioni from './flotta/TabAssociazioni'
import './Flotta.css'

const TABS = [
  { id: 'autisti',      label: 'Autisti',      count: DRIVERS.length },
  { id: 'mezzi',        label: 'Mezzi',        count: MEZZI.length },
  { id: 'associazioni', label: 'Associazioni', count: DRIVERS.filter(d => d.mezzoId).length },
]

export default function Flotta() {
  const [tab, setTab] = useState('autisti')

  return (
    <div className="section-content">
      {/* Tab bar */}
      <div className="flotta-tabs-wrap">
        <div className="flotta-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`flotta-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="flotta-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'autisti'      && <TabAutisti />}
      {tab === 'mezzi'        && <TabMezzi />}
      {tab === 'associazioni' && <TabAssociazioni />}
    </div>
  )
}
