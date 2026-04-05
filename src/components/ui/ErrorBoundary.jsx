import { Component } from 'react'

/**
 * ErrorBoundary — cattura errori di rendering in un sottoalbero React.
 * Previene che un errore in un componente figlio propaghi all'intera app.
 *
 * Props:
 *   - children: contenuto da proteggere
 *   - fallback: nodo React alternativo da mostrare in caso di errore (opzionale)
 *   - onError: callback(error, info) opzionale
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          padding: 32, textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#414042' }}>
            Errore nel rendering
          </div>
          <div style={{ fontSize: 13, color: '#808285', maxWidth: 400 }}>
            {this.state.error?.message ?? 'Si è verificato un errore imprevisto.'}
          </div>
          <button
            style={{
              marginTop: 8, padding: '8px 20px',
              background: '#DC0032', color: '#fff',
              border: 'none', borderRadius: 6,
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Riprova
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
