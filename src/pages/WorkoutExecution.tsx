import { useState } from 'react'
import { WorkoutHeader } from '@/components/features/workout/WorkoutHeader'
import { ExerciseInfo } from '@/components/features/workout/ExerciseInfo'
import { CurrentSetInfo } from '@/components/features/workout/CurrentSetInfo'
import { RestTimer } from '@/components/features/workout/RestTimer'
import { LogPerformance } from '@/components/features/workout/LogPerformance'
import { Button } from '@/components/ui'
import { mockWorkoutExecution } from '@/lib/mockData'

export const WorkoutExecution = () => {
  const [workout] = useState(mockWorkoutExecution)
  const currentExercise = workout.exercises[workout.currentExerciseIndex]
  const currentSet = currentExercise.sets[currentExercise.currentSetIndex]

  const handleCompleteSet = () => {
    alert('Set completed! (This will move to next set)')
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
    alert('Finish workout early?')
  }

  const handleWatchVideo = () => {
    alert('Watch form video')
  }

  const handleTimerComplete = () => {
    alert('Rest timer complete! Time for next set.')
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

      {/* Main Content */}
      <div className="pb-24 px-4 py-6">
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

        {/* Rest Timer */}
        <RestTimer
          defaultTime={currentExercise.restTime}
          onTimerComplete={handleTimerComplete}
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
    </div>
  )
}
