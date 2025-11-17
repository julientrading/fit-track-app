import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/Home'
import { WorkoutExecution } from './pages/WorkoutExecution'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/workout/:id',
    element: <WorkoutExecution />,
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
