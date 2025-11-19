import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Dumbbell, Filter, X, ArrowLeft, Edit, Trash2, Globe, Lock } from 'lucide-react'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuthStore } from '@/stores/authStore'
import { getUserExercises, getPublicExercises } from '@/lib/database'
import type { Exercise } from '@/types/database'

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Glutes',
  'Calves',
  'Cardio',
]

const CATEGORIES = [
  { value: 'compound', label: 'Compound' },
  { value: 'isolation', label: 'Isolation' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'other', label: 'Other' },
]

export function ExercisesAll() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null)

  // Load exercises based on active tab
  useEffect(() => {
    if (!userProfile) {
      setIsLoading(false)
      return
    }

    const loadExercises = async () => {
      try {
        console.log('[ExerciseLibrary] Loading exercises, tab:', activeTab)
        setIsLoading(true)

        const data = activeTab === 'my'
          ? await getUserExercises(userProfile.id)
          : await getPublicExercises()

        setExercises(data)
        setFilteredExercises(data)

        console.log('[ExerciseLibrary] Loaded', data.length, 'exercises')
      } catch (error) {
        console.error('[ExerciseLibrary] Failed to load exercises:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExercises()
  }, [userProfile, activeTab])

  // Filter exercises
  useEffect(() => {
    let filtered = exercises

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Muscle group filter
    if (selectedMuscleGroup) {
      filtered = filtered.filter((ex) =>
        ex.muscle_groups.some((mg) =>
          mg.toLowerCase().includes(selectedMuscleGroup.toLowerCase())
        )
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((ex) => ex.category === selectedCategory)
    }

    setFilteredExercises(filtered)
  }, [searchQuery, selectedMuscleGroup, selectedCategory, exercises])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedMuscleGroup(null)
    setSelectedCategory(null)
  }

  const hasActiveFilters = searchQuery || selectedMuscleGroup || selectedCategory

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/library')}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex-1">Exercise Library</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition ${
                activeTab === 'my'
                  ? 'bg-white text-primary-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              My Library
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition ${
                activeTab === 'community'
                  ? 'bg-white text-primary-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Community Library
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-transparent focus:border-primary-purple-400 focus:outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Filter className="w-5 h-5" />
            <span>
              Filters
              {hasActiveFilters && ` (${[selectedMuscleGroup, selectedCategory].filter(Boolean).length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Muscle Groups */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Muscle Group</h3>
                {selectedMuscleGroup && (
                  <button
                    onClick={() => setSelectedMuscleGroup(null)}
                    className="text-sm text-primary-purple-600 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <button
                    key={group}
                    onClick={() =>
                      setSelectedMuscleGroup(selectedMuscleGroup === group ? null : group)
                    }
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                      selectedMuscleGroup === group
                        ? 'bg-primary-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Category</h3>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-sm text-primary-purple-600 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.value ? null : cat.value)
                    }
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                      selectedCategory === cat.value
                        ? 'bg-primary-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear All */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${filteredExercises.length} exercise${filteredExercises.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Loading State */}
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
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No exercises available yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary-purple-600 text-white font-semibold rounded-xl hover:bg-primary-purple-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
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
                      {/* Category Badge */}
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {exercise.category}
                      </span>

                      {/* Difficulty Badge */}
                      {exercise.difficulty && (
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            exercise.difficulty === 'beginner'
                              ? 'bg-green-100 text-green-700'
                              : exercise.difficulty === 'intermediate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {exercise.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Muscle Groups */}
                    {exercise.muscle_groups.length > 0 && (
                      <p className="text-sm text-gray-600 truncate">
                        {exercise.muscle_groups.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation active="library" />
    </div>
  )
}
