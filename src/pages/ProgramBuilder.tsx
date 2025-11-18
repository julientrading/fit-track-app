import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Search,
  X,
  Dumbbell,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  createProgram,
  createWorkoutDay,
  createWorkoutDayExercise,
  getAllAvailableExercises,
} from '@/lib/database'
import { supabase } from '@/lib/supabase'
import type { Exercise } from '@/types/database'

// Types for our builder state
interface ProgramBasics {
  name: string
  description: string
  goal: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | ''
  durationWeeks: number
  daysPerWeek: number
}

interface WorkoutDayData {
  id: string // temporary ID for UI
  name: string
  description: string
  exercises: ExerciseConfig[]
}

interface ExerciseConfig {
  id: string // temporary ID for UI
  exerciseId: string
  exerciseName: string
  sets: SetConfig[]
  restTime: number
  notes: string
}

interface SetConfig {
  type: 'warmup' | 'working' | 'dropset'
  targetWeight: number
  targetReps: number | { min: number; max: number }
}

const GOALS = [
  'Build Muscle',
  'Gain Strength',
  'Lose Weight',
  'Improve Endurance',
  'General Fitness',
  'Athletic Performance',
]

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Glutes',
  'Calves',
]

const CATEGORIES = [
  { value: 'compound', label: 'Compound' },
  { value: 'isolation', label: 'Isolation' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'other', label: 'Other' },
]

