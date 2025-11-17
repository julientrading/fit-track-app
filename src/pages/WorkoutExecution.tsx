import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { WorkoutHeader } from '@/components/features/workout/WorkoutHeader'
import { ExerciseInfo } from '@/components/features/workout/ExerciseInfo'
import { CurrentSetInfo } from '@/components/features/workout/CurrentSetInfo'
import { RestTimerModal } from '@/components/features/workout/RestTimerModal'
import { LogPerformance } from '@/components/features/workout/LogPerformance'
import { Button } from '@/components/ui'
import { mockWorkoutExecution } from '@/lib/mockData'

export const WorkoutExecution = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [workout] = useState(mockWorkoutExecution)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const currentExercise = workout.exercises[workout.currentExerciseIndex]
  const currentSet = currentExercise.sets[currentExercise.currentSetIndex]

  // Get next set preview (could be next set in same exercise or first set of next exercise)
  const getNextSetPreview = () => {
    const nextSetIndex = currentExercise.currentSetIndex + 1
    if (nextSetIndex < currentExercise.sets.length) {
      // Next set in same exercise
      const nextSet = currentExercise.sets[nextSetIndex]
      return {
        exerciseName: currentExercise.name,
        setNumber: nextSet.setNumber,
        totalSets: currentExercise.sets.filter((s) => s.type === 'working').length,
        targetWeight: nextSet.targetWeight,
        targetReps: nextSet.targetReps,
        lastWeight: nextSet.lastWeight,
        lastReps: nextSet.lastReps,
        personalRecord: nextSet.personalRecord,
      }
    } else {
      // Next exercise
      const nextExerciseIndex = workout.currentExerciseIndex + 1
      if (nextExerciseIndex < workout.exercises.length) {
        const nextExercise = workout.exercises[nextExerciseIndex]
        const firstSet = nextExercise.sets[0]
        return {
          exerciseName: nextExercise.name,
          setNumber: firstSet.setNumber,
          totalSets: nextExercise.sets.filter((s) => s.type === 'working').length,
          targetWeight: firstSet.targetWeight,
          targetReps: firstSet.targetReps,
          lastWeight: firstSet.lastWeight,
          lastReps: firstSet.lastReps,
          personalRecord: firstSet.personalRecord,
        }
      }
    }
    // Fallback if no next set
    return {
      exerciseName: 'Workout Complete!',
      setNumber: 0,
      totalSets: 0,
      targetWeight: 0,
      targetReps: 0,
    }
  }

  const handleCompleteSet = () => {
    setShowRestTimer(true)
  }

  const handleRestTimerClose = () => {
    setShowRestTimer(false)
    // Here we would move to the next set/exercise
    alert('Moving to next set/exercise...')
  }

  const handleRestTimerComplete = () => {
    alert('Rest complete! Ready for next set.')
  }

  const handleSkipExercise = () => {
    alert('Skip exercise? (This will move to next exercise)')
  }

  const handleEditTargets = () => {
    alert('Edit targets for this exercise')
  }

  const handleAddNote = () => {
    alert('Add note for this set')
  }

  const handlePause = () => {
    alert('Pause workout?')
  }

  const handleFinish = () => {
    // TODO: Save workout data to database before navigating
    navigate(`/workout/${id}/complete`)
  }

  const handleWatchVideo = () => {
    alert('Watch form video')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workout Header */}
      <WorkoutHeader
        workoutName={workout.name}
        currentExercise={workout.currentExerciseIndex}
        totalExercises={workout.exercises.length}
        onPause={handlePause}
        onFinish={handleFinish}
      />

      {/* Main Content - max-width for desktop/tablet */}
      <div className="max-w-4xl mx-auto pb-24 px-4 py-6">
        {/* Exercise Info */}
        <ExerciseInfo
          name={currentExercise.name}
          category={currentExercise.category}
          muscleGroup={currentExercise.muscleGroup}
          videoUrl={currentExercise.videoUrl}
          onWatchVideo={handleWatchVideo}
        />

        {/* Current Set Info */}
        <CurrentSetInfo
          setNumber={currentSet.setNumber}
          totalSets={currentExercise.sets.filter((s) => s.type === 'working').length}
          setType={currentSet.type}
          targetWeight={currentSet.targetWeight}
          targetReps={currentSet.targetReps}
          lastWeight={currentSet.lastWeight}
          lastReps={currentSet.lastReps}
          personalRecord={currentSet.personalRecord}
          unit="lbs"
        />

        {/* Log Performance */}
        <LogPerformance
          defaultWeight={currentSet.targetWeight}
          defaultReps={
            typeof currentSet.targetReps === 'number'
              ? currentSet.targetReps
              : currentSet.targetReps.min || 0
          }
          defaultRpe={7}
          unit="lbs"
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
          className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-3 rounded-xl hover:border-primary-purple-400 hover:text-primary-purple-600 hover:bg-purple-50 transition mb-20"
        >
          + Add Note for This Set
        </button>
      </div>

      {/* Rest Timer Modal - appears after completing a set */}
      <RestTimerModal
        isOpen={showRestTimer}
        onClose={handleRestTimerClose}
        restTime={currentExercise.restTime}
        nextSetPreview={getNextSetPreview()}
        onComplete={handleRestTimerComplete}
      />
    </div>
  )
}
