import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Dumbbell,
  Info,
  ListOrdered,
  Video,
  TrendingUp,
  Target,
  Edit,
  Trash2,
  Globe,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getExerciseById, getExercisePRs, deleteExercise } from '@/lib/database'
import { useAuthStore } from '@/stores/authStore'
import type { Exercise, PersonalRecord } from '@/types/database'

export function ExerciseDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { userProfile } = useAuthStore()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isActioning, setIsActioning] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadExerciseData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const exerciseData = await getExerciseById(id)

        if (!exerciseData) {
          setError('Exercise not found')
          return
        }

        setExercise(exerciseData)

        // Load PRs if user is logged in
        if (userProfile) {
          const prData = await getExercisePRs(userProfile.id, id)
          setPrs(prData)
        }
      } catch (err) {
        console.error('[ExerciseDetail] Failed to load exercise:', err)
        setError(err instanceof Error ? err.message : 'Failed to load exercise')
      } finally {
        setIsLoading(false)
      }
    }

    loadExerciseData()
  }, [id, userProfile])

  const handleDelete = async () => {
    if (!exercise) return

    setIsActioning(true)
    try {
      await deleteExercise(exercise.id)
      alert('Exercise deleted successfully!')
      navigate('/library/exercises')
    } catch (error) {
      console.error('Failed to delete exercise:', error)
      alert('Failed to delete exercise')
    } finally {
      setIsActioning(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Exercise not found'}</p>
          <Button onClick={() => navigate('/library')} variant="outline">
            Back to Library
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/library')}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 mb-4 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-2xl p-4 flex-shrink-0">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{exercise.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">
                  {exercise.category}
                </span>
                {exercise.difficulty && (
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">
                    {exercise.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Description */}
        {exercise.description && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 rounded-xl p-2">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Description</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 rounded-xl p-2">
                <ListOrdered className="w-5 h-5 text-primary-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Instructions</h2>
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {exercise.instructions}
            </div>
          </div>
        )}

        {/* Muscle Groups & Equipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Muscle Groups */}
          {exercise.muscle_groups.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 rounded-xl p-2">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Muscle Groups</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.muscle_groups.map((muscle, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {exercise.equipment.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 rounded-xl p-2">
                  <Dumbbell className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Equipment</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((equip, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg"
                  >
                    {equip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tracking Info */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Tracks</h2>
          <div className="grid grid-cols-2 gap-3">
            {exercise.tracks_weight && (
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold">Weight</span>
              </div>
            )}
            {exercise.tracks_reps && (
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold">Reps</span>
              </div>
            )}
            {exercise.tracks_time && (
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold">Time</span>
              </div>
            )}
            {exercise.tracks_distance && (
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold">Distance</span>
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {exercise.is_public ? (
                <>
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Public - Visible in community</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Private - Only you can see this</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Personal Records */}
        {prs.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 rounded-xl p-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Your Personal Records</h2>
            </div>
            <div className="space-y-2">
              {prs.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {pr.record_type === 'max_weight' && 'Max Weight'}
                    {pr.record_type === 'max_reps' && 'Max Reps'}
                    {pr.record_type === 'max_volume' && 'Max Volume'}
                    {pr.record_type === 'best_time' && 'Best Time'}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {pr.record_type === 'max_weight' && `${pr.weight} ${userProfile?.preferred_unit || 'lbs'}`}
                    {pr.record_type === 'max_reps' && `${pr.reps} reps`}
                    {pr.record_type === 'max_volume' && `${pr.volume} ${userProfile?.preferred_unit || 'lbs'}`}
                    {pr.record_type === 'best_time' && `${pr.time_seconds}s`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Link */}
        {exercise.video_url && (
          <Button
            onClick={() => window.open(exercise.video_url!, '_blank')}
            variant="primary"
            fullWidth
            size="lg"
          >
            <div className="flex items-center justify-center gap-2">
              <Video className="w-5 h-5" />
              <span>Watch Demo Video</span>
            </div>
          </Button>
        )}

        {/* Action Buttons - Only for user's own exercises */}
        {userProfile && exercise.created_by === userProfile.id && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex gap-3">
              {/* Edit Button */}
              <button
                onClick={() => navigate(`/exercise/edit/${exercise.id}`)}
                disabled={isActioning}
                className="flex-1 px-4 py-3 bg-primary-purple-600 text-white font-semibold rounded-xl hover:bg-primary-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isActioning}
                className="px-4 py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Button onClick={() => navigate('/library')} variant="outline" fullWidth size="lg">
          Back to Library
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Exercise?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{exercise.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isActioning}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isActioning}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {isActioning ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
