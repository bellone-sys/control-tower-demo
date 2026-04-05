import { useState } from 'react'
import { DRIVERS as D0, MEZZI as M0, MODELLI_MEZZI as MOD0 } from '../../data/flotta'
import TabAutisti from './flotta/TabAutisti'
import './Flotta.css'

export default function Autisti() {
  const [drivers, setDrivers] = useState(D0)
  const [mezzi,   setMezzi]   = useState(M0)
  const [modelli]             = useState(MOD0)

  return (
    <div className="section-content">
      <TabAutisti
        drivers={drivers} setDrivers={setDrivers}
        mezzi={mezzi}     setMezzi={setMezzi}
        modelli={modelli}
      />
    </div>
  )
}
