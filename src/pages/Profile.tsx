import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, LogOut, Award, TrendingUp, Flame, Dumbbell, Edit2, Ruler, Plus, ChevronRight } from 'lucide-react'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuthStore } from '@/stores/authStore'
import { getWeeklyStats, getUserPRs, getLatestBodyMeasurements } from '@/lib/database'
import type { BodyMeasurement } from '@/types/database'

// Measurement type labels
const MEASUREMENT_LABELS: Record<BodyMeasurement['measurement_type'], string> = {
  weight: 'Weight',
  neck: 'Neck',
  shoulders: 'Shoulders',
  chest: 'Chest',
  biceps_left: 'Biceps (L)',
  biceps_right: 'Biceps (R)',
  forearms_left: 'Forearms (L)',
  forearms_right: 'Forearms (R)',
  waist: 'Waist',
  hips: 'Hips',
  thighs_left: 'Thighs (L)',
  thighs_right: 'Thighs (R)',
  calves_left: 'Calves (L)',
  calves_right: 'Calves (R)',
  body_fat_percentage: 'Body Fat %',
}

export function Profile() {
  const navigate = useNavigate()
  const { authUser, userProfile, logout } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [prs, setPrs] = useState<any[]>([])
  const [bodyMetrics, setBodyMetrics] = useState<BodyMeasurement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userProfile) return

    const loadStats = async () => {
      try {
        setIsLoading(true)
        const [weeklyStats, userPRs, latestMeasurements] = await Promise.all([
          getWeeklyStats(userProfile.id),
          getUserPRs(userProfile.id),
          getLatestBodyMeasurements(userProfile.id, 3),
        ])
        setStats(weeklyStats)
        setPrs(userPRs)
        setBodyMetrics(latestMeasurements)
      } catch (error) {
        console.error('[Profile] Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [userProfile])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>

          {/* User Info Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-primary-purple-600">
                  {getInitials(userProfile.full_name || 'User')}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{userProfile.full_name}</h2>
                <p className="text-white/80 text-sm mb-2">{authUser?.email}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold">Level {userProfile.level}</span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => navigate('/profile/edit')}
                className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border-2 border-gray-200 animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Total Workouts */}
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="w-6 h-6 text-primary-purple-600" />
              </div>
              <p className="text-3xl font-black text-gray-900 mb-1">
                {stats?.totalWorkouts || 0}
              </p>
              <p className="text-sm text-gray-600 font-semibold">Total Workouts</p>
            </div>

            {/* Total XP */}
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-black text-gray-900 mb-1">
                {userProfile.xp?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 font-semibold">Total XP</p>
            </div>

            {/* Personal Records */}
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-3xl font-black text-gray-900 mb-1">{prs.length}</p>
              <p className="text-sm text-gray-600 font-semibold">Personal Records</p>
            </div>

            {/* Current Streak */}
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-3xl font-black text-gray-900 mb-1">
                {userProfile.current_streak || 0}
              </p>
              <p className="text-sm text-gray-600 font-semibold">Day Streak</p>
            </div>
          </div>
        )}

        {/* Body Metrics Widget */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Body Metrics</h3>
            <button
              onClick={() => navigate('/profile/body-metrics')}
              className="text-sm font-semibold text-primary-purple-600 hover:text-primary-purple-700 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ) : bodyMetrics.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 text-center">
              <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Track Your Progress</h4>
              <p className="text-sm text-gray-600 mb-4">
                Log body measurements to track changes over time
              </p>
              <button
                onClick={() => navigate('/profile/body-metrics')}
                className="bg-gradient-primary text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Measurement
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
              <div className="space-y-3">
                {bodyMetrics.map((metric) => {
                  // Calculate change (this is simplified - in a real app you'd compare to previous)
                  const formatValue = `${metric.value} ${metric.unit}`

                  return (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {MEASUREMENT_LABELS[metric.measurement_type]}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(metric.measured_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">{formatValue}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => navigate('/profile/body-metrics')}
                className="w-full mt-4 bg-purple-50 text-primary-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-100 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Log Measurement
              </button>
            </div>
          )}
        </div>

        {/* Settings & Actions */}
        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Settings & More</h3>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-primary-purple-400 hover:bg-purple-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-xl p-2">
                <Settings className="w-5 h-5 text-primary-purple-600" />
              </div>
              <span className="font-semibold text-gray-900">Settings</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-white border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between hover:border-red-400 hover:bg-red-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-xl p-2">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-semibold text-red-600">Log Out</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
