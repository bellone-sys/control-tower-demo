import releases from '../../data/json/releases.json'
import './Sections.css'
import './ReleaseNotes.css'

const UNRELEASED = [
  'Sezione Eccezioni: gestione avanzata con workflow di risoluzione',
  'Dashboard Overview: grafici temporali con storico 30/60/90 giorni',
  'Export dati: download CSV/Excel per spedizioni, giri e report',
  'Integrazione OptimoRoute: calcolo ottimizzazione reale via API',
]

const TYPE_LABELS = {
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
}

const TYPE_COLORS = {
  major: '#DC0032',
  minor: '#1565C0',
  patch: '#808285',
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

function VersionBadge({ type }) {
  return (
    <span
      className="rn-version-badge"
      style={{ backgroundColor: TYPE_COLORS[type] ?? '#808285' }}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

export default function ReleaseNotes() {
  return (
    <div className="section-content">
      {/* Header */}
      <div className="rn-header">
        <h1 className="rn-header-title">Release Notes</h1>
        <p className="rn-header-subtitle">
          Cronologia delle versioni rilasciate della Fermopoint Control Tower.
          I rilasci sono ordinati dal più recente al più vecchio.
        </p>
      </div>

      {/* Timeline */}
      <div className="rn-timeline">

        {/* Unreleased / In sviluppo */}
        <div className="rn-item rn-unreleased">
          <div className="rn-item-accent" style={{ backgroundColor: '#E65100' }} />
          <div className="rn-item-body">
            <div className="rn-item-meta">
              <span className="rn-version-badge" style={{ backgroundColor: '#E65100' }}>
                In sviluppo
              </span>
              <span className="rn-tag">develop</span>
              <span className="rn-title">Prossima versione</span>
              <span className="rn-date">non ancora rilasciato</span>
            </div>
            <ul className="rn-highlights">
              {UNRELEASED.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Released versions */}
        {releases.map((release) => (
          <div key={release.tag} className="rn-item">
            <div
              className="rn-item-accent"
              style={{ backgroundColor: TYPE_COLORS[release.type] ?? '#808285' }}
            />
            <div className="rn-item-body">
              <div className="rn-item-meta">
                <VersionBadge type={release.type} />
                <span className="rn-tag">{release.tag}</span>
                <span className="rn-title">{release.title}</span>
                <span className="rn-date">{formatDate(release.date)}</span>
              </div>
              <ul className="rn-highlights">
                {release.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
