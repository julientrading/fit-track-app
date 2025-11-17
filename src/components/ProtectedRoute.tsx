import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authUser, isInitialized, error } = useAuthStore()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeoutReached(true)
    }, 10000) // 10 second timeout (increased for slower connections)

    return () => clearTimeout(timeout)
  }, [])

  // Show loading state while auth is initializing
  if (!isInitialized && !timeoutReached) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          {error && (
            <p className="text-red-600 mt-4 text-sm">Error: {error}</p>
          )}
        </div>
      </div>
    )
  }

  // If timeout reached and still not initialized, redirect to login
  if (timeoutReached && !isInitialized) {
    console.warn('[ProtectedRoute] Auth initialization timed out after 10s, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Redirect to login if not authenticated
  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  // Render children if authenticated
  return <>{children}</>
}
