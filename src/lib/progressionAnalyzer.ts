import { supabase } from './supabase'
import type {
  ProgressionAnalysis,
  ProgressionRecommendation,
  ProgressionSettings,
  SetTarget,
  Exercise,
} from '@/types/database'

// Default progression settings
const DEFAULT_SETTINGS: ProgressionSettings = {
  userId: '',
  consecutiveSuccessesRequired: 2,
  requireAllSets: false,
  repsTolerance: 0,
  autoShowModal: true,
  autoApplyPreferred: false,
  preferredMethod: null,
}

/**
 * Analyzes workout history to determine if progression/regression is recommended
 */
export async function analyzeExerciseProgression(
  userId: string,
  exerciseId: string,
  workoutDayExerciseId: string,
  exerciseName: string
): Promise<ProgressionAnalysis | null> {
  try {
    // 1. Get recent workout logs for this exercise (last 4 workouts)
    const recentLogs = await getRecentExerciseLogs(userId, exerciseId, 4)

    if (recentLogs.length < 2) {
      // Not enough data to analyze
      return null
    }

    // 2. Get the target from workout_day_exercises
    const { data: wdExercise, error } = await supabase
      .from('workout_day_exercises')
      .select('sets, rest_time')
      .eq('id', workoutDayExerciseId)
      .single()

    if (error || !wdExercise) {
      console.error('[Progression] Failed to get workout day exercise:', error)
      return null
    }

    const sets = wdExercise.sets as SetTarget[]
    const workingSets = sets.filter((s) => s.type === 'working')

    if (workingSets.length === 0) {
      return null
    }

    // Get target from first working set
    const targetSet = workingSets[0]
    const targetWeight = targetSet.targetWeight
    const targetReps = typeof targetSet.targetReps === 'number'
      ? targetSet.targetReps
      : 'min' in targetSet.targetReps
      ? targetSet.targetReps.max
      : 8  // default

    // 3. Get user's progression settings
    const settings = await getProgressionSettings(userId, exerciseId)

    // 4. Analyze performance history
    const analysis = analyzePerformance(
      recentLogs,
      targetWeight,
      targetReps,
      workingSets.length,
      settings
    )

    if (!analysis) {
      return null
    }

    // 5. Generate recommendations based on analysis type
    let recommendation: ProgressionRecommendation | undefined

    if (analysis.type === 'progression') {
      recommendation = generateProgressionRecommendation(
        targetWeight,
        targetReps,
        workingSets.length
      )
    } else if (analysis.type === 'regression') {
      recommendation = generateRegressionRecommendation(
        targetWeight,
        targetReps,
        workingSets.length
      )
    }

    return {
      exerciseId,
      exerciseName,
      workoutDayExerciseId,
      ...analysis,
      recommendation,
    }
  } catch (error) {
    console.error('[Progression] Analysis failed:', error)
    return null
  }
}

/**
 * Get recent exercise logs with actual performance
 */
async function getRecentExerciseLogs(
  userId: string,
  exerciseId: string,
  limit: number
) {
  const { data: workoutLogs, error } = await supabase
    .from('workout_logs')
    .select(`
      id,
      completed_at,
      exercise_logs!inner(
        id,
        exercise_id
      )
    `)
    .eq('user_id', userId)
    .eq('exercise_logs.exercise_id', exerciseId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Progression] Failed to get workout logs:', error)
    return []
  }

  // Get sets for each exercise log
  const logsWithSets = await Promise.all(
    workoutLogs.map(async (log) => {
      const exerciseLog = (log as any).exercise_logs[0]

      const { data: sets } = await supabase
        .from('sets')
        .select('*')
        .eq('exercise_log_id', exerciseLog.id)
        .eq('set_type', 'working')
        .eq('completed', true)
        .order('set_number')

      return {
        workoutLogId: log.id,
        date: log.completed_at,
        sets: sets || [],
      }
    })
  )

  return logsWithSets
}

/**
 * Analyze performance patterns
 */
function analyzePerformance(
  logs: any[],
  targetWeight: number,
  targetReps: number,
  targetSets: number,
  settings: ProgressionSettings
) {
  const history = logs.map((log) => {
    // Calculate average reps across working sets
    const workingSets = log.sets.filter((s: any) => s.set_type === 'working')
    const avgReps = workingSets.length > 0
      ? Math.round(
          workingSets.reduce((sum: number, s: any) => sum + (s.reps || 0), 0) /
            workingSets.length
        )
      : 0

    const weight = workingSets[0]?.weight || 0
    const success = avgReps >= targetReps - settings.repsTolerance

    return {
      workoutLogId: log.workoutLogId,
      date: log.date,
      targetReps,
      actualReps: avgReps,
      weight,
      success,
    }
  })

  // Count consecutive successes/failures (most recent first)
  let consecutiveSuccesses = 0
  let consecutiveFailures = 0

  for (const entry of history) {
    if (entry.success) {
      consecutiveSuccesses++
      if (consecutiveFailures > 0) break
    } else {
      consecutiveFailures++
      if (consecutiveSuccesses > 0) break
    }
  }

  // Determine type
  let type: 'progression' | 'regression' | 'stagnation' | 'none' = 'none'
  let triggerReason = ''

  if (consecutiveSuccesses >= settings.consecutiveSuccessesRequired) {
    type = 'progression'
    triggerReason = `Hit target reps for ${consecutiveSuccesses} consecutive workouts`
  } else if (consecutiveFailures >= 2) {
    type = 'regression'
    triggerReason = `Failed to hit target reps for ${consecutiveFailures} consecutive workouts`
  } else if (history.length >= 4 && !history.some((h) => h.success)) {
    type = 'stagnation'
    triggerReason = 'No progress in last 4 workouts'
  }

  if (type === 'none') {
    return null
  }

  return {
    type,
    current: {
      weight: targetWeight,
      reps: targetReps,
      sets: targetSets,
    },
    history: history.reverse(), // Show oldest first
    consecutiveSuccesses,
    consecutiveFailures,
    triggerReason,
  }
}

