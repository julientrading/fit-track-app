import { useEffect, useState, useRef } from 'react'

/**
 * Custom hook to detect when the browser tab becomes visible/hidden
 * Useful for refreshing data when user returns to the app
 */
export function usePageVisibility(onVisible?: () => void, onHidden?: () => void) {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  // Use refs to store callbacks to avoid recreating event listeners
  const onVisibleRef = useRef(onVisible)
  const onHiddenRef = useRef(onHidden)

  // Update refs when callbacks change
  useEffect(() => {
    onVisibleRef.current = onVisible
    onHiddenRef.current = onHidden
  }, [onVisible, onHidden])

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)

      if (visible && onVisibleRef.current) {
        onVisibleRef.current()
      } else if (!visible && onHiddenRef.current) {
        onHiddenRef.current()
      }
    }

    const handleFocus = () => {
      if (!document.hidden && onVisibleRef.current) {
        onVisibleRef.current()
      }
    }

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also listen for focus events as a fallback
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, []) // Empty deps - callbacks accessed via refs

  return isVisible
}
