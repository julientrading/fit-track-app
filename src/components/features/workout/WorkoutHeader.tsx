import { useState, useEffect } from 'react'
import { Pause, X } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface WorkoutHeaderProps {
  workoutName: string
  currentExercise: number
  totalExercises: number
  currentExerciseName: string
  currentSetGlobal: number // Which set overall (e.g., 5 out of 7 total)
  totalSets: number // Total sets across all exercises
  onPause?: () => void
  onFinish?: () => void
}

export const WorkoutHeader = ({
  workoutName,
  currentExercise,
  totalExercises,
  currentExerciseName,
  currentSetGlobal,
  totalSets,
  onPause,
  onFinish,
}: WorkoutHeaderProps) => {
  const [elapsedTime, setElapsedTime] = useState(0)

  // Timer that increments every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-primary text-white px-6 py-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold">{workoutName}</h1>
        <div className="flex items-center gap-3">
          <span className="text-lg font-mono">{formatDuration(elapsedTime)}</span>
          <button
            onClick={onPause}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
            aria-label="Pause workout"
          >
            <Pause className="w-5 h-5" />
          </button>
          <button
            onClick={onFinish}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
            aria-label="Finish workout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Dots - One dot per set */}
      <div className="flex items-center gap-1.5 justify-center flex-wrap px-4">
        {Array.from({ length: totalSets }).map((_, index) => {
          const isCompleted = index < currentSetGlobal
          const isCurrent = index === currentSetGlobal

          return (
            <div key={index} className="flex items-center">
              {/* Dot */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-3 h-3 bg-white ring-2 ring-white/50 scale-110'
                    : isCompleted
                      ? 'w-2.5 h-2.5 bg-white'
                      : 'w-2.5 h-2.5 bg-white/30'
                }`}
              />
              {/* Line connector (except after last dot) */}
              {index < totalSets - 1 && (
                <div
                  className={`w-6 h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-white' : 'bg-white/30'}`}
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-center text-sm mt-2 text-white/90 font-semibold">
        {currentExerciseName} {currentExercise + 1}/{totalExercises}
      </p>
    </div>
  )
}
