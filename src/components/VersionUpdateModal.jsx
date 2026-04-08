import { useI18n } from '../contexts/I18nContext'
import './VersionUpdateModal.css'

export default function VersionUpdateModal({ release, onClose }) {
  const { t } = useI18n()

  if (!release) return null

  return (
    <div className="version-modal-backdrop" onClick={onClose}>
      <div className="version-modal" onClick={(e) => e.stopPropagation()}>
        <div className="version-modal-header">
          <h2>Nuova versione disponibile</h2>
          <button className="version-modal-close" onClick={onClose} aria-label="Chiudi">
            ✕
          </button>
        </div>

        <div className="version-modal-body">
          <div className="version-badge">v{release.version}</div>
          <p className="version-date">{new Date(release.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h3 className="version-title">{release.title}</h3>

          <div className="version-changelog">
            <h4>Novità:</h4>
            <ul>
              {release.changelog.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="version-modal-footer">
          <button className="version-btn-secondary" onClick={onClose}>
            Più tardi
          </button>
          <a href="#" className="version-btn-primary" onClick={(e) => {
            e.preventDefault()
            window.location.href = 'https://github.com/bellone-sys/control-tower-demo/releases/latest'
          }}>
            Visualizza Release Notes ↗
          </a>
        </div>
      </div>
    </div>
  )
}
