import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/Home'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  // Routes will be added progressively:
  // {
  //   path: '/workout/:id',
  //   element: <WorkoutExecution />,
  // },
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
