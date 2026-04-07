import { useState } from 'react'
import { GIRI_INIT } from '../../data/giri'
import TabGiri from './giri/TabGiri'
import './Giri.css'

export default function Giri({ onStartJob, addNotification }) {
  const [giri, setGiri] = useState(GIRI_INIT)

  return (
    <div className="section-content">
      <TabGiri
        giri={giri}
        setGiri={setGiri}
        addNotification={addNotification}
      />
    </div>
  )
}
