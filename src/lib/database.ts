import { supabase } from './supabase'
import type {
  User,
  Program,
  WorkoutDay,
  WorkoutLog,
  ExerciseLog,
  Set,
  PersonalRecord,
  Exercise,
  BodyMeasurement,
  InsertWorkoutLog,
  InsertExerciseLog,
  InsertSet,
  InsertBodyMeasurement,
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
  const { data, error} = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createProgram(programData: {
  user_id: string
  name: string
  description?: string
  goal?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration_weeks?: number
  days_per_week?: number
  is_active?: boolean
}): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: programData.user_id,
      name: programData.name,
      description: programData.description || null,
      goal: programData.goal || null,
      difficulty: programData.difficulty || null,
      duration_weeks: programData.duration_weeks || null,
      days_per_week: programData.days_per_week || null,
      is_active: programData.is_active || false,
      is_public: false,
      is_template: false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateProgram(
  programId: string,
  updates: Partial<Program>
): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', programId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteProgram(programId: string): Promise<void> {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId)

  if (error) throw new Error(error.message)
}

export async function setActiveProgram(userId: string, programId: string): Promise<void> {
  // First, deactivate all programs for this user
  await supabase
    .from('programs')
    .update({ is_active: false })
    .eq('user_id', userId)

  // Then activate the selected program
  const { error } = await supabase
    .from('programs')
    .update({ is_active: true })
    .eq('id', programId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function getRecentlyUsedPrograms(userId: string, limit = 3): Promise<Program[]> {
  // Get recent completed workouts with programs
  const { data: workoutLogs, error: workoutError } = await supabase
    .from('workout_logs')
    .select('program_id, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('program_id', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(50) // Get more to ensure we get unique programs

  if (workoutError) throw new Error(workoutError.message)
  if (!workoutLogs || workoutLogs.length === 0) return []

  // Get unique program IDs
  const seenProgramIds = new Set<string>()
  const programIds: string[] = []

  workoutLogs.forEach((log) => {
    if (log.program_id && !seenProgramIds.has(log.program_id)) {
      seenProgramIds.add(log.program_id)
      programIds.push(log.program_id)
      if (programIds.length >= limit) return
    }
  })

  if (programIds.length === 0) return []

  // Fetch the actual programs
  const { data: programs, error: programError } = await supabase
    .from('programs')
    .select('*')
    .in('id', programIds)

  if (programError) throw new Error(programError.message)

  // Return programs in the order they were used
  const programMap = new Map(programs?.map((p) => [p.id, p]))
  return programIds.map((id) => programMap.get(id)).filter(Boolean) as Program[]
}

export async function getPublicPrograms(limit = 20): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('is_public', true)
    .order('times_completed', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data || []
}

export async function duplicateProgram(
  programId: string,
  userId: string
): Promise<Program> {
  // 1. Get original program
  const originalProgram = await getProgramById(programId)
  if (!originalProgram) throw new Error('Program not found')

  // 2. Create new program
  const newProgram = await createProgram({
    user_id: userId,
    name: `${originalProgram.name} (Copy)`,
    description: originalProgram.description || undefined,
    goal: originalProgram.goal || undefined,
    difficulty: originalProgram.difficulty || undefined,
    duration_weeks: originalProgram.duration_weeks || undefined,
    days_per_week: originalProgram.days_per_week || undefined,
    is_active: false,
  })

  // 3. Get workout days from original program
  const workoutDays = await getWorkoutDaysByProgram(programId)

  // 4. Duplicate workout days and exercises
  for (const day of workoutDays) {
    const newDay = await createWorkoutDay({
      program_id: newProgram.id,
      name: day.name,
      description: day.description || undefined,
      day_number: day.day_number,
    })

    // Get exercises for this day
    const exercises = await getWorkoutDayExercises(day.id)

    // Duplicate each exercise
    for (const exercise of exercises) {
      await createWorkoutDayExercise({
        workout_day_id: newDay.id,
        exercise_id: exercise.exercise_id,
        exercise_order: exercise.exercise_order,
        sets: exercise.sets,
        rest_time: exercise.rest_time,
        notes: exercise.notes || undefined,
      })
    }
  }

  return newProgram
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

export async function createWorkoutDay(workoutDayData: {
  program_id: string
  name: string
  description?: string
  day_number: number
}): Promise<WorkoutDay> {
  const { data, error } = await supabase
    .from('workout_days')
    .insert({
      program_id: workoutDayData.program_id,
      name: workoutDayData.name,
      description: workoutDayData.description || null,
      day_number: workoutDayData.day_number,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateWorkoutDay(
  workoutDayId: string,
  updates: Partial<WorkoutDay>
): Promise<WorkoutDay> {
  const { data, error } = await supabase
    .from('workout_days')
    .update(updates)
    .eq('id', workoutDayId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteWorkoutDay(workoutDayId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_days')
    .delete()
    .eq('id', workoutDayId)

  if (error) throw new Error(error.message)
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

export async function createWorkoutDayExercise(exerciseData: {
  workout_day_id: string
  exercise_id: string
  exercise_order: number
  sets: any[]
  rest_time: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('workout_day_exercises')
    .insert({
      workout_day_id: exerciseData.workout_day_id,
      exercise_id: exerciseData.exercise_id,
      exercise_order: exerciseData.exercise_order,
      sets: exerciseData.sets,
      rest_time: exerciseData.rest_time,
      notes: exerciseData.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateWorkoutDayExercise(
  exerciseId: string,
  updates: {
    exercise_order?: number
    sets?: any[]
    rest_time?: number
    notes?: string
  }
) {
  const { data, error } = await supabase
    .from('workout_day_exercises')
    .update(updates)
    .eq('id', exerciseId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteWorkoutDayExercise(exerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_day_exercises')
    .delete()
    .eq('id', exerciseId)

  if (error) throw new Error(error.message)
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

export async function getWorkoutLogsByProgram(
  userId: string,
  programId: string,
  limit = 50
): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('program_id', programId)
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

export async function deleteWorkoutLog(workoutLogId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', workoutLogId)

  if (error) throw new Error(error.message)
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

  // Update user's total XP with atomic increment
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
  const { data, error} = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('workout_log_id', workoutLogId)
    .order('exercise_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export interface ExercisePerformanceData {
  workout_date: string
  exercise_id: string
  exercise_name: string
  max_weight: number | null
  max_reps: number | null
  total_volume: number | null
  avg_rpe: number | null
  max_time: number | null
  max_distance: number | null
  workout_log_id: string
}

export async function getExercisePerformanceHistory(
  userId: string,
  programId: string | null = null,
  exerciseId: string | null = null,
  limit = 100
): Promise<ExercisePerformanceData[]> {
  let query = supabase
    .from('exercise_logs')
    .select(`
      exercise_id,
      workout_log_id,
      workout_logs!inner(
        id,
        started_at,
        program_id,
        user_id
      ),
      exercises(name),
      sets(weight, reps, time_seconds, distance, rpe, completed)
    `)
    .eq('workout_logs.user_id', userId)
    .eq('workout_logs.status', 'completed')
    .limit(limit)

  if (programId) {
    query = query.eq('workout_logs.program_id', programId)
  }

  if (exerciseId) {
    query = query.eq('exercise_id', exerciseId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  // Sort data by workout date (since we can't order by joined table columns in Supabase)
  const sortedData = (data || []).sort((a: any, b: any) => {
    const dateA = new Date(a.workout_logs.started_at).getTime()
    const dateB = new Date(b.workout_logs.started_at).getTime()
    return dateA - dateB
  })

  // Process the data to calculate metrics per workout
  const performanceMap = new Map<string, ExercisePerformanceData>()

  sortedData.forEach((log: any) => {
    const key = `${log.workout_log_id}-${log.exercise_id}`

    if (!performanceMap.has(key)) {
      performanceMap.set(key, {
        workout_date: log.workout_logs.started_at,
        exercise_id: log.exercise_id,
        exercise_name: log.exercises?.name || 'Unknown',
        max_weight: null,
        max_reps: null,
        total_volume: 0,
        avg_rpe: null,
        max_time: null,
        max_distance: null,
        workout_log_id: log.workout_log_id,
      })
    }

    const perf = performanceMap.get(key)!
    const completedSets = (log.sets || []).filter((s: any) => s.completed)

    if (completedSets.length > 0) {
      // Calculate max weight
      const weights = completedSets.map((s: any) => s.weight).filter((w: any) => w !== null)
      if (weights.length > 0) {
        perf.max_weight = Math.max(perf.max_weight || 0, ...weights)
      }

      // Calculate max reps
      const reps = completedSets.map((s: any) => s.reps).filter((r: any) => r !== null)
      if (reps.length > 0) {
        perf.max_reps = Math.max(perf.max_reps || 0, ...reps)
      }

      // Calculate total volume
      completedSets.forEach((s: any) => {
        if (s.weight && s.reps) {
          perf.total_volume = (perf.total_volume || 0) + s.weight * s.reps
        }
      })

      // Calculate average RPE
      const rpeValues = completedSets.map((s: any) => s.rpe).filter((r: any) => r !== null)
      if (rpeValues.length > 0) {
        perf.avg_rpe = rpeValues.reduce((sum: number, val: number) => sum + val, 0) / rpeValues.length
      }

      // Calculate max time
      const times = completedSets.map((s: any) => s.time_seconds).filter((t: any) => t !== null)
      if (times.length > 0) {
        perf.max_time = Math.max(perf.max_time || 0, ...times)
      }

      // Calculate max distance
      const distances = completedSets.map((s: any) => s.distance).filter((d: any) => d !== null)
      if (distances.length > 0) {
        perf.max_distance = Math.max(perf.max_distance || 0, ...distances)
      }
    }
  })

  return Array.from(performanceMap.values()).sort((a, b) =>
    new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime()
  )
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

export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getFrequentlyUsedExercises(userId: string, limit = 10): Promise<Exercise[]> {
  // Get exercises that have been used most frequently in completed workouts
  const { data, error } = await supabase
    .from('sets')
    .select(`
      exercise_id,
      exercises!inner(*)
    `)
    .eq('user_id', userId)
    .eq('completed', true)

  if (error) throw new Error(error.message)

  // Count frequency of each exercise
  const exerciseCounts: Record<string, { exercise: Exercise; count: number }> = {}

  data?.forEach((item: any) => {
    const exerciseId = item.exercise_id
    if (!exerciseCounts[exerciseId]) {
      exerciseCounts[exerciseId] = {
        exercise: item.exercises,
        count: 0,
      }
    }
    exerciseCounts[exerciseId].count++
  })

  // Sort by frequency and return top exercises
  return Object.values(exerciseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => item.exercise)
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

export async function getPreviousWorkoutComparison(
  userId: string,
  workoutDayId: string,
  currentWorkoutLogId: string
) {
  // Find the most recent completed workout for the same workout_day_id
  const { data: previousWorkout, error: workoutError } = await supabase
    .from('workout_logs')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('workout_day_id', workoutDayId)
    .eq('status', 'completed')
    .neq('id', currentWorkoutLogId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (workoutError || !previousWorkout) {
    return []
  }

  // Get exercise performance from that previous workout
  const { data: exerciseData, error: exerciseError } = await supabase
    .from('sets')
    .select(`
      exercise_id,
      exercise_log:exercise_logs!inner(
        exercise_name,
        workout_log_id
      ),
      weight,
      reps
    `)
    .eq('exercise_log.workout_log_id', previousWorkout.id)
    .eq('completed', true)

  if (exerciseError) throw new Error(exerciseError.message)

  // Group by exercise and calculate stats
  const exerciseStats: Record<string, {
    exercise_id: string
    exercise_name: string
    sets: { weight: number | null; reps: number | null }[]
  }> = {}

  exerciseData?.forEach((set: any) => {
    if (!exerciseStats[set.exercise_id]) {
      exerciseStats[set.exercise_id] = {
        exercise_id: set.exercise_id,
        exercise_name: set.exercise_log.exercise_name,
        sets: [],
      }
    }
    exerciseStats[set.exercise_id].sets.push({
      weight: set.weight,
      reps: set.reps,
    })
  })

  // Calculate best set and total volume for each exercise
  return Object.values(exerciseStats).map((exercise) => {
    const validSets = exercise.sets.filter(s => s.weight && s.reps)

    let bestSetWeight = 0
    let bestSetReps = 0
    let totalVolume = 0

    validSets.forEach((set) => {
      const volume = (set.weight || 0) * (set.reps || 0)
      totalVolume += volume

      // Best set is the one with highest volume
      const currentBestVolume = bestSetWeight * bestSetReps
      if (volume > currentBestVolume) {
        bestSetWeight = set.weight || 0
        bestSetReps = set.reps || 0
      }
    })

    return {
      workout_log_id: previousWorkout.id,
      completed_at: previousWorkout.completed_at,
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise_name,
      best_set_weight: bestSetWeight,
      best_set_reps: bestSetReps,
      total_volume: totalVolume,
      total_sets: exercise.sets.length,
    }
  })
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

// =====================================================
// COMMUNITY QUERIES
// =====================================================

export async function getCommunityFeed(limit: number = 20) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select(`
      *,
      user:users!workout_logs_user_id_fkey(id, full_name, xp, level)
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data || []
}

export async function getLeaderboard(period: '7d' | '30d' | 'all' = '30d', limit: number = 10) {
  let query = supabase
    .from('users')
    .select(`
      id,
      full_name,
      xp,
      level,
      workout_logs!workout_logs_user_id_fkey(status, xp_earned, completed_at)
    `)
    .order('xp', { ascending: false })
    .limit(limit)

  const { data, error } = await query

  if (error) throw new Error(error.message)

  // Process data to calculate stats based on period
  const now = new Date()
  let cutoffDate: Date | null = null

  if (period === '7d') {
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (period === '30d') {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return (data || []).map((user: any) => {
    let workouts = user.workout_logs || []

    // Filter by period if needed
    if (cutoffDate) {
      workouts = workouts.filter((w: any) =>
        w.completed_at && new Date(w.completed_at) >= cutoffDate!
      )
    }

    const completedWorkouts = workouts.filter((w: any) => w.status === 'completed')
    const periodXP = completedWorkouts.reduce((sum: number, w: any) => sum + (w.xp_earned || 0), 0)

    return {
      id: user.id,
      full_name: user.full_name,
      xp: period === 'all' ? user.xp : periodXP,
      level: user.level,
      workoutCount: completedWorkouts.length,
    }
  }).sort((a: any, b: any) => b.xp - a.xp)
}

// =====================================================
// BODY MEASUREMENTS QUERIES
// =====================================================

export async function createBodyMeasurement(
  measurementData: InsertBodyMeasurement
): Promise<BodyMeasurement> {
  const { data, error } = await supabase
    .from('body_measurements')
    .insert(measurementData)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getBodyMeasurements(
  userId: string,
  measurementType?: string,
  limit = 100
): Promise<BodyMeasurement[]> {
  let query = supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })
    .limit(limit)

  if (measurementType) {
    query = query.eq('measurement_type', measurementType)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data || []
}

export async function getLatestBodyMeasurements(
  userId: string,
  count = 3
): Promise<BodyMeasurement[]> {
  // Get the latest measurement for each type
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })
    .limit(50) // Get more to find distinct types

  if (error) throw new Error(error.message)

  // Get unique measurement types, keeping the most recent for each
  const uniqueTypes = new Map<string, BodyMeasurement>()
  ;(data || []).forEach((measurement) => {
    if (!uniqueTypes.has(measurement.measurement_type)) {
      uniqueTypes.set(measurement.measurement_type, measurement)
    }
  })

  return Array.from(uniqueTypes.values())
    .slice(0, count)
    .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())
}

export async function deleteBodyMeasurement(measurementId: string): Promise<void> {
  const { error } = await supabase.from('body_measurements').delete().eq('id', measurementId)

  if (error) throw new Error(error.message)
}
