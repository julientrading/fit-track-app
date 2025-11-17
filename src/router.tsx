import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/Home'
import { WorkoutExecution } from './pages/WorkoutExecution'
import { WorkoutComplete } from './pages/WorkoutComplete'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { ProtectedRoute } from './components/ProtectedRoute'

export const router = createBrowserRouter([
  // Auth routes (public)
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  // Protected routes (require authentication)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout/:id',
    element: (
      <ProtectedRoute>
        <WorkoutExecution />
      </ProtectedRoute>
    ),
  },
  {
    path: '/workout/:id/complete',
    element: (
      <ProtectedRoute>
        <WorkoutComplete />
      </ProtectedRoute>
    ),
  },
  // Routes will be added progressively:
  // {
  //   path: '/program/create',
  //   element: <ProgramCreation />,
  // },
  // {
  //   path: '/library/workouts',
  //   element: <WorkoutLibrary />,
  // },
  // {
  //   path: '/progress',
  //   element: <ProgressDashboard />,
  // },
  // etc...
])
