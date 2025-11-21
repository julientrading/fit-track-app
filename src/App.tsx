import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './stores/authStore'
import { usePageVisibility } from './hooks/usePageVisibility'

function App() {
  console.log('======================================')
  console.log('VERSION 2024-11-21-06:00 - NEW CODE LOADED!!!')
  console.log('======================================')
  const { initialize, refreshSession } = useAuthStore()

  // Initialize auth when app loads (only once)
  useEffect(() => {
    console.log('>>>>>> APP USEEFFECT RUNNING <<<<<<')
    initialize()
    // Show alert to PROVE new code is loading
    alert('NEW CODE IS LOADED! Version 06:30')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Refresh session when tab becomes visible
  // This fixes the issue where content doesn't load after switching apps
  console.log('>>>>>> CALLING usePageVisibility <<<<<<')
  usePageVisibility(() => {
    console.log('[App] Tab became visible, refreshing session...')
    refreshSession()
  })
  console.log('>>>>>> usePageVisibility SETUP COMPLETE <<<<<<')

  return <RouterProvider router={router} />
}

export default App
