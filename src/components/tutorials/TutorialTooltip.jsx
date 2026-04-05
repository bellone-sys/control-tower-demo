import { useState, useRef, useEffect } from 'react'
import { useTutorial } from '../../contexts/TutorialContext'
import './TutorialTooltip.css'

/**
 * TutorialTooltip - Wrapper that shows help tooltip for wrapped element
 * Shows on mount if tutorial enabled and not dismissed
 *
 * Props:
 *   - id: unique tutorial identifier (string)
 *   - title: tooltip title (optional)
 *   - content: tooltip content (string or React element)
 *   - placement: 'top' | 'bottom' | 'left' | 'right' (default: 'top')
 *   - children: the element to wrap
 */
export default function TutorialTooltip({
  id,
  title,
  content,
  placement = 'top',
  children,
}) {
  const { isTutorialVisible, dismissTutorial } = useTutorial()
  const [show, setShow] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (isTutorialVisible(id)) {
      const timer = setTimeout(() => setShow(true), 300)
      return () => clearTimeout(timer)
    }
  }, [id, isTutorialVisible])

  const handleDismiss = () => {
    setShow(false)
    dismissTutorial(id)
  }

  // Calculate tooltip position based on element rect
  const getTooltipStyle = () => {
    if (!ref.current || !show) return {}

    const rect = ref.current.getBoundingClientRect()
    const style = {}

    switch (placement) {
      case 'top':
        style.bottom = window.innerHeight - rect.top + 12
        style.left = rect.left + rect.width / 2
        style.transform = 'translateX(-50%)'
        break
      case 'bottom':
        style.top = rect.bottom + 12
        style.left = rect.left + rect.width / 2
        style.transform = 'translateX(-50%)'
        break
      case 'left':
        style.top = rect.top + rect.height / 2
        style.right = window.innerWidth - rect.left + 12
        style.transform = 'translateY(-50%)'
        break
      case 'right':
        style.top = rect.top + rect.height / 2
        style.left = rect.right + 12
        style.transform = 'translateY(-50%)'
        break
      default:
        break
    }

    return style
  }

  return (
    <>
      <div ref={ref} className="tutorial-tooltip-target">
        {children}
      </div>

      {show && (
        <div
          className={`tutorial-tooltip tutorial-tooltip-${placement} visible`}
          style={getTooltipStyle()}
        >
          <div className="tutorial-tooltip-inner">
            {title && <div className="tutorial-tooltip-title">{title}</div>}
            <div className="tutorial-tooltip-content">
              {typeof content === 'string' ? <p>{content}</p> : content}
            </div>
            <button
              className="tutorial-tooltip-dismiss"
              onClick={handleDismiss}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
