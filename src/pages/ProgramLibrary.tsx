import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  Copy,
  Check,
  Filter,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  getUserPrograms,
  getPublicPrograms,
  setActiveProgram,
  deleteProgram,
  duplicateProgram,
} from '@/lib/database'
import type { Program } from '@/types/database'

const GOALS = [
  'Build Muscle',
  'Gain Strength',
  'Lose Weight',
  'Improve Endurance',
  'General Fitness',
  'Athletic Performance',
]

export function ProgramLibrary() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Refs for React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my')
  const [myPrograms, setMyPrograms] = useState<Program[]>([])
  const [communityPrograms, setCommunityPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'popular'>('recent')

  // Program actions
  const [activeProgram, setActiveProgramState] = useState<string | null>(null)
  const [actioningProgramId, setActioningProgramId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // Load programs
  useEffect(() => {
    if (!userProfile) {
      setIsLoading(false)
      return
    }

    const loadPrograms = async () => {
      // Guard against double loading
      if (isInitializing.current || hasInitialized.current) {
        console.log('[ProgramLibrary] Already loading or loaded, skipping...')
        setIsLoading(false)
        return
      }

      try {
        isInitializing.current = true
        console.log('[ProgramLibrary] Loading programs')
        setIsLoading(true)

        const [myProgs, communityProgs] = await Promise.all([
          getUserPrograms(userProfile.id),
          getPublicPrograms(),
        ])

        setMyPrograms(myProgs)
        setCommunityPrograms(communityProgs)

        // Find active program
        const active = myProgs.find((p) => p.is_active)
        setActiveProgramState(active?.id || null)

        console.log('[ProgramLibrary] Loaded programs')
        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('[ProgramLibrary] Failed to load programs:', error)
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadPrograms()
  }, [userProfile])

  // Filter and sort programs
  const getFilteredPrograms = (programs: Program[]) => {
    let filtered = [...programs]

    // Goal filter
    if (selectedGoal) {
      filtered = filtered.filter((p) => p.goal === selectedGoal)
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((p) => p.difficulty === selectedDifficulty)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortBy === 'popular') {
        return (b.times_completed || 0) - (a.times_completed || 0)
      } else {
        // recent (created_at)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }

  const displayedPrograms =
    activeTab === 'my' ? getFilteredPrograms(myPrograms) : getFilteredPrograms(communityPrograms)

  // Handle set as active
  const handleSetActive = async (programId: string) => {
    if (!userProfile) return

    try {
      setActioningProgramId(programId)
      await setActiveProgram(userProfile.id, programId)

      // Update local state
      setMyPrograms(
        myPrograms.map((p) => ({
          ...p,
          is_active: p.id === programId,
        }))
      )
      setActiveProgramState(programId)
    } catch (error) {
      console.error('Failed to set active program:', error)
      alert('Failed to activate program. Please try again.')
    } finally {
      setActioningProgramId(null)
    }
  }

  // Handle duplicate
  const handleDuplicate = async (programId: string) => {
    if (!userProfile) return

    try {
      setActioningProgramId(programId)
      const newProgram = await duplicateProgram(programId, userProfile.id)

      // Add to local state
      setMyPrograms([newProgram, ...myPrograms])

      alert('Program duplicated successfully!')
    } catch (error) {
      console.error('Failed to duplicate program:', error)
      alert('Failed to duplicate program. Please try again.')
    } finally {
      setActioningProgramId(null)
    }
  }

  // Handle delete
  const handleDeleteConfirm = (programId: string) => {
    setDeleteTargetId(programId)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return

    try {
      setActioningProgramId(deleteTargetId)
      await deleteProgram(deleteTargetId)

      // Remove from local state
      setMyPrograms(myPrograms.filter((p) => p.id !== deleteTargetId))

      setShowDeleteConfirm(false)
      setDeleteTargetId(null)
    } catch (error) {
      console.error('Failed to delete program:', error)
      alert('Failed to delete program. Please try again.')
    } finally {
      setActioningProgramId(null)
    }
  }

  const clearFilters = () => {
    setSelectedGoal(null)
    setSelectedDifficulty(null)
  }

  const hasActiveFilters = selectedGoal || selectedDifficulty

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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/library')}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex-1">Workout Program Library</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                activeTab === 'my'
                  ? 'bg-white text-primary-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              My Library
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                activeTab === 'community'
                  ? 'bg-white text-primary-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Community Library
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Filter className="w-5 h-5" />
            <span>
              Filters
              {hasActiveFilters &&
                ` (${[selectedGoal, selectedDifficulty].filter(Boolean).length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b-2 border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Goal Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Goal</h3>
                {selectedGoal && (
                  <button
                    onClick={() => setSelectedGoal(null)}
                    className="text-sm text-primary-purple-600 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setSelectedGoal(selectedGoal === goal ? null : goal)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                      selectedGoal === goal
                        ? 'bg-primary-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Difficulty</h3>
                {selectedDifficulty && (
                  <button
                    onClick={() => setSelectedDifficulty(null)}
                    className="text-sm text-primary-purple-600 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      setSelectedDifficulty(selectedDifficulty === level ? null : level)
                    }
                    className={`px-4 py-2 rounded-xl font-semibold text-sm capitalize transition ${
                      selectedDifficulty === level
                        ? 'bg-primary-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Sort By</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                    sortBy === 'recent'
                      ? 'bg-primary-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Recently Created
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                    sortBy === 'name'
                      ? 'bg-primary-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  A-Z
                </button>
                {activeTab === 'community' && (
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                      sortBy === 'popular'
                        ? 'bg-primary-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Most Popular
                  </button>
                )}
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

      {/* Program List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {isLoading
              ? 'Loading...'
              : `${displayedPrograms.length} program${displayedPrograms.length !== 1 ? 's' : ''}`}
          </p>
          {activeTab === 'my' && (
            <button
              onClick={() => navigate('/program/create')}
              className="px-4 py-2 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}
        </div>

        {/* Loading State */}
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
        ) : displayedPrograms.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : activeTab === 'my'
                ? 'Create your first program to get started'
                : 'Check back later for community programs'}
            </p>
            {activeTab === 'my' ? (
              <button
                onClick={() => navigate('/program/create')}
                className="px-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                Create Program
              </button>
            ) : hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary-purple-600 text-white font-semibold rounded-xl hover:bg-primary-purple-700 transition"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPrograms.map((program) => {
              const isActive = program.id === activeProgram
              const isActioning = actioningProgramId === program.id
              const isMyProgram = activeTab === 'my'

              return (
                <div
                  key={program.id}
                  className={`bg-white rounded-2xl border-2 p-4 ${
                    isActive ? 'border-green-400 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon */}
                    <div
                      className={`rounded-xl p-3 flex-shrink-0 ${
                        isActive ? 'bg-green-100' : 'bg-purple-100'
                      }`}
                    >
                      <Calendar
                        className={`w-5 h-5 ${
                          isActive ? 'text-green-600' : 'text-primary-purple-600'
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{program.name}</h3>
                      {program.description && (
                        <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
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
                        {isActive && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {program.days_per_week} days/week
                        {program.duration_weeks && ` • ${program.duration_weeks} weeks`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isMyProgram ? (
                      <>
                        {!isActive && (
                          <button
                            onClick={() => handleSetActive(program.id)}
                            disabled={isActioning}
                            className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(program.id)}
                          disabled={isActioning}
                          className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(program.id)}
                          disabled={isActioning}
                          className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDuplicate(program.id)}
                        disabled={isActioning}
                        className="flex-1 px-4 py-2 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Use This Program
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Program?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete this program and all workout days. This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteTargetId(null)
                }}
                disabled={actioningProgramId !== null}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actioningProgramId !== null}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {actioningProgramId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
