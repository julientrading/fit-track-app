import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui'

interface Exercise {
  name: string
  sets: number
}

interface NextWorkoutCardProps {
  name: string
  estimatedDuration: number
  currentDay: number
  totalDays: number
  allExercises: Exercise[]
  onStartWorkout?: () => void
}

export const NextWorkoutCard = ({
  name,
  estimatedDuration,
  currentDay,
  totalDays,
  allExercises,
  onStartWorkout,
}: NextWorkoutCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Show first 3 exercises when collapsed
  const previewCount = 3
  const displayedExercises = isExpanded ? allExercises : allExercises.slice(0, previewCount)
  const hasMore = allExercises.length > previewCount

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Next Workout</h2>
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{name}</h3>
              <p className="text-sm opacity-90">
                {allExercises.length} exercises • ~{estimatedDuration} min
              </p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
              Day {currentDay}/{totalDays}
            </div>
          </div>

          {/* Exercise Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold mb-2 opacity-80">TODAY'S EXERCISES</p>
            <div className="space-y-1 text-sm">
              {displayedExercises.map((exercise, index) => (
                <div key={index} className="flex justify-between">
                  <span>• {exercise.name}</span>
                  <span className="opacity-80">{exercise.sets} sets</span>
                </div>
              ))}

              {/* Expand/Collapse Button */}
              {hasMore && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100 transition mt-2 w-full"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={14} />
                      <span>Show less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      <span>+{allExercises.length - previewCount} more exercises</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <Button
            onClick={onStartWorkout}
            fullWidth
            size="lg"
            className="bg-white text-blue-600 hover:bg-white hover:shadow-xl hover:scale-105"
          >
            Start Workout 🚀
          </Button>
        </div>
      </div>
    </div>
  )
}
