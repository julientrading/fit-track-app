import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getWorkoutDetails, deleteWorkoutLog, getPreviousWorkoutComparison } from '@/lib/database'
import type { WorkoutLog, ExerciseLog, Set, PersonalRecord } from '@/types/database'

interface ExerciseLogWithSets extends ExerciseLog {
  sets: Set[]
}

interface WorkoutDetailsData {
  workoutLog: WorkoutLog
  exerciseLogs: ExerciseLogWithSets[]
  personalRecords: (PersonalRecord & { exercise: { name: string } })[]
}

interface PreviousWorkoutData {
  workout_log_id: string
  completed_at: string
  exercise_id: string
  exercise_name: string
  best_set_weight: number
  best_set_reps: number
  total_volume: number
  total_sets: number
}

export function WorkoutDetail() {
  const { workoutId } = useParams<{ workoutId: string }>()
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [workoutData, setWorkoutData] = useState<WorkoutDetailsData | null>(null)
  const [previousWorkout, setPreviousWorkout] = useState<Record<string, PreviousWorkoutData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load workout details
  useEffect(() => {
    if (!userProfile || !workoutId) {
      setIsLoading(false)
      return
    }

    // Reset flags when component mounts/remounts
    hasInitialized.current = false
    isInitializing.current = false

    const loadWorkoutData = async () => {
      // Guard against double loading (React Strict Mode)
      if (isInitializing.current) {
        console.log('[WorkoutDetail] Already loading, skipping...')
        return
      }

      try {
        isInitializing.current = true
        console.log('[WorkoutDetail] Loading workout details for:', workoutId)
        setIsLoading(true)

        const data = await getWorkoutDetails(workoutId)
        setWorkoutData(data as WorkoutDetailsData)

        // If this workout has a workout_day_id, fetch previous performance
        if (data.workoutLog.workout_day_id) {
          try {
            const previousData = await getPreviousWorkoutComparison(
              userProfile.id,
              data.workoutLog.workout_day_id,
              workoutId
            )

            // Convert array to object keyed by exercise_id for easy lookup
            const previousMap: Record<string, PreviousWorkoutData> = {}
            previousData.forEach((item) => {
              previousMap[item.exercise_id] = item
            })
            setPreviousWorkout(previousMap)
          } catch (error) {
            console.warn('[WorkoutDetail] Could not load previous workout data:', error)
          }
        }

        console.log('[WorkoutDetail] Loaded workout data')
        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[WorkoutDetail] Failed to load workout:', error)
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutData()
  }, [userProfile, workoutId])

  // Delete workout handler
  const handleDeleteWorkout = async () => {
    if (!workoutId) return

    try {
      setIsDeleting(true)
      await deleteWorkoutLog(workoutId)
      navigate('/progress') // Navigate back to progress page
    } catch (error) {
      console.error('[WorkoutDetail] Failed to delete workout:', error)
      alert('Failed to delete workout. Please try again.')
      setIsDeleting(false)
    }
  }

  // Format duration helper
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Calculate exercise volume
  const calculateExerciseVolume = (sets: Set[]) => {
    return sets.reduce((total, set) => {
      if (set.weight && set.reps) {
        return total + set.weight * set.reps
      }
      return total
    }, 0)
  }

  // Get comparison for an exercise
  const getComparison = (exerciseId: string, currentVolume: number) => {
    const prev = previousWorkout[exerciseId]
    if (!prev) return null

    const diff = currentVolume - prev.total_volume
    const percentChange = prev.total_volume > 0 ? (diff / prev.total_volume) * 100 : 0

    return {
      previous: prev,
      volumeChange: diff,
      percentChange,
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-gradient-primary text-white px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
              <div className="h-8 bg-white/20 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border-2 border-gray-200 p-4 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!workoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Workout Not Found</h2>
          <p className="text-gray-600 mb-6">This workout could not be loaded.</p>
          <button
            onClick={() => navigate('/progress')}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
          >
            Back to Progress
          </button>
        </div>
      </div>
    )
  }

  const { workoutLog, exerciseLogs, personalRecords } = workoutData
  const unit = userProfile?.preferred_unit || 'lbs'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex-1">{workoutLog.name}</h1>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(workoutLog.started_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(workoutLog.started_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Duration</span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {formatDuration(workoutLog.duration_seconds)}
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Dumbbell className="w-4 h-4" />
              <span className="text-xs font-semibold">Total Sets</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{workoutLog.total_sets}</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Volume</span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {workoutLog.total_volume
                ? `${(workoutLog.total_volume / 1000).toFixed(1)}k`
                : '0'}
            </p>
            <p className="text-xs text-gray-500">{unit}</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">XP Earned</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{workoutLog.xp_earned}</p>
          </div>
        </div>

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Personal Records ({personalRecords.length})
              </h2>
            </div>
            <div className="space-y-2">
              {personalRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between bg-white rounded-xl p-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{pr.exercise.name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {pr.record_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {pr.weight && pr.reps && (
                      <p className="font-bold text-gray-900">
                        {pr.weight} {unit} × {pr.reps}
                      </p>
                    )}
                    {pr.volume && (
                      <p className="text-sm text-gray-600">{pr.volume} {unit} total</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workout Notes & Feeling */}
        {(workoutLog.notes || workoutLog.feeling) && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Notes & Feedback</h2>
            {workoutLog.feeling && (
              <div className="mb-2">
                <span className="text-sm font-semibold text-gray-600">Feeling: </span>
                <span className="text-gray-900 capitalize">{workoutLog.feeling}</span>
              </div>
            )}
            {workoutLog.notes && (
              <p className="text-gray-700 whitespace-pre-wrap">{workoutLog.notes}</p>
            )}
          </div>
        )}

        {/* Exercise Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Exercise Breakdown</h2>

          {exerciseLogs.map((exerciseLog, index) => {
            const exerciseVolume = calculateExerciseVolume(exerciseLog.sets)
            const comparison = getComparison(exerciseLog.exercise_id, exerciseVolume)

            return (
              <div
                key={exerciseLog.id}
                className="bg-white rounded-2xl border-2 border-gray-200 p-4"
              >
                {/* Exercise Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {exerciseLog.exercise_name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{exerciseLog.sets.length} sets</span>
                      {exerciseVolume > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {exerciseVolume.toLocaleString()} {unit} volume
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Comparison Badge */}
                  {comparison && comparison.volumeChange !== 0 && (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        comparison.volumeChange > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <ChevronRight
                        className={`w-3 h-3 ${
                          comparison.volumeChange > 0 ? 'rotate-[-90deg]' : 'rotate-90'
                        }`}
                      />
                      <span>{Math.abs(comparison.percentChange).toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-gray-600 font-semibold">
                          Set
                        </th>
                        <th className="text-center py-2 px-2 text-gray-600 font-semibold">
                          Type
                        </th>
                        <th className="text-center py-2 px-2 text-gray-600 font-semibold">
                          Weight
                        </th>
                        <th className="text-center py-2 px-2 text-gray-600 font-semibold">
                          Reps
                        </th>
                        <th className="text-center py-2 px-2 text-gray-600 font-semibold">
                          Volume
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseLog.sets.map((set) => (
                        <tr
                          key={set.id}
                          className={`border-b border-gray-100 ${
                            set.is_personal_record ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="py-2 px-2 text-gray-900 font-semibold">
                            {set.set_number}
                            {set.is_personal_record && (
                              <Award className="w-3 h-3 text-yellow-600 inline ml-1" />
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                set.set_type === 'warmup'
                                  ? 'bg-blue-100 text-blue-700'
                                  : set.set_type === 'dropset'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {set.set_type}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center text-gray-900">
                            {set.weight ? `${set.weight} ${unit}` : '-'}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-900">
                            {set.reps || '-'}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-900 font-semibold">
                            {set.weight && set.reps
                              ? `${(set.weight * set.reps).toLocaleString()}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Comparison with Previous */}
                {comparison && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      vs. Previous Workout ({new Date(comparison.previous.completed_at).toLocaleDateString()})
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Best Set</p>
                        <p className="font-semibold text-gray-900">
                          {comparison.previous.best_set_weight} {unit} ×{' '}
                          {comparison.previous.best_set_reps}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Sets</p>
                        <p className="font-semibold text-gray-900">
                          {comparison.previous.total_sets}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Volume</p>
                        <p
                          className={`font-semibold ${
                            comparison.volumeChange > 0
                              ? 'text-green-700'
                              : comparison.volumeChange < 0
                              ? 'text-red-700'
                              : 'text-gray-900'
                          }`}
                        >
                          {comparison.previous.total_volume.toLocaleString()} {unit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exercise Notes */}
                {exerciseLog.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{exerciseLog.notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Workout?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete this workout and all its data. This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorkout}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