export function ProgramBuilder() {
  const navigate = useNavigate()
  const { userProfile } = useAuthStore()

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Program data
  const [programBasics, setProgramBasics] = useState<ProgramBasics>({
    name: '',
    description: '',
    goal: '',
    difficulty: '',
    durationWeeks: 8,
    daysPerWeek: 4,
  })

  const [workoutDays, setWorkoutDays] = useState<WorkoutDayData[]>([])
  const [currentEditingDay, setCurrentEditingDay] = useState<string | null>(null)

  // Exercise library
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoadingExercises, setIsLoadingExercises] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')

  // Exercise creation state
  const [showCreateExercise, setShowCreateExercise] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')
  const [newExerciseCategory, setNewExerciseCategory] = useState<'compound' | 'isolation' | 'cardio' | 'flexibility' | 'other'>('compound')
  const [newExerciseMuscleGroups, setNewExerciseMuscleGroups] = useState<string[]>([])
  const [isCreatingExercise, setIsCreatingExercise] = useState(false)

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // Load exercises
  const hasLoadedExercises = useRef(false)
  useEffect(() => {
    if (hasLoadedExercises.current || !userProfile) return

    const loadExercises = async () => {
      setIsLoadingExercises(true)
      try {
        const data = await getAllAvailableExercises(userProfile.id)
        setExercises(data as Exercise[])
        hasLoadedExercises.current = true
      } catch (error) {
        console.error('Failed to load exercises:', error)
      } finally {
        setIsLoadingExercises(false)
      }
    }

    loadExercises()
  }, [userProfile])

  // Step 1: Validate program basics
  const canProceedFromStep1 = () => {
    return (
      programBasics.name.trim().length > 0 &&
      programBasics.goal.length > 0 &&
      programBasics.difficulty.length > 0
    )
  }

  // Step 2: Validate workout days
  const canProceedFromStep2 = () => {
    return workoutDays.length > 0 && workoutDays.every((day) => day.name.trim().length > 0)
  }

  // Step 3: Validate exercises
  const canProceedFromStep3 = () => {
    return workoutDays.every((day) => day.exercises.length > 0)
  }

  // Initialize workout days when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && workoutDays.length === 0) {
      const defaultDays: WorkoutDayData[] = Array.from(
        { length: programBasics.daysPerWeek },
        (_, i) => ({
          id: `temp-${Date.now()}-${i}`,
          name: `Day ${i + 1}`,
          description: '',
          exercises: [],
        })
      )
      setWorkoutDays(defaultDays)
    }
  }, [currentStep, programBasics.daysPerWeek, workoutDays.length])

  // Add workout day
  const handleAddWorkoutDay = () => {
    const newDay: WorkoutDayData = {
      id: `temp-${Date.now()}`,
      name: `Day ${workoutDays.length + 1}`,
      description: '',
      exercises: [],
    }
    setWorkoutDays([...workoutDays, newDay])
  }

  // Remove workout day
  const handleRemoveWorkoutDay = (dayId: string) => {
    setWorkoutDays(workoutDays.filter((d) => d.id !== dayId))
  }

  // Update workout day
  const handleUpdateWorkoutDay = (dayId: string, updates: Partial<WorkoutDayData>) => {
    setWorkoutDays(
      workoutDays.map((day) => (day.id === dayId ? { ...day, ...updates } : day))
    )
  }

  // Add exercise to day
  const handleAddExercise = (dayId: string, exercise: Exercise) => {
    const newExercise: ExerciseConfig = {
      id: `temp-ex-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [
        {
          type: 'working',
          targetWeight: 0,
          targetReps: 10,
        },
      ],
      restTime: 90,
      notes: '',
    }

    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    )

    setShowExerciseModal(false)
    setExerciseSearch('')
  }

  // Remove exercise from day
  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? { ...day, exercises: day.exercises.filter((ex) => ex.id !== exerciseId) }
          : day
      )
    )
  }

  // Update exercise config
  const handleUpdateExercise = (
    dayId: string,
    exerciseId: string,
    updates: Partial<ExerciseConfig>
  ) => {
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, ...updates } : ex
              ),
            }
          : day
      )
    )
  }

  // Add set to exercise
  const handleAddSet = (dayId: string, exerciseId: string) => {
    const day = workoutDays.find((d) => d.id === dayId)
    const exercise = day?.exercises.find((ex) => ex.id === exerciseId)

    if (!exercise) return

    const newSet: SetConfig = {
      type: 'working',
      targetWeight: exercise.sets[exercise.sets.length - 1]?.targetWeight || 0,
      targetReps: exercise.sets[exercise.sets.length - 1]?.targetReps || 10,
    }

    handleUpdateExercise(dayId, exerciseId, {
      sets: [...exercise.sets, newSet],
    })
  }

  // Remove set from exercise
  const handleRemoveSet = (dayId: string, exerciseId: string, setIndex: number) => {
    const day = workoutDays.find((d) => d.id === dayId)
    const exercise = day?.exercises.find((ex) => ex.id === exerciseId)

    if (!exercise || exercise.sets.length <= 1) return

    handleUpdateExercise(dayId, exerciseId, {
      sets: exercise.sets.filter((_, i) => i !== setIndex),
    })
  }

  // Create new exercise inline
  const handleCreateExercise = async () => {
    if (!userProfile || !newExerciseName.trim() || !currentEditingDay) return

    setIsCreatingExercise(true)
    try {
      // Create the exercise in the database
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: newExerciseName.trim(),
          category: newExerciseCategory,
          muscle_groups: newExerciseMuscleGroups,
          equipment: [],
          is_public: false,
          created_by: userProfile.id,
          tracks_weight: true,
          tracks_reps: true,
          tracks_time: false,
          tracks_distance: false,
        })
        .select()
        .single()

      if (error) throw error

      const newExercise = data as Exercise

      // Add to local exercises list
      setExercises([...exercises, newExercise])

      // Add to current workout day
      handleAddExercise(currentEditingDay, newExercise)

      // Reset form and go back to exercise list
      setNewExerciseName('')
      setNewExerciseCategory('compound')
      setNewExerciseMuscleGroups([])
      setShowCreateExercise(false)
    } catch (error) {
      console.error('Failed to create exercise:', error)
      alert('Failed to create exercise. Please try again.')
    } finally {
      setIsCreatingExercise(false)
    }
  }

  // Toggle muscle group selection
  const toggleMuscleGroup = (group: string) => {
    if (newExerciseMuscleGroups.includes(group)) {
      setNewExerciseMuscleGroups(newExerciseMuscleGroups.filter((g) => g !== group))
    } else {
      setNewExerciseMuscleGroups([...newExerciseMuscleGroups, group])
    }
  }

  // Save program
  const handleSaveProgram = async () => {
    if (!userProfile) return

    setIsSaving(true)
    try {
      // 1. Create program
      const program = await createProgram({
        user_id: userProfile.id,
        name: programBasics.name,
        description: programBasics.description,
        goal: programBasics.goal,
        difficulty: programBasics.difficulty || undefined,
        duration_weeks: programBasics.durationWeeks,
        days_per_week: programBasics.daysPerWeek,
        is_active: false,
      })

      // 2. Create workout days
      for (let i = 0; i < workoutDays.length; i++) {
        const dayData = workoutDays[i]
        const workoutDay = await createWorkoutDay({
          program_id: program.id,
          name: dayData.name,
          description: dayData.description,
          day_number: i + 1,
        })

        // 3. Create workout day exercises
        for (let j = 0; j < dayData.exercises.length; j++) {
          const exercise = dayData.exercises[j]
          await createWorkoutDayExercise({
            workout_day_id: workoutDay.id,
            exercise_id: exercise.exerciseId,
            exercise_order: j + 1,
            sets: exercise.sets.map((set) => ({
              type: set.type,
              targetWeight: set.targetWeight,
              targetReps: set.targetReps,
            })),
            rest_time: exercise.restTime,
            notes: exercise.notes,
          })
        }
      }

      // Navigate to home or programs page
      navigate('/')
    } catch (error) {
      console.error('Failed to save program:', error)
      alert('Failed to save program. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter exercises
  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  )

  const currentDayForExercises = workoutDays.find((d) => d.id === currentEditingDay)

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
            <h1 className="text-2xl font-bold flex-1">Create Program</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    step < currentStep
                      ? 'bg-white text-primary-purple-600'
                      : step === currentStep
                      ? 'bg-white text-primary-purple-600'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step < currentStep ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Label */}
          <p className="text-white/90 text-sm mt-3">
            {currentStep === 1 && 'Program Basics'}
            {currentStep === 2 && 'Workout Days'}
            {currentStep === 3 && 'Add Exercises'}
            {currentStep === 4 && 'Review & Save'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* STEP 1: Program Basics */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                value={programBasics.name}
                onChange={(e) =>
                  setProgramBasics({ ...programBasics, name: e.target.value })
                }
                placeholder="e.g., Push Pull Legs, Full Body Strength"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={programBasics.description}
                onChange={(e) =>
                  setProgramBasics({ ...programBasics, description: e.target.value })
                }
                placeholder="Describe your program..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Goal *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setProgramBasics({ ...programBasics, goal })}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold transition ${
                      programBasics.goal === goal
                        ? 'border-primary-purple-400 bg-purple-50 text-primary-purple-600'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setProgramBasics({ ...programBasics, difficulty: level })}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold capitalize transition ${
                      programBasics.difficulty === level
                        ? 'border-primary-purple-400 bg-purple-50 text-primary-purple-600'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  value={programBasics.durationWeeks}
                  onChange={(e) =>
                    setProgramBasics({
                      ...programBasics,
                      durationWeeks: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="52"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Days per Week
                </label>
                <input
                  type="number"
                  value={programBasics.daysPerWeek}
                  onChange={(e) =>
                    setProgramBasics({
                      ...programBasics,
                      daysPerWeek: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="7"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Workout Days */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {workoutDays.map((day, index) => (
              <div key={day.id} className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary-purple-600">{index + 1}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={day.name}
                      onChange={(e) =>
                        handleUpdateWorkoutDay(day.id, { name: e.target.value })
                      }
                      placeholder="Workout day name"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none font-semibold"
                    />

                    <textarea
                      value={day.description}
                      onChange={(e) =>
                        handleUpdateWorkoutDay(day.id, { description: e.target.value })
                      }
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none resize-none text-sm"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveWorkoutDay(day.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddWorkoutDay}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-primary-purple-400 hover:text-primary-purple-600 hover:bg-purple-50 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Workout Day
            </button>
          </div>
        )}

        {/* STEP 3: Add Exercises */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {workoutDays.map((day) => (
              <div key={day.id} className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-3">{day.name}</h3>

                {day.exercises.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-3">No exercises added yet</p>
                ) : (
                  <div className="space-y-3 mb-3">
                    {day.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {exercise.exerciseName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {exercise.sets.length} sets • {exercise.restTime}s rest
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveExercise(day.id, exercise.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-gray-600 w-12">
                                Set {setIndex + 1}
                              </span>
                              <select
                                value={set.type}
                                onChange={(e) => {
                                  const newSets = [...exercise.sets]
                                  newSets[setIndex].type = e.target.value as any
                                  handleUpdateExercise(day.id, exercise.id, { sets: newSets })
                                }}
                                className="px-2 py-1 rounded border border-gray-200 text-xs"
                              >
                                <option value="warmup">Warmup</option>
                                <option value="working">Working</option>
                                <option value="dropset">Dropset</option>
                              </select>
                              <input
                                type="number"
                                value={
                                  typeof set.targetReps === 'number'
                                    ? set.targetReps
                                    : set.targetReps.min
                                }
                                onChange={(e) => {
                                  const newSets = [...exercise.sets]
                                  newSets[setIndex].targetReps = parseInt(e.target.value) || 0
                                  handleUpdateExercise(day.id, exercise.id, { sets: newSets })
                                }}
                                placeholder="Reps"
                                className="w-16 px-2 py-1 rounded border border-gray-200"
                              />
                              <span className="text-gray-500">reps</span>
                              {exercise.sets.length > 1 && (
                                <button
                                  onClick={() =>
                                    handleRemoveSet(day.id, exercise.id, setIndex)
                                  }
                                  className="ml-auto p-1 text-gray-400 hover:text-red-600 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            onClick={() => handleAddSet(day.id, exercise.id)}
                            className="text-xs text-primary-purple-600 font-semibold hover:text-primary-purple-700"
                          >
                            + Add Set
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setCurrentEditingDay(day.id)
                    setShowExerciseModal(true)
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-semibold hover:border-primary-purple-400 hover:text-primary-purple-600 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </button>
              </div>
            ))}
          </div>
        )}

        {/* STEP 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Program Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{programBasics.name}</p>
                </div>
                {programBasics.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">{programBasics.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Goal</p>
                    <p className="font-semibold text-gray-900">{programBasics.goal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Difficulty</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {programBasics.difficulty}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {programBasics.durationWeeks} weeks
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days/Week</p>
                    <p className="font-semibold text-gray-900">{programBasics.daysPerWeek}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Workout Days</h2>
              {workoutDays.map((day, index) => (
                <div key={day.id} className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {index + 1}. {day.name}
                  </h3>
                  {day.description && (
                    <p className="text-sm text-gray-600 mb-3">{day.description}</p>
                  )}
                  <div className="space-y-2">
                    {day.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <Dumbbell className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{exercise.exerciseName}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{exercise.sets.length} sets</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && !canProceedFromStep1()) ||
                (currentStep === 2 && !canProceedFromStep2()) ||
                (currentStep === 3 && !canProceedFromStep3())
              }
              className="flex-1 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSaveProgram}
              disabled={isSaving}
              className="flex-1 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? 'Creating Program...' : 'Create Program'}
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Exercise Selection Modal */}
      {showExerciseModal && currentDayForExercises && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add Exercise</h2>
                <button
                  onClick={() => {
                    setShowExerciseModal(false)
                    setExerciseSearch('')
                    setCurrentEditingDay(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!showCreateExercise && (
                <>
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      placeholder="Search exercises..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none"
                    />
                  </div>

                  {/* Create New Exercise Button */}
                  <button
                    onClick={() => setShowCreateExercise(true)}
                    className="w-full py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Exercise
                  </button>
                </>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {showCreateExercise ? (
                /* Create Exercise Form */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Exercise Name *
                    </label>
                    <input
                      type="text"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder="e.g., Barbell Bench Press"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-purple-400 focus:outline-none transition"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setNewExerciseCategory(cat.value as any)}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                            newExerciseCategory === cat.value
                              ? 'bg-primary-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Muscle Groups (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map((group) => (
                        <button
                          key={group}
                          onClick={() => toggleMuscleGroup(group)}
                          className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${
                            newExerciseMuscleGroups.includes(group)
                              ? 'bg-primary-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCreateExercise(false)
                        setNewExerciseName('')
                        setNewExerciseCategory('compound')
                        setNewExerciseMuscleGroups([])
                      }}
                      disabled={isCreatingExercise}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateExercise}
                      disabled={isCreatingExercise || !newExerciseName.trim()}
                      className="flex-1 px-4 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isCreatingExercise ? 'Creating...' : 'Create & Add'}
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : isLoadingExercises ? (
                <div className="text-center py-8 text-gray-500">Loading exercises...</div>
              ) : filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {exerciseSearch ? 'No exercises found' : 'No exercises available'}
                </div>
              ) : (
                /* Exercise List */
                <div className="space-y-2">
                  {filteredExercises.map((exercise) => {
                    const isAdded = currentDayForExercises.exercises.some(
                      (ex) => ex.exerciseId === exercise.id
                    )

                    return (
                      <button
                        key={exercise.id}
                        onClick={() => !isAdded && handleAddExercise(currentDayForExercises.id, exercise)}
                        disabled={isAdded}
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${
                          isAdded
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-primary-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {exercise.name}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {exercise.category}
                              {exercise.muscle_groups.length > 0 &&
                                ` • ${exercise.muscle_groups.join(', ')}`}
                            </p>
                          </div>
                          {isAdded && (
                            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                              <Check className="w-4 h-4" />
                              Added
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
