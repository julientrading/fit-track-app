import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, BarChart3, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WorkoutSummaryCard } from '@/components/features/workout/WorkoutSummaryCard'
import { PRsAchieved } from '@/components/features/workout/PRsAchieved'
import { XPEarnedCard } from '@/components/features/workout/XPEarnedCard'

// TODO: Replace with real data from database
const MOCK_WORKOUT_DATA = {
  name: 'Push Day A',
  durationSeconds: 3245, // 54 minutes 5 seconds
  totalSets: 18,
  totalReps: 144,
  totalVolume: 12450,
  unit: 'lbs' as const,
  xpEarned: 325,
  currentXP: 2845,
  currentLevel: 8,
  xpToNextLevel: 3200,
  personalRecords: [
    {
      exerciseName: 'Barbell Bench Press',
      recordType: 'max_weight' as const,
      value: '225 lbs',
    },
    {
      exerciseName: 'Incline Dumbbell Press',
      recordType: 'max_volume' as const,
      value: '4,200 lbs',
    },
  ],
}

export function WorkoutComplete() {
  const navigate = useNavigate()
  const { id } = useParams()

  const handleViewSummary = () => {
    // TODO: Navigate to detailed workout summary page
    navigate(`/workout/${id}/summary`)
  }

  const handleDone = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Celebration Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Workout Complete! 💪
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {MOCK_WORKOUT_DATA.name}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Workout Summary Stats */}
          <WorkoutSummaryCard
            durationSeconds={MOCK_WORKOUT_DATA.durationSeconds}
            totalSets={MOCK_WORKOUT_DATA.totalSets}
            totalReps={MOCK_WORKOUT_DATA.totalReps}
            totalVolume={MOCK_WORKOUT_DATA.totalVolume}
            unit={MOCK_WORKOUT_DATA.unit}
          />

          {/* Personal Records */}
          {MOCK_WORKOUT_DATA.personalRecords.length > 0 && (
            <PRsAchieved personalRecords={MOCK_WORKOUT_DATA.personalRecords} />
          )}

          {/* XP Earned */}
          <XPEarnedCard
            xpEarned={MOCK_WORKOUT_DATA.xpEarned}
            currentXP={MOCK_WORKOUT_DATA.currentXP}
            currentLevel={MOCK_WORKOUT_DATA.currentLevel}
            xpToNextLevel={MOCK_WORKOUT_DATA.xpToNextLevel}
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleViewSummary}
              className="w-full"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Summary
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleDone}
              className="w-full"
            >
              <Home className="w-5 h-5 mr-2" />
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
