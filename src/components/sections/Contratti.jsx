/**
 * Contratti (Contract Management)
 * v0.9.0: Stub placeholder
 * v0.10.0: Full implementation with 3 tabs (Noleggio Mezzi, Corrieri, Operatori Handling)
 */

export default function Contratti() {
  return (
    <section className="contratti-section">
      <div className="section-header">
        <h1>📋 Contratti</h1>
        <p style={{ color: 'var(--fp-gray-mid)', fontSize: 13, marginTop: 8 }}>
          Gestione contrattuale con fornitori, corrieri e operatori logistici.
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        background: 'rgba(220, 0, 50, 0.04)',
        borderRadius: 8,
        border: '1px dashed var(--fp-gray-light)',
        padding: 40,
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
          <h2 style={{ color: 'var(--fp-charcoal)', marginBottom: 8 }}>Sezione in Sviluppo</h2>
          <p style={{ color: 'var(--fp-gray-mid)', fontSize: 13 }}>
            La gestione dei contratti sarà disponibile in <strong>v0.10.0</strong> con:
          </p>
          <ul style={{
            marginTop: 12,
            listStyle: 'none',
            color: 'var(--fp-gray-mid)',
            fontSize: 13,
            lineHeight: 1.8,
          }}>
            <li>✓ Noleggio mezzi</li>
            <li>✓ Corrieri dipendenti/esterni</li>
            <li>✓ Operatori handling</li>
            <li>✓ Upload documenti con estrazione AI</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
