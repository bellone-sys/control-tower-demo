import { APP_VERSION } from '../version'
import TutorialOverlay from '../components/tutorials/TutorialOverlay'
import './Landing.css'

export default function Landing({ isAuthenticated, onGoToDashboard, onGoToLogin }) {
  return (
    <div className="landing-page">
      <TutorialOverlay
        id="landing_page"
        title="📍 Benvenuto in Fermopoint"
        description="Fermopoint Control Tower è il tuo sistema completo di gestione della logistica con raccolta DPD. Accedi per iniziare."
        position="bottom-right"
      />
      {/* Background decorativo */}
      <div className="landing-bg" />

      {/* Navbar top */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <svg viewBox="0 0 160 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" rx="4" fill="#DC0032"/>
            <text x="22" y="30" textAnchor="middle" fontSize="18" fontFamily="Inter,sans-serif" fontWeight="700" fill="white">FP</text>
            <text x="56" y="18" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="300" fill="rgba(255,255,255,0.6)" letterSpacing="2">FERMOPOINT</text>
            <text x="56" y="34" fontSize="15" fontFamily="Inter,sans-serif" fontWeight="600" fill="white" letterSpacing="0.5">Control Tower</text>
          </svg>
        </div>
        <div className="landing-nav-right">
          <span className="landing-version">v{APP_VERSION}</span>
          {isAuthenticated ? (
            <button className="btn-landing-primary" onClick={onGoToDashboard}>
              Vai alla Dashboard →
            </button>
          ) : (
            <button className="btn-landing-outline" onClick={onGoToLogin}>
              Accedi
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-eyebrow">DPD Italy — Piattaforma operativa</div>
          <h1 className="landing-headline">
            Gestisci la rete<br />
            <span className="landing-highlight">Fermopoint</span><br />
            in tempo reale
          </h1>
          <p className="landing-sub">
            Monitor unificato per spedizioni, giri, flotta, punti di ritiro e filiali.
            Dati aggiornati, notifiche istantanee, reportistica avanzata.
          </p>

          <div className="landing-cta-group">
            {isAuthenticated ? (
              <>
                <button className="btn-landing-primary btn-lg" onClick={onGoToDashboard}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Apri Dashboard
                </button>
                <span className="landing-session-hint">Sei già autenticato</span>
              </>
            ) : (
              <>
                <button className="btn-landing-primary btn-lg" onClick={onGoToLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Accedi al portale
                </button>
                <span className="landing-session-hint">SSO aziendale o email &amp; password</span>
              </>
            )}
          </div>
        </div>

        {/* Feature cards decorative */}
        <div className="landing-feature-grid">
          {[
            { icon: '📦', title: 'Spedizioni', desc: 'Traccia consegne e ritiri con filtri avanzati e import API/CSV' },
            { icon: '🗺️', title: 'Giri',        desc: 'Pianifica e monitora i percorsi di consegna sulla mappa' },
            { icon: '📍', title: 'PUDO',         desc: 'Gestisci la rete di punti di ritiro su tutto il territorio' },
            { icon: '🚐', title: 'Flotta',       desc: 'Stato dei mezzi, conducenti e disponibilità in tempo reale' },
            { icon: '⚠️', title: 'Eccezioni',   desc: 'Alert e anomalie gestibili direttamente dal pannello' },
            { icon: '📊', title: 'Report',       desc: 'KPI e metriche per prendere decisioni basate sui dati' },
          ].map(f => (
            <div key={f.title} className="landing-feature-card">
              <div className="lfc-icon">{f.icon}</div>
              <div className="lfc-title">{f.title}</div>
              <div className="lfc-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        © 2026 DPD Italy · Fermopoint Control Tower v{APP_VERSION} · Demo
      </footer>
    </div>
  )
}
