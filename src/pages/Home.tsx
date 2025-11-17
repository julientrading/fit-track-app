import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { NextWorkoutCard } from '@/components/features/workout/NextWorkoutCard'
import { QuickStats } from '@/components/features/workout/QuickStats'
import { RecentActivity } from '@/components/features/workout/RecentActivity'
import { LatestAchievement } from '@/components/features/workout/LatestAchievement'
import {
  mockUser,
  mockNextWorkout,
  mockWeeklyStats,
  mockRecentActivity,
  mockLatestAchievement,
} from '@/lib/mockData'

export const Home = () => {
  const handleStartWorkout = () => {
    alert('Starting workout! (This will navigate to workout execution page)')
  }

  const handleViewAllActivity = () => {
    alert('View all activity! (This will navigate to history page)')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <DashboardHeader userName={mockUser.name} streak={mockUser.streak} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 pb-24">
        {/* Next Workout Card */}
        <NextWorkoutCard
          name={mockNextWorkout.name}
          estimatedDuration={mockNextWorkout.estimatedDuration}
          currentDay={mockNextWorkout.currentDay}
          totalDays={mockNextWorkout.totalDays}
          allExercises={mockNextWorkout.allExercises}
          onStartWorkout={handleStartWorkout}
        />

        {/* Quick Stats */}
        <QuickStats
          workouts={mockWeeklyStats.workouts}
          workoutsChange={mockWeeklyStats.workoutsChange}
          totalTime={mockWeeklyStats.totalTime}
          avgTime={mockWeeklyStats.avgTime}
          personalRecords={mockWeeklyStats.personalRecords}
          xpEarned={mockWeeklyStats.xpEarned}
          level={mockUser.level}
          levelProgress={mockWeeklyStats.levelProgress}
        />

        {/* Recent Activity */}
        <RecentActivity activities={mockRecentActivity} onViewAll={handleViewAllActivity} />

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
