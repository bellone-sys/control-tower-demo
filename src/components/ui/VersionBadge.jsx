import { APP_VERSION } from '../../version'

/**
 * Componente centralizzato per la visualizzazione della versione.
 * Usare questo componente in tutti i posti dove serve mostrare la versione
 * per garantire coerenza su tutta l'app.
 */
export default function VersionBadge({ format = 'simple', onClick, className = '' }) {
  // simple: "v0.25.0"
  // demo: "v0.25.0 · Demo"
  // full: "Fermopoint Control Tower v0.25.0"
  // minimal: "0.25.0"

  const text = {
    simple: `v${APP_VERSION}`,
    demo: `v${APP_VERSION} · Demo`,
    full: `Fermopoint Control Tower v${APP_VERSION}`,
    minimal: APP_VERSION,
  }[format] || `v${APP_VERSION}`

  const baseClass = `version-badge version-badge-${format}`

  return (
    <span className={`${baseClass} ${className}`} onClick={onClick}>
      {text}
    </span>
  )
}
