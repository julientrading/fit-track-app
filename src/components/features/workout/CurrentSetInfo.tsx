interface PersonalRecord {
  weight: number
  reps: number
}

interface CurrentSetInfoProps {
  setNumber: number
  totalSets: number
  setType: 'warmup' | 'working'
  targetWeight: number
  targetReps: { min?: number; max?: number; type: 'range' | 'failure' } | number
  lastWeight?: number
  lastReps?: number
  personalRecord?: PersonalRecord
  unit?: 'lbs' | 'kg'
}

export const CurrentSetInfo = ({
  setNumber,
  totalSets,
  setType,
  targetWeight,
  targetReps,
  lastWeight,
  lastReps,
  personalRecord,
  unit = 'lbs',
}: CurrentSetInfoProps) => {
  // Format target reps display
  const getTargetRepsDisplay = () => {
    if (typeof targetReps === 'number') {
      return `${targetReps} reps`
    }
    if (targetReps.type === 'failure') {
      return 'TO FAILURE'
    }
    if (targetReps.min && targetReps.max) {
      return `${targetReps.min}-${targetReps.max} reps`
    }
    return `${targetReps.min || targetReps.max} reps`
  }

  const getMotivationalText = () => {
    if (typeof targetReps === 'object' && targetReps.type === 'failure') {
      return "Give it everything you've got! 💪"
    }
    return 'You can do this! 💪'
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 mb-6">
      <div className="text-center mb-4">
        <p className="text-sm font-semibold text-purple-700 mb-1">
          {setType === 'warmup' ? 'WARM UP SET' : 'WORKING SET'} {setNumber} OF {totalSets}
        </p>
        <p className="text-4xl font-black text-gray-900 mb-2">{getTargetRepsDisplay()}</p>
        <p className="text-sm text-gray-600">{getMotivationalText()}</p>
      </div>

      {/* Target vs Last Performance */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">TARGET</p>
          <p className="text-2xl font-bold text-purple-900">
            {targetWeight} {unit}
          </p>
          <p className="text-sm text-gray-600">{getTargetRepsDisplay()}</p>
        </div>
        {lastWeight && lastReps && (
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">LAST TIME</p>
            <p className="text-2xl font-bold text-gray-900">
              {lastWeight} {unit}
            </p>
            <p className="text-sm text-gray-600">{lastReps} reps</p>
          </div>
        )}
      </div>

      {/* PR Display */}
      {personalRecord && (
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 text-center">
          <p className="text-xs text-yellow-700 font-semibold mb-1">🏆 PERSONAL RECORD</p>
          <p className="text-lg font-bold text-yellow-900">
            {personalRecord.weight} {unit} × {personalRecord.reps} reps
          </p>
        </div>
      )}
    </div>
  )
}
