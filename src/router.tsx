import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/Home'
import { WorkoutExecution } from './pages/WorkoutExecution'
import { WorkoutComplete } from './pages/WorkoutComplete'
import { WorkoutDetail } from './pages/WorkoutDetail'
import { Profile } from './pages/Profile'
import { EditProfile } from './pages/EditProfile'
import { BodyMetrics } from './pages/BodyMetrics'
import { Settings } from './pages/Settings'
import { ExerciseLibrary } from './pages/ExerciseLibrary'
import { ExerciseDetail } from './pages/ExerciseDetail'
import { Progress } from './pages/Progress'
import { SeedExercises } from './pages/SeedExercises'
import { Community } from './pages/Community'
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
  {
    path: '/workout-detail/:workoutId',
    element: (
      <ProtectedRoute>
        <WorkoutDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/edit',
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/body-metrics',
    element: (
      <ProtectedRoute>
        <BodyMetrics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/library',
    element: (
      <ProtectedRoute>
        <ExerciseLibrary />
      </ProtectedRoute>
    ),
  },
  {
    path: '/library/exercise/:id',
    element: (
      <ProtectedRoute>
        <ExerciseDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/progress',
    element: (
      <ProtectedRoute>
        <Progress />
      </ProtectedRoute>
    ),
  },
  {
    path: '/seed-exercises',
    element: (
      <ProtectedRoute>
        <SeedExercises />
      </ProtectedRoute>
    ),
  },
  {
    path: '/community',
    element: (
      <ProtectedRoute>
        <Community />
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
