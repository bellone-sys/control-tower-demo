import './ProgressToast.css'

export default function ProgressToast({ job }) {
  if (!job) return null

  const { label, progress, status, detail } = job

  const pct = Math.max(0, Math.min(100, progress ?? 0))

  return (
    <div className="progress-toast">
      <div className="progress-toast-header">
        <span className="progress-toast-icon">📥</span>
        <span className="progress-toast-label">{label}</span>
        <span className="progress-toast-pct">{pct}%</span>
      </div>

      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill progress-bar-fill--${status}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="progress-toast-status">
        {status === 'running' && (
          <span style={{ color: 'var(--fp-gray-mid, #7a7a7a)' }}>⏳ Elaborazione in corso…</span>
        )}
        {status === 'done' && (
          <span style={{ color: '#2E7D32' }}>✓ Importazione completata</span>
        )}
        {status === 'error' && (
          <span style={{ color: '#DC0032' }}>✗ Si è verificato un errore</span>
        )}
      </div>

      {detail && (
        <div className="progress-toast-detail">{detail}</div>
      )}
    </div>
  )
}
