import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, Calendar, ChevronRight } from 'lucide-react'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuthStore } from '@/stores/authStore'
import {
  getUserPrograms,
  getAllAvailableExercises,
} from '@/lib/database'
import type { Program, Exercise } from '@/types/database'

export function Library() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [recentPrograms, setRecentPrograms] = useState<Program[]>([])
  const [frequentExercises, setFrequentExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load library data
  useEffect(() => {
    if (!userProfile) {
      setIsLoading(false)
      return
    }

    const loadLibraryData = async () => {
      // Guard against double loading
      if (isInitializing.current || hasInitialized.current) {
        console.log('[Library] Already loading or loaded, skipping...')
        setIsLoading(false)
        return
      }

      try {
        isInitializing.current = true
        console.log('[Library] Loading library data for user:', userProfile.id)
        setIsLoading(true)

        const [allPrograms, allExercises] = await Promise.all([
          getUserPrograms(userProfile.id),
          getAllAvailableExercises(userProfile.id),
        ])

        // Show the 3 most recent programs (including drafts)
        const recentProgs = allPrograms.slice(0, 3)
        // Show the 10 most recent exercises
        const recentExs = allExercises.slice(0, 10)

        setRecentPrograms(recentProgs)
        setFrequentExercises(recentExs)

        console.log('[Library] Loaded', recentProgs.length, 'programs and', recentExs.length, 'exercises')

        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[Library] Failed to load library data:', error)
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadLibraryData()
  }, [userProfile])

  // Difficulty badge color
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700'
      case 'advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Library</h1>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/program/create')}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Program
            </button>
            <button
              onClick={() => alert('Exercise creation feature coming soon!')}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Exercise
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        {/* Programs Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Programs</h2>
            <button
              onClick={() => navigate('/library/programs')}
              className="text-sm text-primary-purple-600 font-semibold hover:text-primary-purple-700 flex items-center gap-1"
            >
              All Programs
              <ChevronRight className="w-4 h-4" />
            </button>
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
          ) : recentPrograms.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">No Programs Yet</h3>
              <p className="text-gray-600 text-sm mb-4">
                Create your first program to get started
              </p>
              <button
                onClick={() => navigate('/program/create')}
                className="px-6 py-2 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                Create Program
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPrograms.map((program) => (
                <button
                  key={program.id}
                  onClick={() => navigate(`/library/programs`)}
                  className="w-full bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-primary-purple-400 hover:bg-purple-50 transition text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="bg-purple-100 rounded-xl p-3 flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary-purple-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{program.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {program.is_draft && (
                          <span className="inline-block px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded">
                            DRAFT
                          </span>
                        )}
                        {program.difficulty && (
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${getDifficultyColor(
                              program.difficulty
                            )}`}
                          >
                            {program.difficulty}
                          </span>
                        )}
                        {program.goal && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            {program.goal}
                          </span>
                        )}
                        {program.is_active && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {program.days_per_week} days/week
                        {program.duration_weeks && ` • ${program.duration_weeks} weeks`}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}

              {/* Browse All Link */}
              <button
                onClick={() => navigate('/library/programs')}
                className="w-full py-3 text-primary-purple-600 font-semibold hover:bg-purple-50 rounded-xl transition flex items-center justify-center gap-2"
              >
                Browse All Programs
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Exercises Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Exercises</h2>
            <button
              onClick={() => navigate('/library/exercises')}
              className="text-sm text-primary-purple-600 font-semibold hover:text-primary-purple-700 flex items-center gap-1"
            >
              All Exercises
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-4 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : frequentExercises.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">No Exercises Yet</h3>
              <p className="text-gray-600 text-sm mb-4">
                Start a workout to build your exercise history
              </p>
              <button
                onClick={() => navigate('/library/exercises')}
                className="px-6 py-2 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                Browse Exercises
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {frequentExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => navigate(`/library/exercise/${exercise.id}`)}
                  className="w-full bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-primary-purple-400 hover:bg-purple-50 transition text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="bg-purple-100 rounded-xl p-3 flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-primary-purple-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{exercise.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded capitalize">
                          {exercise.category}
                        </span>
                        {exercise.difficulty && (
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${getDifficultyColor(
                              exercise.difficulty
                            )}`}
                          >
                            {exercise.difficulty}
                          </span>
                        )}
                      </div>
                      {exercise.muscle_groups.length > 0 && (
                        <p className="text-sm text-gray-600 truncate">
                          {exercise.muscle_groups.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}

              {/* Browse All Link */}
              <button
                onClick={() => navigate('/library/exercises')}
                className="w-full py-3 text-primary-purple-600 font-semibold hover:bg-purple-50 rounded-xl transition flex items-center justify-center gap-2"
              >
                Browse All Exercises
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation active="library" />
    </div>
  )
}
