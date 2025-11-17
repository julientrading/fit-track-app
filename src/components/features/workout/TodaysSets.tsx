import { Check } from 'lucide-react'

interface SetItem {
  exerciseName: string
  setNumber: number
  targetWeight: number
  targetReps: number | string
  status: 'completed' | 'current' | 'pending'
  unit: string
}

interface TodaysSetsProps {
  sets: SetItem[]
}

export const TodaysSets = ({ sets }: TodaysSetsProps) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Sets</h3>

      <div className="space-y-2">
        {sets.map((set, index) => {
          const isCompleted = set.status === 'completed'
          const isCurrent = set.status === 'current'

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-primary-purple-100 border-2 border-primary-purple-500'
                  : isCompleted
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              {/* Checkbox/Status Icon */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                      ? 'bg-primary-purple-600 ring-2 ring-primary-purple-300'
                      : 'bg-gray-300'
                }`}
              >
                {isCompleted && <Check className="w-4 h-4 text-white" />}
                {isCurrent && (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                )}
              </div>

              {/* Set Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-sm truncate ${
                    isCurrent ? 'text-primary-purple-900' : 'text-gray-900'
                  }`}
                >
                  {set.exerciseName}
                </p>
                <p
                  className={`text-xs ${
                    isCurrent ? 'text-primary-purple-700' : 'text-gray-600'
                  }`}
                >
                  Set {set.setNumber}
                </p>
              </div>

              {/* Weight & Reps */}
              <div className="flex-shrink-0 text-right">
                <p
                  className={`font-bold text-sm ${
                    isCurrent
                      ? 'text-primary-purple-900'
                      : isCompleted
                        ? 'text-green-700'
                        : 'text-gray-700'
                  }`}
                >
                  {set.targetWeight} {set.unit}
                </p>
                <p
                  className={`text-xs ${
                    isCurrent
                      ? 'text-primary-purple-700'
                      : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500'
                  }`}
                >
                  {typeof set.targetReps === 'number'
                    ? `${set.targetReps} reps`
                    : set.targetReps}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
