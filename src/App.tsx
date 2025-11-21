import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './stores/authStore'
import { usePageVisibility } from './hooks/usePageVisibility'

function App() {
  const { initialize, refreshSession } = useAuthStore()

  // Initialize auth when app loads (only once)
  useEffect(() => {
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh session when tab becomes visible
  // This fixes the issue where content doesn't load after switching apps
  usePageVisibility(() => {
    console.log('[App] Tab became visible, refreshing session...')
    refreshSession()
  })

  return <RouterProvider router={router} />
}

export default App
