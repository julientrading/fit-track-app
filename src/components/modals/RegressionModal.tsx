import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { ProgressionAnalysis, ProgressionChanges } from '@/types/database'

interface RegressionModalProps {
  analysis: ProgressionAnalysis
  onApply: (changes: ProgressionChanges) => Promise<void>
  onDismiss: () => void
}

export function RegressionModal({ analysis, onApply, onDismiss }: RegressionModalProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'weight' | 'reps' | 'keep' | null>(null)
  const [selectedValue, setSelectedValue] = useState<number | null>(null)

  const { recommendation, current, history } = analysis

  const handleApply = async () => {
    if (!selectedMethod || selectedMethod === 'keep') {
      await onApply({ method: 'keep_current' })
      onDismiss()
      return
    }

    if (selectedValue === null) {
      return
    }

    setIsApplying(true)
    try {
      const changes: ProgressionChanges = {
        method: selectedMethod,
      }

      if (selectedMethod === 'weight') {
        changes.weightIncrement = selectedValue
      } else if (selectedMethod === 'reps') {
        changes.repIncrement = selectedValue
      }

      await onApply(changes)
      onDismiss()
    } catch (error) {
      console.error('Failed to apply regression:', error)
      alert('Failed to apply changes. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-6 rounded-t-2xl">
          <div className="text-center">
            <div className="text-6xl mb-3">📉</div>
            <h1 className="text-2xl font-bold mb-2">Time to Adjust</h1>
            <p className="text-sm opacity-90">
              Your performance suggests a lighter load might help. Let's optimize! 💪
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Exercise Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">{analysis.exerciseName}</h2>

          {/* Current Target */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">CURRENT TARGET</p>
            <div className="text-center mb-3">
              <p className="text-3xl font-black text-gray-900 mb-1">{current.weight} kg</p>
              <p className="text-lg font-semibold text-gray-700">
                {current.reps} reps × {current.sets} sets (failing)
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Recent workouts:</span>
              </div>
              {history.slice(0, 2).map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-orange-600 font-bold">
                    {entry.actualReps} reps ⚠️
                  </span>
                  {idx === 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold">
                      Today
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Regression Detected */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="font-bold text-orange-900">Regression Detected</h3>
            </div>
            <p className="text-sm text-orange-800">
              You're not hitting target reps. Let's find a sustainable weight.
            </p>
          </div>

          {/* Recommended Adjustments */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Recommended adjustment:</h3>

            {/* DECREASE WEIGHT */}
            {recommendation?.weightOptions && (
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">DECREASE WEIGHT:</p>
                <div className="grid grid-cols-2 gap-2">
                  {recommendation.weightOptions.map((option) => (
                    <button
                      key={option.increment}
                      onClick={() => {
                        setSelectedMethod('weight')
                        setSelectedValue(option.increment)
                      }}
                      className={`border-2 rounded-lg p-3 transition ${
                        selectedMethod === 'weight' && selectedValue === option.increment
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                      }`}
                    >
                      <p className="font-bold text-purple-600">{option.increment} kg</p>
                      <p className="text-xs text-gray-600">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-gray-500 font-semibold mb-4">OR</p>

            {/* LOWER REP TARGET */}
            {recommendation?.repOptions && (
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">LOWER REP TARGET:</p>
                <div className="grid grid-cols-2 gap-2">
                  {recommendation.repOptions.map((option) => (
                    <button
                      key={option.increment}
                      onClick={() => {
                        setSelectedMethod('reps')
                        setSelectedValue(option.increment)
                      }}
                      className={`border-2 rounded-lg p-3 transition ${
                        selectedMethod === 'reps' && selectedValue === option.increment
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <p className="font-bold text-blue-600">{option.increment} rep{Math.abs(option.increment) > 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-600">Target {option.newReps} reps</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-gray-500 font-semibold mb-4">OR</p>

            {/* INCREASE RECOVERY */}
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">INCREASE RECOVERY:</p>
              <button
                onClick={() => alert('This would add an extra rest day before this exercise in your program schedule')}
                className="w-full border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 rounded-lg p-3 transition text-left"
              >
                <p className="font-bold text-orange-600">Add Extra Rest Day</p>
                <p className="text-xs text-gray-600">Before next {analysis.exerciseName} session</p>
              </button>
            </div>

            {/* Keep Current (Not Recommended) */}
            <button
              onClick={() => {
                setSelectedMethod('keep')
                setSelectedValue(0)
              }}
              className={`w-full border-2 font-semibold py-3 rounded-lg transition ${
                selectedMethod === 'keep'
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              Keep Current Weight (Not Recommended)
            </button>
          </div>

          {/* Recovery Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-900 text-sm mb-1">Recovery Note</p>
                <p className="text-xs text-yellow-800">
                  Consistent inability to hit targets may indicate you need more recovery time or the weight is too heavy. Listen to your body and don't be afraid to reduce weight temporarily.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <button
            onClick={handleApply}
            disabled={isApplying || selectedMethod === null}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? 'Applying...' : 'Apply Changes ✓'}
          </button>
          <button
            onClick={onDismiss}
            disabled={isApplying}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Review Later
          </button>
        </div>
      </div>
    </div>
  )
}
