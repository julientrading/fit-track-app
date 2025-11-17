import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/Home'
import { WorkoutExecution } from './pages/WorkoutExecution'
import { WorkoutComplete } from './pages/WorkoutComplete'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/workout/:id',
    element: <WorkoutExecution />,
  },
  {
    path: '/workout/:id/complete',
    element: <WorkoutComplete />,
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
