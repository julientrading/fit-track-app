import { supabase } from './supabase'
import type {
  User,
  Program,
  WorkoutDay,
  WorkoutDayExercise,
  WorkoutLog,
  ExerciseLog,
  Set,
  PersonalRecord,
  Exercise,
  InsertWorkoutLog,
  InsertExerciseLog,
  InsertSet,
} from '@/types/database'

// =====================================================
// USER QUERIES
// =====================================================

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// =====================================================
// PROGRAM QUERIES
// =====================================================

export async function getUserPrograms(userId: string): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getActiveProgram(userId: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    throw new Error(error.message)
  }
  return data
}

export async function getProgramById(programId: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// =====================================================
// WORKOUT DAY QUERIES
// =====================================================

export async function getWorkoutDaysByProgram(programId: string): Promise<WorkoutDay[]> {
  const { data, error } = await supabase
    .from('workout_days')
    .select('*')
    .eq('program_id', programId)
    .order('day_number', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getWorkoutDayById(workoutDayId: string): Promise<WorkoutDay | null> {
  const { data, error } = await supabase
    .from('workout_days')
    .select('*')
    .eq('id', workoutDayId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// =====================================================
// WORKOUT DAY EXERCISE QUERIES
// =====================================================

export async function getWorkoutDayExercises(workoutDayId: string) {
  const { data, error } = await supabase
    .from('workout_day_exercises')
    .select(`
      *,
      exercise:exercises(*)
    `)
    .eq('workout_day_id', workoutDayId)
    .order('exercise_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// =====================================================
// WORKOUT LOG QUERIES
// =====================================================

export async function getRecentWorkouts(userId: string, limit = 10): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data || []
}

export async function createWorkoutLog(workoutData: InsertWorkoutLog): Promise<WorkoutLog> {
  const { data, error } = await supabase
    .from('workout_logs')
    .insert(workoutData)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateWorkoutLog(
  workoutLogId: string,
  updates: Partial<WorkoutLog>
): Promise<WorkoutLog> {
  const { data, error } = await supabase
    .from('workout_logs')
    .update(updates)
    .eq('id', workoutLogId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function completeWorkout(workoutLogId: string): Promise<WorkoutLog> {
  // First, get the workout details to calculate stats
  const { workoutLog, exerciseLogs } = await getWorkoutDetails(workoutLogId)

  // Get the workout day exercises to access target values
  const workoutDayExercises = workoutLog.workout_day_id
    ? await getWorkoutDayExercises(workoutLog.workout_day_id)
    : []

  // Create a map of exercise_id -> workout_day_exercise for quick lookup
  const exerciseTargetsMap = new Map(
    workoutDayExercises.map((wde: any) => [wde.exercise_id, wde])
  )

  // Calculate stats and XP
  let totalSets = 0
  let totalReps = 0
  let totalVolume = 0

  // XP tracking
  let baseXP = 50 // Base completion bonus
  let setCompletionXP = 0
  let effortBonusXP = 0
  let perfectSets = 0
  let totalWorkingSets = 0

  // Track RPE for multiplier
  let totalRPE = 0
  let rpeCount = 0

  exerciseLogs.forEach((exerciseLog) => {
    const workoutDayExercise = exerciseTargetsMap.get(exerciseLog.exercise_id)

    exerciseLog.sets.forEach((set, setIndex) => {
      if (set.completed) {
        totalSets++
        totalReps += set.reps || 0
        totalVolume += (set.weight || 0) * (set.reps || 0)

        // Skip warmup sets for XP calculation
        if (set.set_type === 'warmup') return

        totalWorkingSets++

        // Get target for this set from workout plan
        const setTarget = workoutDayExercise?.sets?.[setIndex]

        if (setTarget && set.reps !== null) {
          let targetReps: number
          if (typeof setTarget.targetReps === 'number') {
            targetReps = setTarget.targetReps
          } else if ('min' in setTarget.targetReps) {
            // For ranges, use the middle value as target
            targetReps = Math.round((setTarget.targetReps.min + setTarget.targetReps.max) / 2)
          } else {
            // For "to failure", give full credit if they tried
            targetReps = set.reps
          }

          // Calculate set XP based on target achievement
          const achievementRatio = set.reps / targetReps

          if (achievementRatio >= 1.0) {
            // Hit or exceeded target
            const baseSetXP = 10
            const bonusReps = Math.max(0, set.reps - targetReps)
            const exceedBonus = bonusReps * 5
            setCompletionXP += baseSetXP + exceedBonus

            if (achievementRatio >= 0.95 && achievementRatio <= 1.05) {
              perfectSets++
            }
          } else if (achievementRatio >= 0.8) {
            // Close to target (80%+), give most credit
            setCompletionXP += Math.round(10 * achievementRatio)
          } else {
            // Missed target significantly, still give partial credit for trying
            setCompletionXP += Math.round(10 * achievementRatio * 0.8)
          }
        } else {
          // No target available, give standard XP
          setCompletionXP += 10
        }

        // Track RPE for effort multiplier
        if (set.rpe !== null) {
          totalRPE += set.rpe
          rpeCount++
        }
      }
    })
  })

  // Calculate effort multiplier based on average RPE
  let effortMultiplier = 1.0
  if (rpeCount > 0) {
    const avgRPE = totalRPE / rpeCount
    if (avgRPE <= 4) {
      effortMultiplier = 0.8 // Too easy, reduce XP
    } else if (avgRPE >= 8) {
      effortMultiplier = 1.2 // Challenging, bonus XP
    }
  }

  // Apply effort multiplier to set completion XP
  const adjustedSetXP = Math.round(setCompletionXP * effortMultiplier)
  effortBonusXP = adjustedSetXP - setCompletionXP

  // Perfect workout bonus (hit 90%+ of targets)
  const perfectRatio = totalWorkingSets > 0 ? perfectSets / totalWorkingSets : 0
  const perfectWorkoutBonus = perfectRatio >= 0.9 ? 50 : 0

  // Count PRs for bonus
  const prCount = exerciseLogs.reduce((count, el) => {
    return count + el.sets.filter(s => s.is_personal_record).length
  }, 0)
  const prBonusXP = prCount * 100

  // Calculate total XP
  const totalXP = baseXP + adjustedSetXP + perfectWorkoutBonus + prBonusXP

  // Calculate duration
  const startTime = new Date(workoutLog.started_at).getTime()
  const endTime = new Date().getTime()
  const durationSeconds = Math.floor((endTime - startTime) / 1000)

  console.log('💰 XP Breakdown:', {
    baseXP,
    setCompletionXP,
    effortMultiplier: effortMultiplier.toFixed(2),
    effortBonusXP,
    adjustedSetXP,
    perfectWorkoutBonus,
    prBonusXP: `${prCount} PRs × 100`,
    totalXP,
  })

  // Update workout log with completion data
  const { data, error } = await supabase
    .from('workout_logs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume: totalVolume,
      xp_earned: totalXP,
      personal_records_count: prCount,
    })
    .eq('id', workoutLogId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Update user's total XP
  const { error: userError } = await supabase.rpc('increment', {
    row_id: workoutLog.user_id,
    x: totalXP,
  })

  // If increment RPC doesn't exist, update directly
  if (userError) {
    const { data: userData } = await supabase
      .from('users')
      .select('xp')
      .eq('id', workoutLog.user_id)
      .single()

    if (userData) {
      await supabase
        .from('users')
        .update({ xp: (userData.xp || 0) + totalXP })
        .eq('id', workoutLog.user_id)
    }
  }

  return data
}

// =====================================================
// EXERCISE LOG QUERIES
// =====================================================

export async function createExerciseLog(exerciseData: InsertExerciseLog): Promise<ExerciseLog> {
  console.log('[DB] Creating exercise log with data:', exerciseData)
  const { data, error } = await supabase
    .from('exercise_logs')
    .insert(exerciseData)
    .select()
    .single()

  if (error) {
    console.error('[DB] Failed to create exercise log:', error)
    throw new Error(error.message)
  }
  console.log('[DB] Exercise log created successfully:', data)
  return data
}

export async function getExerciseLogsByWorkout(workoutLogId: string): Promise<ExerciseLog[]> {
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('workout_log_id', workoutLogId)
    .order('exercise_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// =====================================================
// SET QUERIES
// =====================================================

export async function createSet(setData: InsertSet): Promise<Set> {
  console.log('[DB] Creating set with data:', setData)
  const { data, error } = await supabase.from('sets').insert(setData).select().single()

  if (error) {
    console.error('[DB] Failed to create set:', error)
    throw new Error(error.message)
  }
  console.log('[DB] Set created successfully:', data)
  return data
}

export async function updateSet(setId: string, updates: Partial<Set>): Promise<Set> {
  const { data, error } = await supabase
    .from('sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getSetsByExerciseLog(exerciseLogId: string): Promise<Set[]> {
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('exercise_log_id', exerciseLogId)
    .order('set_number', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// =====================================================
// PERSONAL RECORD QUERIES
// =====================================================

export async function getUserPRs(userId: string): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from('personal_records')
    .select(`
      *,
      exercise:exercises(name)
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getExercisePRs(
  userId: string,
  exerciseId: string
): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)

  if (error) throw new Error(error.message)
  return data || []
}

// =====================================================
// EXERCISE QUERIES
// =====================================================

export async function getPublicExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_public', true)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getUserExercises(userId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('created_by', userId)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getAllAvailableExercises(userId: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .or(`is_public.eq.true,created_by.eq.${userId}`)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// =====================================================
// HELPER FUNCTION: Get Last Performance
// =====================================================

export async function getLastPerformance(
  userId: string,
  exerciseId: string,
  setNumber: number = 1
) {
  const { data, error } = await supabase.rpc('get_last_performance', {
    p_user_id: userId,
    p_exercise_id: exerciseId,
    p_set_number: setNumber,
  })

  if (error) throw new Error(error.message)
  return data?.[0] || null
}

// =====================================================
// HELPER FUNCTION: Get Workout Details with All Data
// =====================================================

export async function getWorkoutDetails(workoutLogId: string) {
  // Fetch workout log
  const { data: workoutLog, error: workoutError } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('id', workoutLogId)
    .single()

  if (workoutError) throw new Error(workoutError.message)

  // Fetch exercise logs
  const exerciseLogs = await getExerciseLogsByWorkout(workoutLogId)

  // Fetch all sets for each exercise log
  const exerciseLogsWithSets = await Promise.all(
    exerciseLogs.map(async (exerciseLog) => {
      const sets = await getSetsByExerciseLog(exerciseLog.id)
      return {
        ...exerciseLog,
        sets,
      }
    })
  )

  // Fetch PRs achieved in this workout (within the workout time range)
  const { data: prs, error: prError } = await supabase
    .from('personal_records')
    .select(`
      *,
      exercise:exercises(name)
    `)
    .eq('user_id', workoutLog.user_id)
    .gte('achieved_at', workoutLog.started_at)
    .order('achieved_at', { ascending: false })

  if (prError) throw new Error(prError.message)

  return {
    workoutLog,
    exerciseLogs: exerciseLogsWithSets,
    personalRecords: prs || [],
  }
}

// =====================================================
// STATS QUERIES
// =====================================================

export async function getWeeklyStats(userId: string) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('started_at', oneWeekAgo.toISOString())

  if (error) throw new Error(error.message)

  const workouts = data || []
  const totalWorkouts = workouts.length
  const totalTime = workouts.reduce((sum, w) => sum + (w.duration_seconds || 0), 0)
  const totalVolume = workouts.reduce((sum, w) => sum + (w.total_volume || 0), 0)
  const totalPRs = workouts.reduce((sum, w) => sum + (w.personal_records_count || 0), 0)

  return {
    totalWorkouts,
    totalTime,
    totalVolume,
    totalPRs,
  }
}
