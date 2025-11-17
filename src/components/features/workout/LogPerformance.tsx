import { useState } from 'react'

interface LogPerformanceProps {
  defaultWeight?: number
  defaultReps?: number
  defaultRpe?: number
  unit?: 'lbs' | 'kg'
  onUnitChange?: (unit: 'lbs' | 'kg') => void
  onChange?: (data: { weight: number; reps: number; rpe: number }) => void
}

export const LogPerformance = ({
  defaultWeight = 0,
  defaultReps = 0,
  defaultRpe = 7,
  unit = 'lbs',
  onUnitChange,
  onChange,
}: LogPerformanceProps) => {
  const [weight, setWeight] = useState(defaultWeight)
  const [reps, setReps] = useState(defaultReps)
  const [rpe, setRpe] = useState(defaultRpe)
  const [currentUnit, setCurrentUnit] = useState(unit)

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setWeight(numValue)
    onChange?.({ weight: numValue, reps, rpe })
  }

  const handleRepsChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setReps(numValue)
    onChange?.({ weight, reps: numValue, rpe })
  }

  const handleRpeChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setRpe(numValue)
    onChange?.({ weight, reps, rpe: numValue })
  }

  const handleUnitChange = (newUnit: 'lbs' | 'kg') => {
    setCurrentUnit(newUnit)
    onUnitChange?.(newUnit)
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Log Your Performance</h3>

      <div className="space-y-4">
        {/* Weight Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder="0"
              className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-300 rounded-lg text-2xl font-bold text-center focus:border-primary-purple-500 focus:outline-none"
            />
            <select
              value={currentUnit}
              onChange={(e) => handleUnitChange(e.target.value as 'lbs' | 'kg')}
              className="w-20 px-2 py-3 border-2 border-gray-300 rounded-lg font-semibold text-center focus:border-primary-purple-500 focus:outline-none"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        {/* Reps Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reps Completed
          </label>
          <input
            type="number"
            value={reps || ''}
            onChange={(e) => handleRepsChange(e.target.value)}
            placeholder="How many?"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-2xl font-bold text-center focus:border-primary-purple-500 focus:outline-none"
          />
        </div>

        {/* RPE Slider */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            How did it feel?
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 whitespace-nowrap">Too Easy</span>
            <input
              type="range"
              min="0"
              max="10"
              value={rpe}
              onChange={(e) => handleRpeChange(e.target.value)}
              className="flex-1 accent-primary-purple-600"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">Max Effort</span>
          </div>
          <p className="text-center text-sm text-primary-purple-600 font-semibold mt-2">
            {rpe} / 10
          </p>
        </div>
      </div>
    </div>
  )
}
