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
    let timeoutId: NodeJS.Timeout

    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)

      if (visible && onVisibleRef.current) {
        // Debounce to prevent multiple rapid calls
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          onVisibleRef.current?.()
        }, 100)
      } else if (!visible && onHiddenRef.current) {
        onHiddenRef.current()
      }
    }

    // Only use visibilitychange - remove focus listener to avoid duplicates
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Empty deps - callbacks accessed via refs

  return isVisible
}
