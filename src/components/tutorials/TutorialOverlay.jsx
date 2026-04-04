import { useState, useEffect } from 'react'
import { useTutorial } from '../../contexts/TutorialContext'
import './TutorialOverlay.css'

/**
 * TutorialOverlay - Non-intrusive overlay tutorial panel
 * Shows on mount if tutorial enabled and not dismissed
 *
 * Props:
 *   - id: unique tutorial identifier (string)
 *   - title: tutorial title (string)
 *   - description: tutorial content (string or React element)
 *   - position: 'top-right' | 'bottom-left' | 'bottom-right' (default: 'top-right')
 *   - autoCloseDuration: auto-close after N ms (0 = disabled, default: 0)
 */
export default function TutorialOverlay({
  id,
  title,
  description,
  position = 'top-right',
  autoCloseDuration = 0,
}) {
  const { isTutorialVisible, dismissTutorial } = useTutorial()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isTutorialVisible(id)) {
      // Delay show for smooth entrance
      const timer = setTimeout(() => setShow(true), 300)
      return () => clearTimeout(timer)
    }
  }, [id, isTutorialVisible])

  useEffect(() => {
    if (!show || autoCloseDuration <= 0) return
    const timer = setTimeout(() => {
      setShow(false)
      dismissTutorial(id)
    }, autoCloseDuration)
    return () => clearTimeout(timer)
  }, [show, autoCloseDuration, id, dismissTutorial])

  if (!show) return null

  const handleDismiss = () => {
    setShow(false)
    dismissTutorial(id)
  }

  return (
    <div className={`tutorial-overlay tutorial-overlay-${position} ${show ? 'visible' : ''}`}>
      <div className="tutorial-overlay-content">
        <div className="tutorial-overlay-header">
          <h3 className="tutorial-overlay-title">{title}</h3>
          <button
            className="tutorial-overlay-close"
            onClick={handleDismiss}
            aria-label="Chiudi tutorial"
          >
            ✕
          </button>
        </div>
        <div className="tutorial-overlay-body">
          {typeof description === 'string' ? (
            <p>{description}</p>
          ) : (
            description
          )}
        </div>
        <button
          className="tutorial-overlay-action"
          onClick={handleDismiss}
        >
          Ho capito
        </button>
      </div>
    </div>
  )
}
