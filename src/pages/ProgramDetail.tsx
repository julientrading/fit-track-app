import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Edit,
  Copy,
  Trash2,
  Check,
  Globe,
  Lock,
} from 'lucide-react'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuthStore } from '@/stores/authStore'
import {
  getProgramById,
  getWorkoutDaysByProgram,
  getWorkoutDayExercises,
  setActiveProgram,
  deleteProgram,
  duplicateProgram,
} from '@/lib/database'
import type { Program, WorkoutDay } from '@/types/database'

interface WorkoutDayWithExercises extends WorkoutDay {
  exercises: any[]
}

export function ProgramDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { userProfile } = useAuthStore()

  const [program, setProgram] = useState<Program | null>(null)
  const [workoutDays, setWorkoutDays] = useState<WorkoutDayWithExercises[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActioning, setIsActioning] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const hasLoaded = useRef(false)

  // Load program data
  useEffect(() => {
    if (!id || !userProfile || hasLoaded.current) return

    const loadProgram = async () => {
      setIsLoading(true)
      try {
        const programData = await getProgramById(id)
        if (!programData) {
          alert('Program not found')
          navigate('/library/programs')
          return
        }

        setProgram(programData)

        // Load workout days
        const days = await getWorkoutDaysByProgram(id)
        const daysWithExercises = await Promise.all(
          days.map(async (day) => {
            const exercises = await getWorkoutDayExercises(day.id)
            return { ...day, exercises }
          })
        )

        setWorkoutDays(daysWithExercises)
        hasLoaded.current = true
      } catch (error) {
        console.error('Failed to load program:', error)
        alert('Failed to load program')
        navigate('/library/programs')
      } finally {
        setIsLoading(false)
      }
    }

    loadProgram()
  }, [id, userProfile, navigate])

  const handleSetActive = async () => {
    if (!userProfile || !program) return

    setIsActioning(true)
    try {
      await setActiveProgram(userProfile.id, program.id)
      alert('Program set as active!')
      navigate('/library/programs')
    } catch (error) {
      console.error('Failed to set active program:', error)
      alert('Failed to set program as active')
    } finally {
      setIsActioning(false)
    }
  }

  const handleDuplicate = async () => {
    if (!userProfile || !program) return

    setIsActioning(true)
    try {
      const newProgram = await duplicateProgram(program.id, userProfile.id)
      alert('Program duplicated successfully!')
      navigate(`/program/${newProgram.id}`)
    } catch (error) {
      console.error('Failed to duplicate program:', error)
      alert('Failed to duplicate program')
    } finally {
      setIsActioning(false)
    }
  }

  const handleDelete = async () => {
    if (!program) return

    setIsActioning(true)
    try {
      await deleteProgram(program.id)
      alert('Program deleted successfully!')
      navigate('/library/programs')
    } catch (error) {
      console.error('Failed to delete program:', error)
      alert('Failed to delete program')
    } finally {
      setIsActioning(false)
      setShowDeleteConfirm(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700'
      case 'intermediate':
        return 'bg-blue-100 text-blue-700'
      case 'advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading program...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return null
  }

  const isMyProgram = userProfile?.id === program.user_id
  const isActive = program.is_active

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/library/programs')}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex-1">{program.name}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Program Details Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Program Details</h2>
            <div className="flex gap-2">
              {program.is_draft && (
                <span className="inline-block px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded">
                  DRAFT
                </span>
              )}
              {isActive && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          {program.description && (
            <p className="text-gray-600 mb-4">{program.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Goal</p>
              <p className="font-semibold text-gray-900">{program.goal || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Difficulty</p>
              {program.difficulty ? (
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${getDifficultyColor(program.difficulty)}`}>
                  {program.difficulty}
                </span>
              ) : (
                <p className="text-gray-500">Not specified</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold text-gray-900">
                {program.duration_weeks ? `${program.duration_weeks} weeks` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days/Week</p>
              <p className="font-semibold text-gray-900">
                {program.days_per_week || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {program.is_public ? (
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

        {/* Workout Days */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Workout Days ({workoutDays.length})
          </h2>

          {workoutDays.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No workout days configured yet</p>
            </div>
          ) : (
            workoutDays.map((day, index) => (
              <div key={day.id} className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  Day {index + 1}: {day.name}
                </h3>
                {day.description && (
                  <p className="text-sm text-gray-600 mb-3">{day.description}</p>
                )}

                {day.exercises.length === 0 ? (
                  <p className="text-sm text-gray-500">No exercises added</p>
                ) : (
                  <div className="space-y-3">
                    {day.exercises.map((ex: any, exIndex: number) => (
                      <div
                        key={ex.id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <Dumbbell className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">
                              {exIndex + 1}. {ex.exercise?.name || 'Unknown Exercise'}
                            </p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Sets:</span> {ex.sets?.length || 0}
                              </p>
                              {ex.sets && ex.sets.length > 0 && (
                                <div className="text-xs text-gray-500 space-y-1">
                                  {ex.sets.map((set: any, setIndex: number) => (
                                    <div key={setIndex}>
                                      Set {setIndex + 1}: {' '}
                                      {typeof set.targetReps === 'number'
                                        ? `${set.targetReps} reps`
                                        : set.targetReps?.min
                                        ? `${set.targetReps.min}-${set.targetReps.max} reps`
                                        : 'To failure'}
                                      {set.targetWeight > 0 && ` @ ${set.targetWeight} lbs`}
                                      {set.type !== 'working' && (
                                        <span className="ml-2 text-gray-400">({set.type})</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Rest:</span> {ex.rest_time || 0}s
                              </p>
                              {ex.notes && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {ex.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        {isMyProgram && (
          <div className="sticky bottom-20 bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-lg">
            <div className="flex flex-wrap gap-3">
              {/* Edit Button */}
              <button
                onClick={() => navigate(`/program/edit/${program.id}`)}
                disabled={isActioning}
                className="flex-1 min-w-[120px] px-4 py-3 bg-primary-purple-600 text-white font-semibold rounded-xl hover:bg-primary-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              {/* Set Active - Only for non-draft, non-active programs */}
              {!program.is_draft && !isActive && (
                <button
                  onClick={handleSetActive}
                  disabled={isActioning}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-white border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Set Active
                </button>
              )}

              {/* Duplicate - Only for non-draft programs */}
              {!program.is_draft && (
                <button
                  onClick={handleDuplicate}
                  disabled={isActioning}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
              )}

              {/* Delete */}
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Program?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{program.name}"? This action cannot be undone.
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

      {/* Bottom Navigation */}
      <BottomNavigation active="library" />
    </div>
  )
}
