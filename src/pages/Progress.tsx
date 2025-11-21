import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Award,
  Zap,
  Calendar,
  Clock,
  BarChart3,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuthStore } from '@/stores/authStore'
import {
  getUserPrograms,
  getWorkoutLogsByProgram,
  getUserPRs,
  getExercisePerformanceHistory,
  getAllAvailableExercises,
  type ExercisePerformanceData,
} from '@/lib/database'
import type { WorkoutLog, PersonalRecord, Program, Exercise } from '@/types/database'

type TimePeriod = '7d' | '30d' | '90d' | 'all'
type ExerciseFilter = 'all' | string // 'all' or specific exercise ID

export function Progress() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  // State
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [performanceData, setPerformanceData] = useState<ExercisePerformanceData[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showProgramDropdown, setShowProgramDropdown] = useState(false)
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false)

  // Load initial data
  useEffect(() => {
    if (!userProfile) {
      setIsLoading(false)
      return
    }

    const loadInitialData = async () => {
      // Guard against double loading
      if (isInitializing.current || hasInitialized.current) {
        console.log('[Progress] Already loading or loaded, skipping...')
        setIsLoading(false)
        return
      }

      try {
        isInitializing.current = true
        console.log('[Progress] Loading initial data for user:', userProfile.id)
        setIsLoading(true)

        const [programsData, prData, exercisesData] = await Promise.all([
          getUserPrograms(userProfile.id),
          getUserPRs(userProfile.id),
          getAllAvailableExercises(userProfile.id),
        ])

        setPrograms(programsData)
        setPrs(prData)
        setExercises(exercisesData)

        // Auto-select active program
        const activeProgram = programsData.find((p) => p.is_active)
        if (activeProgram) {
          setSelectedProgram(activeProgram.id)
        } else if (programsData.length > 0) {
          setSelectedProgram(programsData[0].id)
        }

        console.log('[Progress] Loaded', programsData.length, 'programs and', prData.length, 'PRs')

        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[Progress] Failed to load initial data:', error)
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [userProfile])

  // Load program-specific data when program changes
  useEffect(() => {
    if (!userProfile || !selectedProgram) return

    const loadProgramData = async () => {
      try {
        console.log('[Progress] Loading data for program:', selectedProgram)

        const exerciseId = exerciseFilter === 'all' ? null : exerciseFilter

        const [workoutData, performanceHistory] = await Promise.all([
          getWorkoutLogsByProgram(userProfile.id, selectedProgram, 100),
          getExercisePerformanceHistory(userProfile.id, selectedProgram, exerciseId, 100),
        ])

        setWorkouts(workoutData)
        setPerformanceData(performanceHistory)

        console.log(
          '[Progress] Loaded',
          workoutData.length,
          'workouts and',
          performanceHistory.length,
          'performance records'
        )
      } catch (error) {
        console.error('[Progress] Failed to load program data:', error)
      }
    }

    loadProgramData()
  }, [userProfile, selectedProgram, exerciseFilter])

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

  // Filter performance data by time period
  const getFilteredPerformanceData = () => {
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
        return performanceData
    }

    return performanceData.filter((d) => new Date(d.workout_date) >= cutoffDate)
  }

  // Calculate stats from filtered workouts
  const filteredWorkouts = getFilteredWorkouts()
  const completedWorkouts = filteredWorkouts.filter((w) => w.status === 'completed')
  const filteredPerformanceData = getFilteredPerformanceData()

  const stats = {
    totalWorkouts: completedWorkouts.length,
    totalVolume: completedWorkouts.reduce((sum, w) => sum + (w.total_volume || 0), 0),
    totalSets: completedWorkouts.reduce((sum, w) => sum + (w.total_sets || 0), 0),
    totalXP: completedWorkouts.reduce((sum, w) => sum + (w.xp_earned || 0), 0),
  }

  // Calculate trend for a metric
  const calculateTrend = (data: number[]): 'up' | 'down' | 'neutral' => {
    if (data.length < 2) return 'neutral'

    const firstHalf = data.slice(0, Math.floor(data.length / 2))
    const secondHalf = data.slice(Math.floor(data.length / 2))

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100

    if (percentChange > 5) return 'up'
    if (percentChange < -5) return 'down'
    return 'neutral'
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (filteredPerformanceData.length === 0) return []

    // Group by exercise if showing all exercises
    if (exerciseFilter === 'all') {
      // Aggregate data by workout date
      const aggregated = new Map<string, any>()

      filteredPerformanceData.forEach((d) => {
        const dateKey = new Date(d.workout_date).toLocaleDateString()

        if (!aggregated.has(dateKey)) {
          aggregated.set(dateKey, {
            date: dateKey,
            volume: 0,
            weight: 0,
            reps: 0,
            count: 0,
          })
        }

        const entry = aggregated.get(dateKey)!
        entry.volume += d.total_volume || 0
        if (d.max_weight) {
          entry.weight += d.max_weight
          entry.count++
        }
        if (d.max_reps) entry.reps = Math.max(entry.reps, d.max_reps)
      })

      return Array.from(aggregated.values()).map((entry) => ({
        ...entry,
        avgWeight: entry.count > 0 ? Math.round(entry.weight / entry.count) : 0,
      }))
    } else {
      // Show data for specific exercise
      return filteredPerformanceData.map((d) => ({
        date: new Date(d.workout_date).toLocaleDateString(),
        volume: d.total_volume || 0,
        weight: d.max_weight || 0,
        reps: d.max_reps || 0,
        time: d.max_time || 0,
        distance: d.max_distance || 0,
      }))
    }
  }

  const chartData = prepareChartData()

  // Determine which metrics to show based on exercise filter
  const getTrackedMetrics = () => {
    if (exerciseFilter === 'all') {
      return {
        weight: true,
        reps: true,
        time: false,
        distance: false,
      }
    }

    const exercise = exercises.find((e) => e.id === exerciseFilter)
    if (!exercise) {
      return {
        weight: false,
        reps: false,
        time: false,
        distance: false,
      }
    }

    return {
      weight: exercise.tracks_weight,
      reps: exercise.tracks_reps,
      time: exercise.tracks_time,
      distance: exercise.tracks_distance,
    }
  }

  const trackedMetrics = getTrackedMetrics()

  // Calculate trends
  const weightData = chartData.map((d) => d.weight || d.avgWeight || 0).filter((v) => v > 0)
  const repsData = chartData.map((d) => d.reps || 0).filter((v) => v > 0)
  const volumeData = chartData.map((d) => d.volume || 0).filter((v) => v > 0)

  const weightTrend = calculateTrend(weightData)
  const repsTrend = calculateTrend(repsData)
  const volumeTrend = calculateTrend(volumeData)

  // Filter PRs by time period and program
  const getFilteredPRs = () => {
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

  // Format duration helper
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0m'
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  // Get selected program name
  const selectedProgramName =
    programs.find((p) => p.id === selectedProgram)?.name || 'Select Program'

  // Get selected exercise name
  const selectedExerciseName =
    exerciseFilter === 'all'
      ? 'All Exercises'
      : exercises.find((e) => e.id === exerciseFilter)?.name || 'Select Exercise'

  // Get unique exercises from performance data
  const uniqueExercises = Array.from(
    new Set(performanceData.map((d) => d.exercise_id))
  ).map((id) => {
    const perf = performanceData.find((d) => d.exercise_id === id)
    return {
      id,
      name: perf?.exercise_name || 'Unknown',
    }
  })

  // Trend indicator component
  const TrendIndicator = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-semibold">Improving</span>
        </div>
      )
    } else if (trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs font-semibold">Declining</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <Minus className="w-4 h-4" />
          <span className="text-xs font-semibold">Plateau</span>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Progress</h1>

          {/* Program Selector */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">Program</label>
            <div className="relative">
              <button
                onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                className="w-full bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 flex items-center justify-between transition"
              >
                <span className="font-semibold">{selectedProgramName}</span>
                <ChevronDown className="w-5 h-5" />
              </button>

              {showProgramDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {programs.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No programs found
                    </div>
                  ) : (
                    programs.map((program) => (
                      <button
                        key={program.id}
                        onClick={() => {
                          setSelectedProgram(program.id)
                          setShowProgramDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition ${
                          selectedProgram === program.id
                            ? 'bg-purple-50 text-primary-purple-600 font-semibold'
                            : 'text-gray-900'
                        }`}
                      >
                        {program.name}
                        {program.is_active && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

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
        {/* Stats Overview - The 4 squares */}
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

        {/* Progress Graphs */}
        {selectedProgram && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Progression</h2>

              {/* Exercise Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowExerciseDropdown(!showExerciseDropdown)}
                  className="bg-white border-2 border-gray-200 hover:border-primary-purple-400 rounded-xl px-4 py-2 flex items-center gap-2 transition"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedExerciseName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showExerciseDropdown && (
                  <div className="absolute z-10 right-0 mt-2 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto min-w-[200px]">
                    <button
                      onClick={() => {
                        setExerciseFilter('all')
                        setShowExerciseDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition ${
                        exerciseFilter === 'all'
                          ? 'bg-purple-50 text-primary-purple-600 font-semibold'
                          : 'text-gray-900'
                      }`}
                    >
                      All Exercises
                    </button>
                    {uniqueExercises.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => {
                          setExerciseFilter(exercise.id)
                          setShowExerciseDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition ${
                          exerciseFilter === exercise.id
                            ? 'bg-purple-50 text-primary-purple-600 font-semibold'
                            : 'text-gray-900'
                        }`}
                      >
                        {exercise.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Yet</h3>
                <p className="text-gray-600">
                  Complete workouts in this program to see your progression
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Volume Chart */}
                {volumeData.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Total Volume</h3>
                        <p className="text-sm text-gray-600">
                          {userProfile?.preferred_unit || 'lbs'} lifted over time
                        </p>
                      </div>
                      <TrendIndicator trend={volumeTrend} />
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="volume"
                          stroke="#9333EA"
                          strokeWidth={3}
                          dot={{ fill: '#9333EA', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Weight Chart */}
                {trackedMetrics.weight && weightData.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Max Weight</h3>
                        <p className="text-sm text-gray-600">
                          {userProfile?.preferred_unit || 'lbs'} per session
                        </p>
                      </div>
                      <TrendIndicator trend={weightTrend} />
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey={exerciseFilter === 'all' ? 'avgWeight' : 'weight'}
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ fill: '#2563eb', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Reps Chart */}
                {trackedMetrics.reps && repsData.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Max Reps</h3>
                        <p className="text-sm text-gray-600">Repetitions per session</p>
                      </div>
                      <TrendIndicator trend={repsTrend} />
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="reps"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Time Chart */}
                {trackedMetrics.time && chartData.some((d) => d.time > 0) && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Max Time</h3>
                        <p className="text-sm text-gray-600">Seconds per session</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="time"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Distance Chart */}
                {trackedMetrics.distance && chartData.some((d) => d.distance > 0) && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Max Distance</h3>
                        <p className="text-sm text-gray-600">Distance per session</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="distance"
                          stroke="#ec4899"
                          strokeWidth={3}
                          dot={{ fill: '#ec4899', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
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
                {selectedProgram
                  ? 'Complete workouts in this program to see your history'
                  : 'Select a program to see your workout history'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedWorkouts.slice(0, 10).map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => navigate(`/workout-detail/${workout.id}`)}
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
