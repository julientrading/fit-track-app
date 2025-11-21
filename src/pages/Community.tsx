import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy,
  TrendingUp,
  Users,
  Dumbbell,
  Zap,
  Award,
  Crown,
} from 'lucide-react'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuthStore } from '@/stores/authStore'
import { getCommunityFeed, getLeaderboard } from '@/lib/database'

type LeaderboardPeriod = '7d' | '30d' | 'all'

interface CommunityWorkout {
  id: string
  name: string
  completed_at: string
  total_sets: number
  total_volume: number
  xp_earned: number
  personal_records_count: number
  user: {
    id: string
    full_name: string
    xp: number
    level: number
  }
}

interface LeaderboardUser {
  id: string
  full_name: string
  xp: number
  level: number
  workoutCount: number
}

export function Community() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed')
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('30d')
  const [feed, setFeed] = useState<CommunityWorkout[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load community data
  useEffect(() => {
    if (!userProfile) {
      setIsLoading(false)
      return
    }

    // Reset flags when component mounts/remounts
    hasInitialized.current = false
    isInitializing.current = false

    const loadCommunityData = async () => {
      // Guard against double loading (React Strict Mode)
      if (isInitializing.current) {
        console.log('[Community] Already loading, skipping...')
        return
      }

      try {
        isInitializing.current = true
        console.log('[Community] Loading community data...')
        setIsLoading(true)

        const [feedData, leaderboardData] = await Promise.all([
          getCommunityFeed(20),
          getLeaderboard(leaderboardPeriod, 10),
        ])

        setFeed(feedData as CommunityWorkout[])
        setLeaderboard(leaderboardData as LeaderboardUser[])

        console.log('[Community] Loaded', feedData.length, 'feed items and', leaderboardData.length, 'leaderboard users')

        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[Community] Failed to load community data:', error)
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadCommunityData()
  }, [userProfile, leaderboardPeriod])

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Get medal color for ranking
  const getMedalColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-500' // Gold
    if (rank === 1) return 'text-gray-400' // Silver
    if (rank === 2) return 'text-orange-600' // Bronze
    return 'text-gray-300'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Community</h1>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition ${
                activeTab === 'feed'
                  ? 'bg-white text-primary-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Activity Feed
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-4 py-2 rounded-xl font-semibold text-sm transition ${
                activeTab === 'leaderboard'
                  ? 'bg-white text-primary-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {activeTab === 'feed' ? (
          /* Activity Feed */
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Workouts</h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border-2 border-gray-200 p-4 animate-pulse"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : feed.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h3>
                <p className="text-gray-600">
                  Be the first to complete a workout and inspire others!
                </p>
              </div>
            ) : (
              feed.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => navigate(`/workout-detail/${workout.id}`)}
                  className="w-full bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-primary-purple-400 hover:bg-purple-50 transition text-left"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* User Avatar */}
                    <div className="bg-gradient-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {workout.user.full_name.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{workout.user.full_name}</h3>
                        <span className="text-xs text-gray-500">• Level {workout.user.level}</span>
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(workout.completed_at)}</p>
                    </div>
                  </div>

                  {/* Workout Info */}
                  <div className="ml-15 mb-3">
                    <p className="text-gray-900">
                      Completed <span className="font-semibold">{workout.name}</span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="ml-15 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      <span>{workout.total_sets} sets</span>
                    </div>
                    {workout.total_volume > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {(workout.total_volume / 1000).toFixed(1)}k{' '}
                          {userProfile?.preferred_unit || 'lbs'}
                        </span>
                      </div>
                    )}
                    {workout.xp_earned > 0 && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-orange-700">{workout.xp_earned} XP</span>
                      </div>
                    )}
                    {workout.personal_records_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-700">
                          {workout.personal_records_count} PR{workout.personal_records_count > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Leaderboard */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Top Athletes</h2>

              {/* Period Selector */}
              <select
                value={leaderboardPeriod}
                onChange={(e) => setLeaderboardPeriod(e.target.value as LeaderboardPeriod)}
                className="px-3 py-1.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-primary-purple-400 transition"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border-2 border-gray-200 p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Rankings Yet</h3>
                <p className="text-gray-600">
                  Complete workouts to earn XP and climb the leaderboard!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, index) => {
                  const isCurrentUser = user.id === userProfile?.id

                  return (
                    <div
                      key={user.id}
                      className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-4 ${
                        isCurrentUser
                          ? 'border-primary-purple-400 bg-purple-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8 flex-shrink-0">
                        {index < 3 ? (
                          <Crown className={`w-6 h-6 ${getMedalColor(index)}`} />
                        ) : (
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* User Avatar */}
                      <div
                        className={`rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                          isCurrentUser ? 'bg-gradient-primary' : 'bg-gray-400'
                        }`}
                      >
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 truncate">
                            {user.full_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-primary-purple-600">(You)</span>
                            )}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Level {user.level} • {user.workoutCount} workout{user.workoutCount !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* XP */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Zap className="w-5 h-5 text-orange-600" />
                          <span className="text-xl font-black text-gray-900">
                            {user.xp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">XP</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation active="community" />
    </div>
  )
}
