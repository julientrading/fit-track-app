import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import type { ProgressionAnalysis, ProgressionChanges } from '@/types/database'

interface ProgressionModalProps {
  analysis: ProgressionAnalysis
  onApply: (changes: ProgressionChanges) => Promise<void>
  onDismiss: () => void
}

export function ProgressionModal({ analysis, onApply, onDismiss }: ProgressionModalProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'weight' | 'reps' | 'volume' | 'keep' | null>(null)
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
      } else if (selectedMethod === 'volume') {
        changes.setIncrement = selectedValue
      }

      await onApply(changes)
      onDismiss()
    } catch (error) {
      console.error('Failed to apply progression:', error)
      alert('Failed to apply changes. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-6 rounded-t-2xl">
          <div className="text-center">
            <div className="text-6xl mb-3">📈</div>
            <h1 className="text-2xl font-bold mb-2">Ready to Progress!</h1>
            <p className="text-sm opacity-90">
              You've hit your targets consistently. Time to level up! 💪
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Exercise Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">{analysis.exerciseName}</h2>

          {/* Current Performance */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">CURRENT PERFORMANCE</p>
            <div className="text-center mb-3">
              <p className="text-3xl font-black text-gray-900 mb-1">{current.weight} kg</p>
              <p className="text-lg font-semibold text-gray-700">
                {current.reps} reps × {current.sets} sets
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last {history.length} workouts:</span>
              </div>
              {history.slice(-2).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`font-bold ${entry.success ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.actualReps} reps {entry.success ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Threshold Met */}
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✅</span>
              <h3 className="font-bold text-green-900">Progression Threshold Met!</h3>
            </div>
            <p className="text-sm text-green-800">{analysis.triggerReason}</p>
          </div>

          {/* Progression Options */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">How would you like to progress?</h3>

            {/* INCREASE WEIGHT */}
            {recommendation?.weightOptions && (
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">INCREASE WEIGHT:</p>
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
                      <p className="font-bold text-purple-600">+{option.increment} kg</p>
                      <p className="text-xs text-gray-600">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-gray-500 font-semibold mb-4">OR</p>

            {/* INCREASE REPS */}
            {recommendation?.repOptions && (
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">INCREASE REPS:</p>
                <div className="grid grid-cols-3 gap-2">
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
                      <p className="font-bold text-blue-600">+{option.increment} rep{option.increment > 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-600">{option.newReps} reps</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-gray-500 font-semibold mb-4">OR</p>

            {/* INCREASE VOLUME */}
            {recommendation?.volumeOptions && (
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">INCREASE VOLUME:</p>
                <div className="grid grid-cols-2 gap-2">
                  {recommendation.volumeOptions.map((option) => (
                    <button
                      key={option.increment}
                      onClick={() => {
                        setSelectedMethod('volume')
                        setSelectedValue(option.increment)
                      }}
                      className={`border-2 rounded-lg p-3 transition ${
                        selectedMethod === 'volume' && selectedValue === option.increment
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                      }`}
                    >
                      <p className="font-bold text-orange-600">+{option.increment} set{option.increment > 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-600">{option.newSets} total sets</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keep Current */}
            <button
              onClick={() => {
                setSelectedMethod('keep')
                setSelectedValue(0)
              }}
              className={`w-full border-2 font-semibold py-3 rounded-lg transition ${
                selectedMethod === 'keep'
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Keep Current Weight & Reps
            </button>
          </div>

          {/* Progression Tip */}
          {recommendation?.suggested && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-bold text-blue-900 text-sm mb-1">Progression Tip</p>
                  <p className="text-xs text-blue-800">{recommendation.suggested.reasoning}</p>
                </div>
              </div>
            </div>
          )}
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
