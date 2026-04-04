import { useState } from 'react'
import { GIRI_INIT, TEMPLATE_INIT } from '../../data/giri'
import TabGiri from './giri/TabGiri'
import TabTemplate from './giri/TabTemplate'
import './Giri.css'

export default function Giri() {
  const [tab,       setTab]       = useState('giri')
  const [giri,      setGiri]      = useState(GIRI_INIT)
  const [templates, setTemplates] = useState(TEMPLATE_INIT)

  return (
    <div className="section-content">
      {/* Tab bar */}
      <div className="flotta-tabs-wrap">
        <div className="flotta-tabs">
          {[
            { id: 'giri',     label: 'Giri',     count: giri.length      },
            { id: 'template', label: 'Template',  count: templates.length },
          ].map(t => (
            <button
              key={t.id}
              className={`flotta-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="flotta-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'giri' && (
        <TabGiri
          giri={giri}
          setGiri={setGiri}
          templates={templates}
          setTemplates={setTemplates}
        />
      )}
      {tab === 'template' && (
        <TabTemplate
          templates={templates}
          setTemplates={setTemplates}
          onUseTemplate={() => setTab('giri')}
        />
      )}
    </div>
  )
}
