import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Dumbbell,
  Award,
  Zap,
  Calendar,
  Clock,
  BarChart3,
  ChevronRight,
} from 'lucide-react'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuthStore } from '@/stores/authStore'
import { getRecentWorkouts, getUserPRs } from '@/lib/database'
import type { WorkoutLog, PersonalRecord } from '@/types/database'

type TimePeriod = '7d' | '30d' | '90d' | 'all'

export function Progress() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load progress data
  useEffect(() => {
    if (!userProfile) {
      setIsLoading(false)
      return
    }

    const loadProgressData = async () => {
      // Guard against double loading
      if (isInitializing.current || hasInitialized.current) {
        console.log('[Progress] Already loading or loaded, skipping...')
        setIsLoading(false)
        return
      }

      try {
        isInitializing.current = true
        console.log('[Progress] Loading progress data for user:', userProfile.id)
        setIsLoading(true)

        const [workoutData, prData] = await Promise.all([
          getRecentWorkouts(userProfile.id, 50), // Get last 50 workouts
          getUserPRs(userProfile.id),
        ])

        setWorkouts(workoutData)
        setPrs(prData)

        console.log('[Progress] Loaded', workoutData.length, 'workouts and', prData.length, 'PRs')

        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[Progress] Failed to load progress data:', error)
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadProgressData()
  }, [userProfile])

  // Filter workouts by time period
  const getFilteredWorkouts = () => {
    const now = new Date()
    let cutoffDate: Date

    switch (timePeriod) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        return workouts
    }

    return workouts.filter((w) => new Date(w.started_at) >= cutoffDate)
  }

  // Calculate stats from filtered workouts
  const filteredWorkouts = getFilteredWorkouts()
  const completedWorkouts = filteredWorkouts.filter((w) => w.status === 'completed')

  const stats = {
    totalWorkouts: completedWorkouts.length,
    totalVolume: completedWorkouts.reduce((sum, w) => sum + (w.total_volume || 0), 0),
    totalSets: completedWorkouts.reduce((sum, w) => sum + (w.total_sets || 0), 0),
    totalXP: completedWorkouts.reduce((sum, w) => sum + (w.xp_earned || 0), 0),
    avgDuration: completedWorkouts.length > 0
      ? Math.round(
          completedWorkouts.reduce((sum, w) => sum + (w.duration_seconds || 0), 0) /
            completedWorkouts.length /
            60
        )
      : 0,
  }

  // Filter PRs by time period  const getFilteredPRs = () => {
    const now = new Date()
    let cutoffDate: Date

    switch (timePeriod) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        return prs
    }

    return prs.filter((pr) => new Date(pr.achieved_at) >= cutoffDate)
  }

  const filteredPRs = getFilteredPRs()

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Format duration helper
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0m'
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Progress</h1>

          {/* Time Period Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: '7d' as TimePeriod, label: '7 Days' },
              { value: '30d' as TimePeriod, label: '30 Days' },
              { value: '90d' as TimePeriod, label: '90 Days' },
              { value: 'all' as TimePeriod, label: 'All Time' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
                  timePeriod === period.value
                    ? 'bg-white text-primary-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-5 animate-pulse"
                >
                  <div className="h-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Total Workouts */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <Dumbbell className="w-6 h-6 text-primary-purple-600" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">{stats.totalWorkouts}</p>
                <p className="text-sm text-gray-600 font-semibold">Workouts</p>
              </div>

              {/* Total Volume */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">
                  {(stats.totalVolume / 1000).toFixed(1)}k
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  {userProfile?.preferred_unit || 'lbs'} Lifted
                </p>
              </div>

              {/* Personal Records */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">{filteredPRs.length}</p>
                <p className="text-sm text-gray-600 font-semibold">New PRs</p>
              </div>

              {/* Total XP */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">
                  {stats.totalXP.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-semibold">XP Earned</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent PRs */}
        {filteredPRs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Personal Records</h2>
              <span className="text-sm text-gray-600">{filteredPRs.length} PRs</span>
            </div>

            <div className="space-y-3">
              {filteredPRs.slice(0, 5).map((pr) => (
                <div
                  key={pr.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-4 flex items-center gap-4"
                >
                  <div className="bg-yellow-100 rounded-xl p-3 flex-shrink-0">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">
                      {(pr.exercise as any)?.name || 'Exercise'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pr.record_type === 'max_weight' && `${pr.weight} ${userProfile?.preferred_unit || 'lbs'}`}
                      {pr.record_type === 'max_reps' && `${pr.reps} reps`}
                      {pr.record_type === 'max_volume' && `${pr.volume?.toLocaleString()} ${userProfile?.preferred_unit || 'lbs'}`}
                      {pr.record_type === 'best_time' && `${pr.time_seconds}s`}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDate(pr.achieved_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workout History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Workout History</h2>
            <span className="text-sm text-gray-600">
              {completedWorkouts.length} workout{completedWorkouts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-4 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : completedWorkouts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Workouts Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete some workouts to see your progress here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedWorkouts.slice(0, 10).map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => navigate(`/workout/${workout.id}/complete`)}
                  className="w-full bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-primary-purple-400 hover:bg-purple-50 transition text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Date Badge */}
                    <div className="bg-purple-100 rounded-xl p-3 flex-shrink-0 text-center">
                      <Calendar className="w-5 h-5 text-primary-purple-600 mb-1 mx-auto" />
                      <p className="text-xs font-bold text-primary-purple-600">
                        {new Date(workout.started_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Workout Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{workout.name}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(workout.duration_seconds)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          <span>{workout.total_sets} sets</span>
                        </div>
                        {workout.xp_earned > 0 && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            <span>{workout.xp_earned} XP</span>
                          </div>
                        )}
                        {workout.personal_records_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span className="text-yellow-700 font-semibold">
                              {workout.personal_records_count} PR{workout.personal_records_count > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation active="progress" />
    </div>
  )
}
