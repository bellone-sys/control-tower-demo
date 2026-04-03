import { useState } from 'react'
import { DRIVERS as D0, MEZZI as M0, MODELLI_MEZZI as MOD0 } from '../../data/flotta'
import { PREZZI_CARBURANTI } from '../../data/carburanti'
import TabAutisti from './flotta/TabAutisti'
import TabMezzi from './flotta/TabMezzi'
import TabModelli from './flotta/TabModelli'
import TabCarburanti from './flotta/TabCarburanti'
import './Flotta.css'

export default function Flotta() {
  const [tab,     setTab]     = useState('autisti')
  const [drivers, setDrivers] = useState(D0)
  const [mezzi,   setMezzi]   = useState(M0)
  const [modelli, setModelli] = useState(MOD0)

  const TABS = [
    { id: 'autisti',    label: 'Autisti',    count: drivers.length           },
    { id: 'mezzi',      label: 'Mezzi',      count: mezzi.length             },
    { id: 'modelli',    label: 'Modelli',    count: modelli.length           },
    { id: 'carburanti', label: 'Carburanti', count: PREZZI_CARBURANTI.length },
  ]

  return (
    <div className="section-content">
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

      {tab === 'autisti' && (
        <TabAutisti
          drivers={drivers} setDrivers={setDrivers}
          mezzi={mezzi}     setMezzi={setMezzi}
          modelli={modelli}
        />
      )}
      {tab === 'mezzi' && (
        <TabMezzi
          mezzi={mezzi}     setMezzi={setMezzi}
          modelli={modelli} drivers={drivers}
        />
      )}
      {tab === 'modelli' && (
        <TabModelli
          modelli={modelli} setModelli={setModelli}
          mezzi={mezzi}
        />
      )}
      {tab === 'carburanti' && <TabCarburanti />}
    </div>
  )
}
