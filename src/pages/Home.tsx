import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { NextWorkoutCard } from '@/components/features/workout/NextWorkoutCard'
import { QuickStats } from '@/components/features/workout/QuickStats'
import { RecentActivity } from '@/components/features/workout/RecentActivity'
import { LatestAchievement } from '@/components/features/workout/LatestAchievement'
import { useAuthStore } from '@/stores/authStore'
import {
  getActiveProgram,
  getWorkoutDaysByProgram,
  getWorkoutDayExercises,
  getRecentWorkouts,
  getWeeklyStats,
  getUserPRs,
} from '@/lib/database'
import {
  mockUser,
  mockNextWorkout,
  mockWeeklyStats,
  mockRecentActivity,
  mockLatestAchievement,
} from '@/lib/mockData'

export const Home = () => {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Ref to prevent double loading in React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [isLoading, setIsLoading] = useState(true)
  const [_activeProgram, setActiveProgram] = useState<any>(null)
  const [nextWorkout, setNextWorkout] = useState<any>(null)
  const [weeklyStats, setWeeklyStats] = useState<any>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [_personalRecords, setPersonalRecords] = useState<any[]>([])

  useEffect(() => {
    if (!userProfile) {
      console.log('[Home] No user profile, waiting...')
      setIsLoading(false)
      return
    }

    const loadDashboardData = async () => {
      // Guard against double loading (React Strict Mode)
      if (isInitializing.current || hasInitialized.current) {
        console.log('[Home] Dashboard already loading or loaded, skipping...')
        setIsLoading(false)
        return
      }

      try {
        isInitializing.current = true
        console.log('[Home] Loading dashboard data for user:', userProfile.id)
        setIsLoading(true)

        // Fetch all dashboard data in parallel
        const [program, stats, workouts, prs] = await Promise.all([
          getActiveProgram(userProfile.id),
          getWeeklyStats(userProfile.id),
          getRecentWorkouts(userProfile.id, 5),
          getUserPRs(userProfile.id),
        ])

        console.log('[Home] Dashboard data loaded:', { program, stats, workouts: workouts.length, prs: prs.length })

        setActiveProgram(program)
        setWeeklyStats(stats)
        setRecentWorkouts(workouts)
        setPersonalRecords(prs)

        // If user has an active program, fetch the next workout day
        if (program) {
          const workoutDays = await getWorkoutDaysByProgram(program.id)
          if (workoutDays.length > 0) {
            // Get the first workout day (in a real app, we'd track which day is next)
            const nextDay = workoutDays[0]
            const exercises = await getWorkoutDayExercises(nextDay.id)

            setNextWorkout({
              workoutDayId: nextDay.id,
              name: nextDay.name,
              estimatedDuration: exercises.length * 15, // Rough estimate: 15 min per exercise
              currentDay: nextDay.day_number,
              totalDays: workoutDays.length,
              allExercises: exercises.map((ex: any) => ({
                name: ex.exercise.name,
                sets: ex.sets.length,
                reps: ex.sets[0]?.targetReps || 10,
              })),
            })
          }
        }

        // Mark as initialized
        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[Home] Failed to load dashboard data:', error)
        isInitializing.current = false
      } finally {
        console.log('[Home] Setting isLoading to false')
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [userProfile])

  const handleStartWorkout = () => {
    if (nextWorkout) {
      navigate(`/workout/${nextWorkout.workoutDayId}`)
    } else {
      // No active program, redirect to create program
      alert('Please create a program first!')
      // navigate('/program/create')
    }
  }

  const handleViewAllActivity = () => {
    alert('View all activity! (This will navigate to history page)')
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Prepare data with fallbacks to mock data
  const displayNextWorkout = nextWorkout || mockNextWorkout
  const displayStats = weeklyStats || mockWeeklyStats
  const displayUser = userProfile || mockUser

  // Transform recent workouts for the RecentActivity component
  const recentActivities = recentWorkouts.length > 0
    ? recentWorkouts.map(workout => {
        const startDate = new Date(workout.started_at)
        const today = new Date()
        const daysAgo = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        return {
          id: workout.id,
          name: workout.name,
          daysAgo: daysAgo,
          duration: Math.round((workout.duration_seconds || 0) / 60), // Convert seconds to minutes
          xp: workout.xp_earned,
          achievements: workout.personal_records_count > 0
            ? [{ type: 'pr' as const, name: `${workout.personal_records_count} PR${workout.personal_records_count > 1 ? 's' : ''}` }]
            : [],
        }
      })
    : mockRecentActivity

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <DashboardHeader
        userName={(displayUser as any).full_name || (displayUser as any).name}
        streak={(displayUser as any).current_streak || (displayUser as any).streak}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* Next Workout Card or Create Program prompt */}
        {nextWorkout ? (
          <NextWorkoutCard
            name={displayNextWorkout.name}
            estimatedDuration={displayNextWorkout.estimatedDuration}
            currentDay={displayNextWorkout.currentDay}
            totalDays={displayNextWorkout.totalDays}
            allExercises={displayNextWorkout.allExercises}
            onStartWorkout={handleStartWorkout}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Active Program
            </h3>
            <p className="text-gray-600 mb-4">
              Create a workout program to get started with your fitness journey!
            </p>
            <button
              onClick={() => navigate('/program/create')}
              className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition"
            >
              Create Program
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <QuickStats
          workouts={displayStats.totalWorkouts || displayStats.workouts}
          workoutsChange={mockWeeklyStats.workoutsChange}
          totalTime={displayStats.totalTime}
          avgTime={displayStats.totalWorkouts > 0 ? Math.round(displayStats.totalTime / displayStats.totalWorkouts).toString() : '0'}
          personalRecords={displayStats.totalPRs || displayStats.personalRecords}
          xpEarned={mockWeeklyStats.xpEarned}
          level={displayUser.level}
          levelProgress={mockWeeklyStats.levelProgress}
        />

        {/* Recent Activity */}
        <RecentActivity activities={recentActivities} onViewAll={handleViewAllActivity} />

        {/* Latest Achievement */}
        <LatestAchievement
          emoji={mockLatestAchievement.emoji}
          name={mockLatestAchievement.name}
          description={mockLatestAchievement.description}
          nextAchievement={mockLatestAchievement.nextAchievement}
          progress={mockLatestAchievement.progress}
          goal={mockLatestAchievement.goal}
          progressPercentage={mockLatestAchievement.progressPercentage}
        />
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation active="home" />
    </div>
  )
}
