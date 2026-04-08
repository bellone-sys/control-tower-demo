import { useState } from 'react'
import { GIRI_INIT } from '../../data/giri'
import { FILIALI } from '../../data/filiali'
import { getExtraScenari } from '../../services/scenariService'
import TabScenari from './giri/TabScenari'
import TabTemplate from './giri/TabTemplate'
import './Giri.css'

export default function Scenari({ onStartJob, addNotification }) {
  const [activeTab, setActiveTab] = useState('scenari')
  const [giri] = useState(GIRI_INIT)

  const scenariCount = FILIALI.filter(f => giri.some(g => g.filialeId === f.id)).length
  const templateCount = getExtraScenari().length

  return (
    <div className="section-content">
      <div className="flotta-tabs-wrap">
        <div className="flotta-tabs">
          {[
            { id: 'scenari',   label: 'Scenari',    count: scenariCount      },
            { id: 'template',  label: '📋 Template', count: templateCount     },
          ].map(t => (
            <button
              key={t.id}
              className={`flotta-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              <span className="flotta-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'scenari'   && <TabScenari  giri={giri} onStartJob={onStartJob} addNotification={addNotification} />}
      {activeTab === 'template' && <TabTemplate />}
    </div>
  )
}
