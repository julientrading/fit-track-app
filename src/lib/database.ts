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
  const { data, error } = await supabase
    .from('workout_logs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', workoutLogId)
    .select()
    .single()

  if (error) throw new Error(error.message)
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
