import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WorkoutHeader } from '@/components/features/workout/WorkoutHeader'
import { ExerciseInfo } from '@/components/features/workout/ExerciseInfo'
import { CurrentSetInfo } from '@/components/features/workout/CurrentSetInfo'
import { RestTimerModal } from '@/components/features/workout/RestTimerModal'
import { LogPerformance } from '@/components/features/workout/LogPerformance'
import { TodaysSets } from '@/components/features/workout/TodaysSets'
import { Button, Toast } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import {
  getWorkoutDayById,
  getWorkoutDayExercises,
  createWorkoutLog,
  createExerciseLog,
  createSet,
  completeWorkout,
} from '@/lib/database'
import type { WorkoutDay, WorkoutDayExercise, Exercise, WorkoutLog, ExerciseLog } from '@/types/database'

// Extended type to include exercise details
type WorkoutExercise = WorkoutDayExercise & {
  exercise: Exercise
}

interface PerformanceData {
  weight: number
  reps: number
  rpe: number
}

export const WorkoutExecution = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { authUser, userProfile } = useAuthStore()

  // Ref to prevent double initialization in React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  // Workout data
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null)
  const [exerciseLogs, setExerciseLogs] = useState<Map<string, ExerciseLog>>(new Map())

  // Tracking state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set())

  // Performance tracking
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    weight: 0,
    reps: 0,
    rpe: 7,
  })

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'info' | 'celebration'>('success')

  // Load workout data on mount
  useEffect(() => {
    if (!id || !authUser) return

    const loadWorkoutData = async () => {
      // Guard against double initialization (React Strict Mode)
      if (isInitializing.current || hasInitialized.current) {
        console.log('🚫 Workout already initializing or initialized, skipping...')
        return
      }

      try {
        isInitializing.current = true
        setIsLoading(true)
        setError(null)

        // Fetch workout day and exercises in parallel
        const [workoutDayData, exercisesData] = await Promise.all([
          getWorkoutDayById(id),
          getWorkoutDayExercises(id),
        ])

        if (!workoutDayData) {
          throw new Error('Workout not found')
        }

        setWorkoutDay(workoutDayData)
        setExercises(exercisesData as WorkoutExercise[])

        // Create workout log
        console.log('🏋️ Creating workout log for user:', authUser.id)
        const log = await createWorkoutLog({
          user_id: authUser.id,
          program_id: null, // We'll need to get this from workout_day in a future enhancement
          workout_day_id: id,
          name: workoutDayData.name,
          started_at: new Date().toISOString(),
          status: 'in_progress',
          xp_earned: 0,
          notes: null,
          completed_at: null,
          duration_seconds: null,
          feeling: null,
        })
        console.log('✅ Workout log created:', log.id)

        setWorkoutLog(log)

        // Initialize performance data with first set target
        if (exercisesData.length > 0 && exercisesData[0].sets.length > 0) {
          const firstSet = exercisesData[0].sets[0]
          setPerformanceData({
            weight: firstSet.targetWeight,
            reps: typeof firstSet.targetReps === 'number' ? firstSet.targetReps : firstSet.targetReps.min || 0,
            rpe: 7,
          })
        }

        // Mark as initialized
        hasInitialized.current = true
        isInitializing.current = false
      } catch (err) {
        console.error('Failed to load workout:', err)
        setError(err instanceof Error ? err.message : 'Failed to load workout')
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutData()
  }, [id, authUser])

  // Update performance data when set changes
  useEffect(() => {
    if (exercises.length === 0) return

    const currentExercise = exercises[currentExerciseIndex]
    if (!currentExercise || !currentExercise.sets[currentSetIndex]) return

    const currentSet = currentExercise.sets[currentSetIndex]

    let targetReps = 0
    if (typeof currentSet.targetReps === 'number') {
      targetReps = currentSet.targetReps
    } else if ('min' in currentSet.targetReps) {
      targetReps = currentSet.targetReps.min
    }

    setPerformanceData({
      weight: currentSet.targetWeight,
      reps: targetReps,
      rpe: 7,
    })
  }, [currentExerciseIndex, currentSetIndex, exercises])

  const getCurrentExercise = () => exercises[currentExerciseIndex]
  const getCurrentSet = () => {
    const exercise = getCurrentExercise()
    return exercise?.sets[currentSetIndex]
  }

  // Calculate total sets across all exercises
  const getTotalSets = () => {
    return exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
  }

  // Calculate current global set index (0-based)
  const getCurrentSetGlobal = () => {
    let setIndex = 0
    for (let i = 0; i < currentExerciseIndex; i++) {
      setIndex += exercises[i].sets.length
    }
    setIndex += currentSetIndex
    return setIndex
  }

  // Build Today's Sets data
  const getTodaysSetsData = () => {
    const allSets: Array<{
      exerciseName: string
      setNumber: number
      targetWeight: number
      targetReps: number | string
      status: 'completed' | 'current' | 'pending'
      unit: string
    }> = []

    let globalSetIndex = 0

    exercises.forEach((exercise) => {
      exercise.sets.forEach((set, setIndex) => {
        const isCompleted = globalSetIndex < getCurrentSetGlobal()
        const isCurrent = globalSetIndex === getCurrentSetGlobal()

        let repsDisplay: number | string
        if (typeof set.targetReps === 'number') {
          repsDisplay = set.targetReps
        } else if ('min' in set.targetReps) {
          repsDisplay = `${set.targetReps.min}-${set.targetReps.max}`
        } else {
          repsDisplay = 'To failure'
        }

        allSets.push({
          exerciseName: exercise.exercise.name,
          setNumber: setIndex + 1,
          targetWeight: set.targetWeight,
          targetReps: repsDisplay,
          status: isCompleted ? 'completed' : isCurrent ? 'current' : 'pending',
          unit: userProfile?.preferred_unit || 'lbs',
        })

        globalSetIndex++
      })
    })

    return allSets
  }

  // Get next set preview for rest timer
  const getNextSetPreview = () => {
    const currentExercise = getCurrentExercise()
    if (!currentExercise) return null

    const nextSetIndex = currentSetIndex + 1

    // Check if there's another set in current exercise
    if (nextSetIndex < currentExercise.sets.length) {
      const nextSet = currentExercise.sets[nextSetIndex]

      let targetReps = 0
      if (typeof nextSet.targetReps === 'number') {
        targetReps = nextSet.targetReps
      } else if ('min' in nextSet.targetReps) {
        targetReps = nextSet.targetReps.min
      }

      return {
        exerciseName: currentExercise.exercise.name,
        setNumber: nextSetIndex + 1,
        totalSets: currentExercise.sets.filter((s) => s.type === 'working').length,
        targetWeight: nextSet.targetWeight,
        targetReps,
      }
    }

    // Check if there's another exercise
    const nextExerciseIndex = currentExerciseIndex + 1
    if (nextExerciseIndex < exercises.length) {
      const nextExercise = exercises[nextExerciseIndex]
      const firstSet = nextExercise.sets[0]

      let targetReps = 0
      if (typeof firstSet.targetReps === 'number') {
        targetReps = firstSet.targetReps
      } else if ('min' in firstSet.targetReps) {
        targetReps = firstSet.targetReps.min
      }

      return {
        exerciseName: nextExercise.exercise.name,
        setNumber: 1,
        totalSets: nextExercise.sets.filter((s) => s.type === 'working').length,
        targetWeight: firstSet.targetWeight,
        targetReps,
      }
    }

    // Workout complete
    return {
      exerciseName: 'Workout Complete!',
      setNumber: 0,
      totalSets: 0,
      targetWeight: 0,
      targetReps: 0,
    }
  }

  const handleCompleteSet = async () => {
    if (!workoutLog || !authUser) {
      console.error('Missing required data:', { workoutLog, authUser })
      alert('Error: Not logged in or workout not started')
      return
    }

    const currentExercise = getCurrentExercise()
    const currentSet = getCurrentSet()
    if (!currentExercise || !currentSet) {
      console.error('Missing exercise or set data')
      return
    }

    console.log('💾 Starting to save set...', {
      workoutLogId: workoutLog.id,
      userId: authUser.id,
      exerciseId: currentExercise.exercise_id,
      setNumber: currentSetIndex + 1,
      performance: performanceData,
    })

    try {
      // Create exercise log if it doesn't exist for this exercise
      let exerciseLog = exerciseLogs.get(currentExercise.id)

      if (!exerciseLog) {
        console.log('📝 Creating exercise log...')
        exerciseLog = await createExerciseLog({
          workout_log_id: workoutLog.id,
          exercise_id: currentExercise.exercise_id,
          exercise_order: currentExercise.exercise_order,
          exercise_name: currentExercise.exercise.name,
          notes: null,
        })
        console.log('✅ Exercise log created:', exerciseLog.id)

        setExerciseLogs(new Map(exerciseLogs.set(currentExercise.id, exerciseLog)))
      } else {
        console.log('📋 Using existing exercise log:', exerciseLog.id)
      }

      // Save the set to database
      console.log('💪 Saving set to database...')
      const savedSet = await createSet({
        exercise_log_id: exerciseLog.id,
        user_id: authUser.id,
        exercise_id: currentExercise.exercise_id,
        set_number: currentSetIndex + 1,
        set_type: currentSet.type === 'warmup' ? 'warmup' : 'working',
        weight: performanceData.weight,
        reps: performanceData.reps,
        rpe: performanceData.rpe,
        completed: true,
        notes: null,
        time_seconds: null,
        distance: null,
      })
      console.log('✅ Set saved successfully!', savedSet)

      // Mark set as completed
      const setKey = `${currentExerciseIndex}-${currentSetIndex}`
      setCompletedSets(new Set(completedSets.add(setKey)))

      // Show rest timer
      setShowRestTimer(true)
    } catch (err) {
      console.error('❌ Failed to save set:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save set'
      setError(errorMessage)
      alert(`Error saving set: ${errorMessage}\n\nCheck the console for details.`)
    }
  }

  const handleRestTimerClose = () => {
    setShowRestTimer(false)
    moveToNextSet()
    // Scroll to top so user can see the workout header and next set
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRestTimerComplete = () => {
    // Just close and move to next set
    handleRestTimerClose()
  }

  const moveToNextSet = () => {
    const currentExercise = getCurrentExercise()
    if (!currentExercise) return

    const nextSetIndex = currentSetIndex + 1

    // Check if there's another set in current exercise
    if (nextSetIndex < currentExercise.sets.length) {
      setCurrentSetIndex(nextSetIndex)
      // Show toast for next set in same exercise
      setToastMessage(`Set ${nextSetIndex + 1} - Let's go!`)
      setToastType('success')
    } else {
      // Move to next exercise
      const nextExerciseIndex = currentExerciseIndex + 1
      if (nextExerciseIndex < exercises.length) {
        const nextExercise = exercises[nextExerciseIndex]
        setCurrentExerciseIndex(nextExerciseIndex)
        setCurrentSetIndex(0)
        // Show celebration toast for completing exercise
        setToastMessage(`Exercise Complete! Moving to ${nextExercise.exercise.name}`)
        setToastType('celebration')
      } else {
        // Workout complete!
        handleFinish()
      }
    }
  }

  const handleSkipExercise = () => {
    const nextExerciseIndex = currentExerciseIndex + 1
    if (nextExerciseIndex < exercises.length) {
      setCurrentExerciseIndex(nextExerciseIndex)
      setCurrentSetIndex(0)
    } else {
      handleFinish()
    }
  }

  const handleEditTargets = () => {
    alert('Edit targets for this exercise (coming soon)')
  }

  const handleAddNote = () => {
    alert('Add note for this set (coming soon)')
  }

  const handlePause = () => {
    const confirmed = window.confirm('Pause workout? Your progress will be saved.')
    if (confirmed) {
      navigate('/')
    }
  }

  const handleFinish = async () => {
    if (!workoutLog) return

    try {
      // Mark workout as completed
      await completeWorkout(workoutLog.id)
      // Navigate to completion page with workout_log_id (not workout_day_id)
      navigate(`/workout/${workoutLog.id}/complete`)
    } catch (err) {
      console.error('Failed to complete workout:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete workout')
    }
  }

  const handleWatchVideo = () => {
    const currentExercise = getCurrentExercise()
    if (currentExercise?.exercise.video_url) {
      window.open(currentExercise.exercise.video_url, '_blank')
    } else {
      alert('No video available for this exercise')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workout...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !workoutDay || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No exercises found in this workout'}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const currentExercise = getCurrentExercise()
  const currentSet = getCurrentSet()

  if (!currentExercise || !currentSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Invalid exercise or set</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Workout Header */}
      <WorkoutHeader
        workoutName={workoutDay.name}
        currentExercise={currentExerciseIndex}
        totalExercises={exercises.length}
        currentExerciseName={currentExercise.exercise.name}
        currentSetGlobal={getCurrentSetGlobal()}
        totalSets={getTotalSets()}
        onPause={handlePause}
        onFinish={handleFinish}
      />

      {/* Main Content - max-width for desktop/tablet */}
      <div className="max-w-4xl mx-auto pb-24 px-4 py-6">
        {/* Exercise Info */}
        <ExerciseInfo
          name={currentExercise.exercise.name}
          category={currentExercise.exercise.category}
          muscleGroup={currentExercise.exercise.muscle_groups[0] || 'Unknown'}
          videoUrl={currentExercise.exercise.video_url}
          onWatchVideo={handleWatchVideo}
        />

        {/* Current Set Info */}
        <CurrentSetInfo
          setNumber={currentSetIndex + 1}
          totalSets={currentExercise.sets.filter((s) => s.type === 'working').length}
          setType={currentSet.type === 'dropset' ? 'working' : currentSet.type}
          targetWeight={currentSet.targetWeight}
          targetReps={performanceData.reps}
          unit={userProfile?.preferred_unit || 'lbs'}
        />

        {/* Log Performance */}
        <LogPerformance
          defaultWeight={performanceData.weight}
          defaultReps={performanceData.reps}
          defaultRpe={performanceData.rpe}
          unit={userProfile?.preferred_unit || 'lbs'}
          onChange={setPerformanceData}
        />

        {/* Complete Set Button */}
        <Button
          onClick={handleCompleteSet}
          fullWidth
          size="lg"
          variant="primary"
          className="mb-3"
        >
          Complete Set ✓
        </Button>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button onClick={handleSkipExercise} variant="outline" fullWidth>
            Skip Exercise
          </Button>
          <Button onClick={handleEditTargets} variant="outline" fullWidth>
            Edit Targets
          </Button>
        </div>

        {/* Add Note Button */}
        <button
          onClick={handleAddNote}
          className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-3 rounded-xl hover:border-primary-purple-400 hover:text-primary-purple-600 hover:bg-purple-50 transition mb-6"
        >
          + Add Note for This Set
        </button>

        {/* Today's Sets */}
        <TodaysSets sets={getTodaysSetsData()} />
      </div>

      {/* Rest Timer Modal - appears after completing a set */}
      {showRestTimer && getNextSetPreview() && (
        <RestTimerModal
          isOpen={showRestTimer}
          onClose={handleRestTimerClose}
          restTime={currentExercise.rest_time}
          nextSetPreview={getNextSetPreview()!}
          onComplete={handleRestTimerComplete}
        />
      )}
    </div>
  )
}
