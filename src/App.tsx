import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './stores/authStore'

function App() {
  const { initialize } = useAuthStore()

  // Initialize auth when app loads
  useEffect(() => {
    initialize()
  }, [initialize])

  return <RouterProvider router={router} />
}

export default App