/**
 * Generate progression recommendations
 */
function generateProgressionRecommendation(
  currentWeight: number,
  currentReps: number,
  currentSets: number
): ProgressionRecommendation {
  return {
    weightOptions: [
      { increment: 1, label: 'Small Step', newWeight: currentWeight + 1 },
      { increment: 1.5, label: 'Moderate', newWeight: currentWeight + 1.5 },
      { increment: 2, label: 'Standard', newWeight: currentWeight + 2 },
      { increment: 2.5, label: 'Aggressive', newWeight: currentWeight + 2.5 },
    ],
    repOptions: [
      { increment: 1, newReps: currentReps + 1 },
      { increment: 2, newReps: currentReps + 2 },
      { increment: 3, newReps: currentReps + 3 },
    ],
    volumeOptions: [
      { increment: 1, newSets: currentSets + 1 },
      { increment: 2, newSets: currentSets + 2 },
    ],
    suggested: {
      method: 'weight',
      value: 2,
      reasoning: 'For strength building, increasing weight by 1-2kg is recommended. For hypertrophy, adding reps (up to 12) works well.',
    },
  }
}

/**
 * Generate regression recommendations
 */
function generateRegressionRecommendation(
  currentWeight: number,
  currentReps: number,
  currentSets: number
): ProgressionRecommendation {
  return {
    weightOptions: [
      { increment: -2.5, label: 'Recommended', newWeight: currentWeight - 2.5 },
      { increment: -5, label: 'More Safe', newWeight: currentWeight - 5 },
    ],
    repOptions: [
      { increment: -1, newReps: Math.max(6, currentReps - 1) },
      { increment: -2, newReps: Math.max(6, currentReps - 2) },
    ],
    suggested: {
      method: 'weight',
      value: -2.5,
      reasoning: 'Reducing weight slightly allows you to maintain proper form and build back up safely.',
    },
  }
}

/**
 * Get user's progression settings (with defaults)
 */
async function getProgressionSettings(
  userId: string,
  exerciseId?: string
): Promise<ProgressionSettings> {
  // For now, return defaults
  // In future, we can store these in a database table
  return {
    ...DEFAULT_SETTINGS,
    userId,
    exerciseId,
  }
}

/**
 * Apply progression changes to workout day exercise
 */
export async function applyProgressionChanges(
  workoutDayExerciseId: string,
  changes: {
    method: 'weight' | 'reps' | 'volume' | 'keep_current'
    weightIncrement?: number
    repIncrement?: number
    setIncrement?: number
  }
): Promise<boolean> {
  try {
    if (changes.method === 'keep_current') {
      return true
    }

    // Get current workout day exercise
    const { data: wdExercise, error: fetchError } = await supabase
      .from('workout_day_exercises')
      .select('sets')
      .eq('id', workoutDayExerciseId)
      .single()

    if (fetchError || !wdExercise) {
      console.error('[Progression] Failed to fetch exercise:', fetchError)
      return false
    }

    let sets = wdExercise.sets as SetTarget[]

    // Apply changes based on method
    if (changes.method === 'weight' && changes.weightIncrement) {
      sets = sets.map((set) => ({
        ...set,
        targetWeight: set.targetWeight + changes.weightIncrement!,
      }))
    } else if (changes.method === 'reps' && changes.repIncrement) {
      sets = sets.map((set) => {
        if (typeof set.targetReps === 'number') {
          return {
            ...set,
            targetReps: set.targetReps + changes.repIncrement!,
          }
        }
        return set
      })
    } else if (changes.method === 'volume' && changes.setIncrement) {
      // Add new sets (copy last working set)
      const lastWorkingSet = [...sets].reverse().find((s) => s.type === 'working')
      if (lastWorkingSet) {
        for (let i = 0; i < changes.setIncrement; i++) {
          sets.push({ ...lastWorkingSet })
        }
      }
    }

    // Update in database
    const { error: updateError } = await supabase
      .from('workout_day_exercises')
      .update({ sets })
      .eq('id', workoutDayExerciseId)

    if (updateError) {
      console.error('[Progression] Failed to update exercise:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('[Progression] Failed to apply changes:', error)
    return false
  }
}
