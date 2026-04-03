import { useState } from 'react'
import { DEMO_USERS } from '../data/stub'
import './Login.css'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('sso') // 'sso' | 'credentials'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [ssoLoading, setSsoLoading] = useState(false)

  function handleCredentials(e) {
    e.preventDefault()
    setError('')
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (user) {
      onLogin(user)
    } else {
      setError('Credenziali non valide. Prova con admin@fermopoint.it / demo1234')
    }
  }

  function handleSSO() {
    setSsoLoading(true)
    // Simula redirect SSO → ritorna dopo 1.5s
    setTimeout(() => {
      onLogin(DEMO_USERS[0])
    }, 1500)
  }

  return (
    <div className="login-page">
      <div className="login-bg" />

      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="fp-logo">
            <rect width="44" height="44" rx="4" fill="#DC0032"/>
            <text x="22" y="30" textAnchor="middle" fontSize="18" fontFamily="Inter,sans-serif" fontWeight="700" fill="white">FP</text>
            <text x="56" y="18" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="300" fill="#808285" letterSpacing="2">FERMOPOINT</text>
            <text x="56" y="34" fontSize="15" fontFamily="Inter,sans-serif" fontWeight="600" fill="#414042" letterSpacing="0.5">Control Tower</text>
          </svg>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'sso' ? 'active' : ''}`}
            onClick={() => { setMode('sso'); setError('') }}
          >
            SSO Aziendale
          </button>
          <button
            className={`login-tab ${mode === 'credentials' ? 'active' : ''}`}
            onClick={() => { setMode('credentials'); setError('') }}
          >
            Email & Password
          </button>
        </div>

        {mode === 'sso' && (
          <div className="login-sso">
            <p className="login-desc">
              Accedi con il tuo account aziendale DPD tramite Single Sign-On.
            </p>
            <button
              className="btn-primary btn-full"
              onClick={handleSSO}
              disabled={ssoLoading}
            >
              {ssoLoading ? (
                <span className="btn-loading">
                  <span className="spinner" /> Reindirizzamento in corso…
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Accedi con SSO
                </>
              )}
            </button>
            <p className="login-hint">
              Sarai reindirizzato all'Identity Provider aziendale.
            </p>
          </div>
        )}

        {mode === 'credentials' && (
          <form className="login-form" onSubmit={handleCredentials}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="nome@fermopoint.it"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="btn-primary btn-full">
              Accedi
            </button>
            <div className="login-demo-hint">
              <strong>Demo admin:</strong> admin@fermopoint.it / demo1234<br/>
              <strong>Demo user:</strong> l.ferri@fermopoint.it / demo1234
            </div>
          </form>
        )}
      </div>

      <p className="login-footer">
        © 2026 DPD Italy — Fermopoint Control Tower v2.1 · Demo
      </p>
    </div>
  )
}
