import { useEffect, useState, useCallback } from 'react'

/**
 * Custom hook to detect when the browser tab becomes visible/hidden
 * Useful for refreshing data when user returns to the app
 */
export function usePageVisibility(onVisible?: () => void, onHidden?: () => void) {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  const handleVisibilityChange = useCallback(() => {
    const visible = !document.hidden

    console.log('[usePageVisibility] Tab visibility changed:', visible ? 'visible' : 'hidden')
    setIsVisible(visible)

    if (visible && onVisible) {
      console.log('[usePageVisibility] Triggering onVisible callback')
      onVisible()
    } else if (!visible && onHidden) {
      console.log('[usePageVisibility] Triggering onHidden callback')
      onHidden()
    }
  }, [onVisible, onHidden])

  useEffect(() => {
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also listen for focus events as a fallback
    window.addEventListener('focus', () => {
      if (document.hidden === false && onVisible) {
        console.log('[usePageVisibility] Window focused, triggering onVisible')
        onVisible()
      }
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    }
  }, [handleVisibilityChange, onVisible])

  return isVisible
}
