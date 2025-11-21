import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './stores/authStore'

function App() {
  const { initialize } = useAuthStore()

  // Initialize auth when app loads (only once)
  useEffect(() => {
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <RouterProvider router={router} />
}

export default App
