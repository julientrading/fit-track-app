import { useState, useEffect } from 'react'
import { formatDuration } from '@/lib/utils'

interface RestTimerProps {
  defaultTime: number // in seconds
  onTimerComplete?: () => void
}

export const RestTimer = ({ defaultTime, onTimerComplete }: RestTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(defaultTime)
  const [isRunning, setIsRunning] = useState(false)
  const [initialTime, setInitialTime] = useState(defaultTime)

  // Countdown timer
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onTimerComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeRemaining, onTimerComplete])

  const handleStart = () => {
    setIsRunning(!isRunning)
  }

  const adjustTime = (seconds: number) => {
    const newTime = Math.max(0, initialTime + seconds)
    setInitialTime(newTime)
    setTimeRemaining(newTime)
  }

  const handleReset = () => {
    setTimeRemaining(initialTime)
    setIsRunning(false)
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
      <div className="text-center">
        <p className="text-sm font-semibold mb-2 opacity-90">REST TIMER</p>
        <div className="text-6xl font-black mb-4">{formatDuration(timeRemaining)}</div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => adjustTime(-30)}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition"
          >
            -30s
          </button>
          <button
            onClick={handleStart}
            className="bg-white text-blue-600 px-8 py-2 rounded-lg font-bold hover:bg-gray-50 transition shadow-lg"
          >
            {isRunning ? 'PAUSE' : 'START'}
          </button>
          <button
            onClick={() => adjustTime(30)}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition"
          >
            +30s
          </button>
        </div>
        {timeRemaining !== initialTime && !isRunning && (
          <button
            onClick={handleReset}
            className="mt-3 text-sm opacity-80 hover:opacity-100 transition"
          >
            Reset to {formatDuration(initialTime)}
          </button>
        )}
      </div>
    </div>
  )
}
