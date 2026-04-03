import { KPI, TREND_SETTIMANALE, ATTIVITA_RECENTI } from '../../data/stub'
import './Sections.css'

export default function Overview() {
  const max = Math.max(...TREND_SETTIMANALE.map(d => d.consegnate))

  return (
    <div className="section-content">

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard
          label="Spedizioni oggi"
          value={KPI.spedizioniOggi.toLocaleString('it-IT')}
          delta={KPI.spedizioniOggiDelta}
          unit=""
          icon="📦"
        />
        <KpiCard
          label="Tasso di consegna"
          value={`${KPI.tassoConsegna}%`}
          delta={KPI.tassoConsegnaDelta}
          unit=""
          icon="✅"
        />
        <KpiCard
          label="Eccezioni aperte"
          value={KPI.eccezioniAperte}
          delta={KPI.eccezioniAperteDelta}
          unit=""
          icon="⚠️"
          alert
        />
        <KpiCard
          label="Punti ritiro attivi"
          value={KPI.puntiRitiroAttivi}
          delta={KPI.puntiRitiroDelta}
          unit=""
          icon="📍"
        />
      </div>

      <div className="overview-bottom">
        {/* Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h3>Spedizioni settimanali</h3>
            <span className="card-label">Ultimi 7 giorni</span>
          </div>
          <div className="bar-chart">
            {TREND_SETTIMANALE.map(d => (
              <div key={d.giorno} className="bar-col">
                <div className="bar-wrap">
                  <div
                    className="bar"
                    style={{ height: `${(d.consegnate / max) * 100}%` }}
                    title={`${d.consegnate} consegnate`}
                  />
                </div>
                <span className="bar-label">{d.giorno}</span>
                <span className="bar-value">{d.consegnate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="card activity-card">
          <div className="card-header">
            <h3>Attività recente</h3>
            <span className="card-label">Oggi</span>
          </div>
          <ul className="activity-list">
            {ATTIVITA_RECENTI.map((a, i) => (
              <li key={i} className={`activity-item activity-${a.tipo}`}>
                <span className="activity-dot" />
                <div className="activity-body">
                  <span className="activity-event">{a.evento}</span>
                  <span className="activity-punto">{a.punto}</span>
                </div>
                <span className="activity-ora">{a.ora}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, delta, icon, alert }) {
  const positive = delta > 0
  const neutral = delta === 0
  const isGoodDelta = alert ? !positive : positive

  return (
    <div className={`kpi-card ${alert && delta < 0 ? 'kpi-good' : alert ? 'kpi-alert' : ''}`}>
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
        <span className={`kpi-delta ${isGoodDelta ? 'delta-good' : neutral ? 'delta-neutral' : 'delta-bad'}`}>
          {positive ? '▲' : '▼'} {Math.abs(delta)}{typeof delta === 'number' && !Number.isInteger(delta) ? '%' : ''}
        </span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}
