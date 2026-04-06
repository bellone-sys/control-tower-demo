import { useEffect } from 'react'
import EntityHistory from './EntityHistory'
import './AuditPanel.css'

/**
 * AuditPanel — slide-in right panel showing the audit trail for any entity.
 *
 * Props:
 *   open        {boolean}
 *   onClose     {function}
 *   entityType  {'pudo'|'giro'|'filiale'|'scenario'}
 *   entityId    {string}
 *   entityLabel {string}  — shown in the panel header
 */
export default function AuditPanel({ open, onClose, entityType, entityId, entityLabel }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`audit-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`audit-panel${open ? ' open' : ''}`}
        aria-label="Cronologia modifiche"
        aria-hidden={!open}
        role="complementary"
      >
        <div className="audit-panel-header">
          <div className="audit-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Cronologia</span>
          </div>
          {entityLabel && (
            <span className="audit-panel-entity">{entityLabel}</span>
          )}
          <button className="audit-panel-close" onClick={onClose} aria-label="Chiudi pannello">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="audit-panel-body">
          {open && (
            <EntityHistory entityType={entityType} entityId={entityId} />
          )}
        </div>
      </aside>
    </>
  )
}
