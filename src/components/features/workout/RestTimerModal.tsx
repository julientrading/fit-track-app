import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui'

interface NextSetPreview {
  exerciseName: string
  setNumber: number
  totalSets: number
  targetWeight: number
  targetReps: { min?: number; max?: number; type: 'range' | 'failure' } | number
  lastWeight?: number
  lastReps?: number
  personalRecord?: { weight: number; reps: number }
  unit?: 'lbs' | 'kg'
}

interface RestTimerModalProps {
  isOpen: boolean
  onClose: () => void
  restTime: number
  nextSetPreview: NextSetPreview
  onComplete?: () => void
}

export const RestTimerModal = ({
  isOpen,
  onClose,
  restTime,
  nextSetPreview,
  onComplete,
}: RestTimerModalProps) => {
  const [timeRemaining, setTimeRemaining] = useState(restTime)
  const [isRunning, setIsRunning] = useState(true)

  // Auto-start countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeRemaining(restTime)
      setIsRunning(true)
    }
  }, [isOpen, restTime])

  // Countdown timer
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0 || !isOpen) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeRemaining, isOpen, onComplete])

  // Format target reps
  const getTargetRepsDisplay = () => {
    const { targetReps } = nextSetPreview
    if (typeof targetReps === 'number') {
      return `${targetReps} reps`
    }
    if (targetReps.type === 'failure') {
      return 'To Failure'
    }
    if (targetReps.min && targetReps.max) {
      return `${targetReps.min}-${targetReps.max} reps`
    }
    return `${targetReps.min || targetReps.max} reps`
  }

  const handleSkipRest = () => {
    setIsRunning(false)
    onClose()
  }

  if (!isOpen) return null

  const { unit = 'lbs' } = nextSetPreview

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Rest Timer */}
        <div className="p-8 text-center">
          <p className="text-sm font-semibold mb-2 opacity-90">REST TIME</p>
          <div className="text-7xl font-black mb-6">{formatDuration(timeRemaining)}</div>

          {/* Next Set Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold mb-3 opacity-80 text-center">NEXT UP</p>

            <h3 className="font-bold text-lg mb-3 text-center">
              {nextSetPreview.exerciseName}
            </h3>

            <p className="text-sm mb-4 text-center opacity-90">
              Set {nextSetPreview.setNumber} of {nextSetPreview.totalSets} •{' '}
              {getTargetRepsDisplay()}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {/* Target */}
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-xs opacity-70 mb-1">Target</p>
                <p className="font-bold">
                  {nextSetPreview.targetWeight} {unit}
                </p>
              </div>

              {/* Last Time */}
              {nextSetPreview.lastWeight && nextSetPreview.lastReps && (
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-xs opacity-70 mb-1">Last</p>
                  <p className="font-bold">
                    {nextSetPreview.lastWeight} {unit} × {nextSetPreview.lastReps}
                  </p>
                </div>
              )}

              {/* PR */}
              {nextSetPreview.personalRecord && (
                <div className="bg-yellow-400/30 rounded-lg p-2">
                  <p className="text-xs opacity-70 mb-1">PR 🏆</p>
                  <p className="font-bold">
                    {nextSetPreview.personalRecord.weight} {unit} ×{' '}
                    {nextSetPreview.personalRecord.reps}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSkipRest}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-50 w-full"
          >
            Skip Rest & Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
