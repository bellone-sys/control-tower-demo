import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, componentStack: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    const stack = info?.componentStack ?? '(nessuno)'
    console.group('%c[ErrorBoundary] CRASH WIZARD', 'color:red;font-weight:bold;font-size:14px')
    console.error('Errore:', error)
    console.error('Messaggio:', error?.message)
    console.error('Stack JS:\n', error?.stack)
    console.error('Component stack React:\n', stack)
    console.groupEnd()
    this.setState({ componentStack: stack })
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const { error, componentStack } = this.state
      return (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(65,64,66,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: 28,
            width: '100%', maxWidth: 780, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            fontFamily: 'monospace',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#DC0032', marginBottom: 4 }}>
              ⚠ Crash Wizard — Debug Log
            </div>
            <div style={{ fontSize: 12, color: '#808285', marginBottom: 16 }}>
              Fai uno screenshot di questa pagina e inviala per il debug.
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#414042', marginBottom: 4 }}>Messaggio</div>
              <pre style={{ background: '#fff0f3', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: '#c0392b', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                {error?.message ?? '(nessun messaggio)'}
              </pre>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#414042', marginBottom: 4 }}>Stack JavaScript</div>
              <pre style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: 6, fontSize: 10, color: '#414042', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, maxHeight: 200, overflow: 'auto' }}>
                {error?.stack ?? '(nessuno)'}
              </pre>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#414042', marginBottom: 4 }}>Component Stack React</div>
              <pre style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: 6, fontSize: 10, color: '#414042', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, maxHeight: 200, overflow: 'auto' }}>
                {componentStack ?? '(nessuno)'}
              </pre>
            </div>

            <button
              style={{
                padding: '9px 24px', background: '#DC0032', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                fontWeight: 700, fontSize: 13, fontFamily: 'sans-serif',
              }}
              onClick={() => this.setState({ hasError: false, error: null, componentStack: null })}
            >
              Chiudi e riprova
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
