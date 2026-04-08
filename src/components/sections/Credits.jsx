import { APP_VERSION } from '../../version'
import './Sections.css'
import './Credits.css'

export default function Credits() {
  return (
    <div className="section-content">

      {/* Hero */}
      <div className="credits-hero">
        <div className="credits-hero-inner">
          <div className="credits-hero-badge">
            <span className="credits-dpd-dot" />
            Fermopoint
          </div>
          <h1 className="credits-title">Fermopoint Control Tower</h1>
          <p className="credits-subtitle">
            Sistema di monitoraggio e gestione della rete BRT Fermopoint
          </p>
          <span className="credits-version-pill">v{APP_VERSION}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="credits-grid">

        {/* Developed by */}
        <div className="credits-card credits-card--featured">
          <div className="credits-card-icon">🏢</div>
          <h2 className="credits-card-title">Sviluppato da</h2>
          <div className="credits-badge">
            <span className="credits-badge-name">Elipse Srl</span>
            <span className="credits-badge-tag">Software House</span>
          </div>
          <p className="credits-card-desc">
            Software house italiana specializzata in soluzioni gestionali, logistica
            e digital transformation. Fondata a Torino, Elipse progetta e sviluppa
            applicazioni su misura per aziende che operano in settori complessi e
            ad alto volume operativo.
          </p>
          <div className="credits-info-row">
            <span className="credits-info-label">Sede</span>
            <span className="credits-info-value">Torino, Italia</span>
          </div>
          <div className="credits-info-row">
            <span className="credits-info-label">Web</span>
            <span className="credits-info-value credits-info-url">www.elipse.it</span>
          </div>
        </div>

        {/* Project */}
        <div className="credits-card">
          <div className="credits-card-icon">🗺️</div>
          <h2 className="credits-card-title">Il progetto</h2>
          <p className="credits-card-desc">
            <strong>Fermopoint Control Tower</strong> è la piattaforma operativa
            per il monitoraggio in tempo reale della rete di punti di ritiro DPD
            Fermopoint. Permette la gestione di giri di consegna, spedizioni,
            eccezioni e filiali da un'unica interfaccia centralizzata.
          </p>
          <div className="credits-info-row">
            <span className="credits-info-label">Cliente</span>
            <span className="credits-info-value">BRT italia / Fermopoint</span>
          </div>
          <div className="credits-info-row">
            <span className="credits-info-label">Versione</span>
            <span className="credits-info-value">
              <span className="credits-version-inline">v{APP_VERSION}</span>
            </span>
          </div>
          <div className="credits-info-row">
            <span className="credits-info-label">Anno</span>
            <span className="credits-info-value">2025 – 2026</span>
          </div>
        </div>

        {/* Tech stack */}
        <div className="credits-card">
          <div className="credits-card-icon">⚙️</div>
          <h2 className="credits-card-title">Stack tecnologico</h2>
          <ul className="credits-tech-list">
            <li className="credits-tech-item">
              <span className="credits-tech-dot credits-tech-dot--react" />
              <span className="credits-tech-name">React</span>
              <span className="credits-tech-version">18.3</span>
            </li>
            <li className="credits-tech-item">
              <span className="credits-tech-dot credits-tech-dot--vite" />
              <span className="credits-tech-name">Vite</span>
              <span className="credits-tech-version">6.4</span>
            </li>
            <li className="credits-tech-item">
              <span className="credits-tech-dot credits-tech-dot--leaflet" />
              <span className="credits-tech-name">Leaflet</span>
              <span className="credits-tech-version">Mappe interattive</span>
            </li>
            <li className="credits-tech-item">
              <span className="credits-tech-dot credits-tech-dot--css" />
              <span className="credits-tech-name">CSS Custom Properties</span>
              <span className="credits-tech-version">Design system</span>
            </li>
          </ul>
        </div>

        {/* Grazie a */}
        <div className="credits-card">
          <div className="credits-card-icon">🙏</div>
          <h2 className="credits-card-title">Grazie a</h2>
          <ul className="credits-thanks-list">
            <li className="credits-thanks-item">
              <span className="credits-thanks-icon">⚛️</span>
              <div>
                <strong>React team</strong>
                <span className="credits-thanks-desc">La libreria UI che rende tutto questo possibile</span>
              </div>
            </li>
            <li className="credits-thanks-item">
              <span className="credits-thanks-icon">🗺️</span>
              <div>
                <strong>OpenStreetMap contributors</strong>
                <span className="credits-thanks-desc">Dati cartografici aperti e aggiornati</span>
              </div>
            </li>
            <li className="credits-thanks-item">
              <span className="credits-thanks-icon">📍</span>
              <div>
                <strong>Leaflet.js</strong>
                <span className="credits-thanks-desc">Libreria mappe leggera e potente</span>
              </div>
            </li>
            <li className="credits-thanks-item">
              <span className="credits-thanks-icon">✏️</span>
              <div>
                <strong>Lucide Icons</strong>
                <span className="credits-thanks-desc">Set di icone pulite e consistenti</span>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer */}
      <div className="credits-footer">
        <span className="credits-copyright">
          © 2016–2026 Elipse Srl. Tutti i diritti riservati.
        </span>
        <span className="credits-footer-sep">·</span>
        <span className="credits-footer-note">
          Fermopoint Control Tower v{APP_VERSION}
        </span>
      </div>

    </div>
  )
}
