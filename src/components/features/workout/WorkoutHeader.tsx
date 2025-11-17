import { useState, useEffect } from 'react'
import { Pause, X } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface WorkoutHeaderProps {
  workoutName: string
  currentExercise: number
  totalExercises: number
  onPause?: () => void
  onFinish?: () => void
}

export const WorkoutHeader = ({
  workoutName,
  currentExercise,
  totalExercises,
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

      {/* Progress Dots */}
      <div className="flex items-center gap-2 justify-center">
        {Array.from({ length: totalExercises }).map((_, index) => {
          const isCompleted = index < currentExercise
          const isCurrent = index === currentExercise
          const isUpcoming = index > currentExercise

          return (
            <div key={index} className="flex items-center">
              {/* Dot */}
              <div
                className={`rounded-full transition-all ${
                  isCurrent
                    ? 'w-4 h-4 bg-white ring-4 ring-white/50'
                    : isCompleted
                      ? 'w-3 h-3 bg-white'
                      : 'w-3 h-3 bg-white/30'
                }`}
              />
              {/* Line connector (except after last dot) */}
              {index < totalExercises - 1 && (
                <div
                  className={`w-8 h-0.5 ${isCompleted ? 'bg-white' : 'bg-white/30'}`}
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-center text-xs mt-2 text-white/80">
        Exercise {currentExercise + 1} of {totalExercises}
      </p>
    </div>
  )
}
