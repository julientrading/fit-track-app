import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, BarChart3, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WorkoutSummaryCard } from '@/components/features/workout/WorkoutSummaryCard'
import { PRsAchieved } from '@/components/features/workout/PRsAchieved'
import { XPEarnedCard } from '@/components/features/workout/XPEarnedCard'
import { ProgressionModal } from '@/components/modals/ProgressionModal'
import { RegressionModal } from '@/components/modals/RegressionModal'
import { getWorkoutDetails } from '@/lib/database'
import { analyzeExerciseProgression, applyProgressionChanges } from '@/lib/progressionAnalyzer'
import { useAuthStore } from '@/stores/authStore'
import type { ProgressionAnalysis, ProgressionChanges } from '@/types/database'

interface PersonalRecord {
  exerciseName: string
  recordType: 'max_weight' | 'max_reps' | 'max_volume' | 'best_time'
  value: string
}

export function WorkoutComplete() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { userProfile } = useAuthStore()

  // Ref to prevent double loading in React Strict Mode
  const isInitializing = useRef(false)
  const hasInitialized = useRef(false)

  const [isLoading, setIsLoading] = useState(true)
  const [workoutData, setWorkoutData] = useState<{
    name: string
    durationSeconds: number
    totalSets: number
    totalReps: number
    totalVolume: number
    unit: 'lbs' | 'kg'
    xpEarned: number
    personalRecords: PersonalRecord[]
  } | null>(null)

  // Progression tracking
  const [progressionQueue, setProgressionQueue] = useState<ProgressionAnalysis[]>([])
  const [currentProgressionIndex, setCurrentProgressionIndex] = useState(0)
  const [isAnalyzingProgression, setIsAnalyzingProgression] = useState(false)

  useEffect(() => {
    if (!id) return

    // Reset flags when component mounts/remounts
    hasInitialized.current = false
    isInitializing.current = false

    const loadWorkoutData = async () => {
      // Guard against double loading (React Strict Mode)
      if (isInitializing.current) {
        console.log('🚫 Workout completion already loading, skipping...')
        return
      }

      try {
        isInitializing.current = true
        setIsLoading(true)
        console.log('📊 Loading workout completion data for:', id)

        const { workoutLog, exerciseLogs, personalRecords } = await getWorkoutDetails(id)

        console.log('✅ Workout data loaded:', { workoutLog, exerciseLogs, personalRecords })

        // Calculate stats
        let totalSets = 0
        let totalReps = 0
        let totalVolume = 0

        exerciseLogs.forEach((exerciseLog) => {
          exerciseLog.sets.forEach((set) => {
            if (set.completed) {
              totalSets++
              totalReps += set.reps || 0
              totalVolume += (set.weight || 0) * (set.reps || 0)
            }
          })
        })

        // Calculate duration
        const startTime = new Date(workoutLog.started_at).getTime()
        const endTime = new Date(workoutLog.completed_at || new Date()).getTime()
        const durationSeconds = Math.floor((endTime - startTime) / 1000)

        // Format PRs for display
        const formattedPRs: PersonalRecord[] = personalRecords.map((pr) => {
          let value = ''
          const unit = userProfile?.preferred_unit || 'lbs'

          switch (pr.record_type) {
            case 'max_weight':
              value = `${pr.weight} ${unit}`
              break
            case 'max_reps':
              value = `${pr.reps} reps`
              break
            case 'max_volume':
              value = `${pr.volume?.toLocaleString()} ${unit}`
              break
            case 'best_time':
              value = `${Math.floor((pr.time_seconds || 0) / 60)}:${String((pr.time_seconds || 0) % 60).padStart(2, '0')}`
              break
          }

          return {
            exerciseName: (pr.exercise as any)?.name || 'Unknown Exercise',
            recordType: pr.record_type,
            value,
          }
        })

        setWorkoutData({
          name: workoutLog.name,
          durationSeconds,
          totalSets,
          totalReps,
          totalVolume,
          unit: userProfile?.preferred_unit || 'lbs',
          xpEarned: workoutLog.xp_earned,
          personalRecords: formattedPRs,
        })

        // Analyze progression for each exercise
        if (userProfile && workoutLog.workout_day_id) {
          console.log('🔍 Analyzing progression for exercises...')
          setIsAnalyzingProgression(true)

          try {
            // Get workout day exercises to match exercise_id with workout_day_exercise_id
            const { getWorkoutDayExercises } = await import('@/lib/database')
            const workoutDayExercises = await getWorkoutDayExercises(workoutLog.workout_day_id)

            const progressionAnalyses: ProgressionAnalysis[] = []

            for (const exerciseLog of exerciseLogs) {
              // Find matching workout_day_exercise
              const workoutDayExercise = workoutDayExercises.find(
                (wde: any) => wde.exercise_id === exerciseLog.exercise_id
              )

              if (!workoutDayExercise) {
                console.log(`⚠️ No workout day exercise found for ${exerciseLog.exercise_name}`)
                continue
              }

              try {
                const analysis = await analyzeExerciseProgression(
                  userProfile.id,
                  exerciseLog.exercise_id,
                  workoutDayExercise.id, // workout_day_exercise_id
                  exerciseLog.exercise_name,
                  id
                )

                if (analysis && (analysis.type === 'progression' || analysis.type === 'regression')) {
                  progressionAnalyses.push(analysis)
                  console.log(`✅ ${analysis.type} detected for ${exerciseLog.exercise_name}`)
                }
              } catch (error) {
                console.error(`Failed to analyze ${exerciseLog.exercise_name}:`, error)
              }
            }

            if (progressionAnalyses.length > 0) {
              console.log(`📊 Found ${progressionAnalyses.length} exercises ready for progression/regression`)
              setProgressionQueue(progressionAnalyses)
            }
          } catch (error) {
            console.error('Failed to analyze progression:', error)
          } finally {
            setIsAnalyzingProgression(false)
          }
        }

        // Mark as initialized
        hasInitialized.current = true
        isInitializing.current = false
      } catch (error) {
        console.error('❌ Failed to load workout data:', error)
        // Fallback to basic data
        setWorkoutData({
          name: 'Workout Complete',
          durationSeconds: 0,
          totalSets: 0,
          totalReps: 0,
          totalVolume: 0,
          unit: 'lbs',
          xpEarned: 0,
          personalRecords: [],
        })
        isInitializing.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkoutData()
  }, [id, userProfile])

  const handleViewSummary = () => {
    // TODO: Navigate to detailed workout summary page
    navigate(`/workout/${id}/summary`)
  }

  const handleDone = () => {
    navigate('/')
  }

  const handleApplyProgression = async (changes: ProgressionChanges) => {
    const currentAnalysis = progressionQueue[currentProgressionIndex]
    if (!currentAnalysis) return

    try {
      console.log(`📝 Applying ${changes.method} progression to ${currentAnalysis.exerciseName}`)
      const success = await applyProgressionChanges(
        currentAnalysis.workoutDayExerciseId,
        changes
      )

      if (success) {
        console.log(`✅ Successfully applied progression`)
      } else {
        console.error(`❌ Failed to apply progression`)
        alert('Failed to apply changes. Please try again.')
      }
    } catch (error) {
      console.error('Failed to apply progression:', error)
      alert('Failed to apply changes. Please try again.')
    }
  }

  const handleDismissProgression = () => {
    // Move to next in queue or close
    if (currentProgressionIndex < progressionQueue.length - 1) {
      setCurrentProgressionIndex(currentProgressionIndex + 1)
    } else {
      // All done, clear queue
      setProgressionQueue([])
      setCurrentProgressionIndex(0)
    }
  }

  // Get current progression to show
  const currentProgression = progressionQueue[currentProgressionIndex]
  const showProgressionModal = currentProgression && currentProgression.type === 'progression'
  const showRegressionModal = currentProgression && currentProgression.type === 'regression'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workout summary...</p>
        </div>
      </div>
    )
  }

  if (!workoutData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load workout data</p>
          <Button onClick={handleDone} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    )
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
          <p className="text-lg text-gray-600 dark:text-gray-400">{workoutData.name}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Workout Summary Stats */}
          <WorkoutSummaryCard
            durationSeconds={workoutData.durationSeconds}
            totalSets={workoutData.totalSets}
            totalReps={workoutData.totalReps}
            totalVolume={workoutData.totalVolume}
            unit={workoutData.unit}
          />

          {/* Personal Records */}
          {workoutData.personalRecords.length > 0 && (
            <PRsAchieved personalRecords={workoutData.personalRecords} />
          )}

          {/* XP Earned */}
          {userProfile && (
            <XPEarnedCard
              xpEarned={workoutData.xpEarned}
              currentXP={userProfile.xp}
              currentLevel={userProfile.level}
              xpToNextLevel={userProfile.level * 1000} // Simple formula, adjust as needed
            />
          )}

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
            <Button variant="primary" size="lg" onClick={handleDone} className="w-full">
              <Home className="w-5 h-5 mr-2" />
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Progression Modals */}
      {showProgressionModal && (
        <ProgressionModal
          analysis={currentProgression}
          onApply={handleApplyProgression}
          onDismiss={handleDismissProgression}
        />
      )}

      {showRegressionModal && (
        <RegressionModal
          analysis={currentProgression}
          onApply={handleApplyProgression}
          onDismiss={handleDismissProgression}
        />
      )}
    </div>
  )
}
