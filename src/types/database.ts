// Database Types - Auto-generated from Supabase schema
// These types match the database tables exactly

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  xp: number
  level: number
  current_streak: number
  longest_streak: number
  last_workout_date: string | null
  preferred_unit: 'lbs' | 'kg'
  theme: 'light' | 'dark' | 'auto'
  subscription_tier: 'free' | 'premium'
  subscription_status: 'active' | 'cancelled' | 'expired'
  subscription_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  description: string | null
  instructions: string | null
  category: 'compound' | 'isolation' | 'cardio' | 'flexibility' | 'other'
  muscle_groups: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  video_url: string | null
  thumbnail_url: string | null
  tracks_weight: boolean
  tracks_reps: boolean
  tracks_time: boolean
  tracks_distance: boolean
  created_by: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  user_id: string
  name: string
  description: string | null
  goal: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  duration_weeks: number | null
  days_per_week: number | null
  is_active: boolean
  is_public: boolean
  is_template: boolean
  is_draft: boolean
  total_workouts: number
  times_completed: number
  created_at: string
  updated_at: string
}

export interface WorkoutDay {
  id: string
  program_id: string
  name: string
  description: string | null
  day_number: number
  created_at: string
  updated_at: string
}

export type SetTarget =
  | { type: 'warmup'; targetWeight: number; targetReps: number }
  | { type: 'working'; targetWeight: number; targetReps: number | { min: number; max: number } }
  | { type: 'working'; targetWeight: number; targetReps: { type: 'failure' } }
  | { type: 'dropset'; targetWeight: number; targetReps: number }

export interface WorkoutDayExercise {
  id: string
  workout_day_id: string
  exercise_id: string
  exercise_order: number
  sets: SetTarget[]
  rest_time: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WorkoutLog {
  id: string
  user_id: string
  program_id: string | null
  workout_day_id: string | null
  name: string
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  status: 'in_progress' | 'completed' | 'cancelled'
  total_volume: number | null
  total_sets: number
  total_reps: number
  personal_records_count: number
  xp_earned: number
  notes: string | null
  feeling: string | null
  created_at: string
  updated_at: string
}

export interface ExerciseLog {
  id: string
  workout_log_id: string
  exercise_id: string
  exercise_order: number
  exercise_name: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Set {
  id: string
  exercise_log_id: string
  user_id: string
  exercise_id: string
  set_number: number
  set_type: 'warmup' | 'working' | 'dropset' | 'failure'
  weight: number | null
  reps: number | null
  time_seconds: number | null
  distance: number | null
  rpe: number | null // 0-10
  completed: boolean
  is_personal_record: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_id: string
  record_type: 'max_weight' | 'max_reps' | 'max_volume' | 'best_time'
  weight: number | null
  reps: number | null
  volume: number | null
  time_seconds: number | null
  set_id: string | null
  achieved_at: string
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  name: string
  description: string | null
  icon: string | null
  unlocked: boolean
  unlocked_at: string | null
  xp_reward: number
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  measurement_type:
    | 'weight'
    | 'neck'
    | 'shoulders'
    | 'chest'
    | 'biceps_left'
    | 'biceps_right'
    | 'forearms_left'
    | 'forearms_right'
    | 'waist'
    | 'hips'
    | 'thighs_left'
    | 'thighs_right'
    | 'calves_left'
    | 'calves_right'
    | 'body_fat_percentage'
  value: number
  unit: 'lbs' | 'kg' | 'in' | 'cm' | '%'
  notes: string | null
  measured_at: string
  created_at: string
  updated_at: string
}

// Helper types for inserts (without timestamps and generated fields)
export type InsertUser = Omit<User, 'created_at' | 'updated_at'>
export type InsertExercise = Omit<Exercise, 'id' | 'created_at' | 'updated_at'>
export type InsertProgram = Omit<Program, 'id' | 'created_at' | 'updated_at' | 'total_workouts' | 'times_completed'>
export type InsertWorkoutDay = Omit<WorkoutDay, 'id' | 'created_at' | 'updated_at'>
export type InsertWorkoutDayExercise = Omit<WorkoutDayExercise, 'id' | 'created_at' | 'updated_at'>
export type InsertWorkoutLog = Omit<WorkoutLog, 'id' | 'created_at' | 'updated_at' | 'total_sets' | 'total_reps' | 'total_volume' | 'personal_records_count'>
export type InsertExerciseLog = Omit<ExerciseLog, 'id' | 'created_at' | 'updated_at'>
export type InsertSet = Omit<Set, 'id' | 'created_at' | 'updated_at' | 'is_personal_record'>
export type InsertPersonalRecord = Omit<PersonalRecord, 'id' | 'created_at' | 'updated_at'>
export type InsertAchievement = Omit<Achievement, 'id' | 'created_at' | 'updated_at'>
export type InsertFriendship = Omit<Friendship, 'id' | 'created_at' | 'updated_at'>
export type InsertBodyMeasurement = Omit<BodyMeasurement, 'id' | 'created_at' | 'updated_at'>

// Helper types for updates (all fields optional except id)
export type UpdateUser = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
export type UpdateExercise = Partial<Omit<Exercise, 'id' | 'created_at' | 'updated_at'>>
export type UpdateProgram = Partial<Omit<Program, 'id' | 'created_at' | 'updated_at'>>
export type UpdateWorkoutDay = Partial<Omit<WorkoutDay, 'id' | 'created_at' | 'updated_at'>>
export type UpdateWorkoutDayExercise = Partial<Omit<WorkoutDayExercise, 'id' | 'created_at' | 'updated_at'>>
export type UpdateWorkoutLog = Partial<Omit<WorkoutLog, 'id' | 'created_at' | 'updated_at'>>
export type UpdateExerciseLog = Partial<Omit<ExerciseLog, 'id' | 'created_at' | 'updated_at'>>
export type UpdateSet = Partial<Omit<Set, 'id' | 'created_at' | 'updated_at'>>
export type UpdatePersonalRecord = Partial<Omit<PersonalRecord, 'id' | 'created_at' | 'updated_at'>>
export type UpdateAchievement = Partial<Omit<Achievement, 'id' | 'created_at' | 'updated_at'>>
export type UpdateFriendship = Partial<Omit<Friendship, 'id' | 'created_at' | 'updated_at'>>
export type UpdateBodyMeasurement = Partial<Omit<BodyMeasurement, 'id' | 'created_at' | 'updated_at'>>

// =====================================================
// PROGRESSIVE OVERLOAD TYPES
// =====================================================

// Progression analysis result
export interface ProgressionAnalysis {
  exerciseId: string
  exerciseName: string
  workoutDayExerciseId: string
  type: 'progression' | 'regression' | 'stagnation' | 'none'

  // Current performance
  current: {
    weight: number
    reps: number
    sets: number
  }

  // Recent history (last 4 workouts)
  history: Array<{
    workoutLogId: string
    date: string
    targetReps: number
    actualReps: number
    weight: number
    success: boolean
  }>

  // Streak tracking
  consecutiveSuccesses: number
  consecutiveFailures: number

  // Trigger reason
  triggerReason: string

  // Recommendations
  recommendation?: ProgressionRecommendation
}

// Progression recommendation with options
export interface ProgressionRecommendation {
  // Weight progression options
  weightOptions?: Array<{
    increment: number
    label: string  // "Small Step", "Standard", etc.
    newWeight: number
  }>

  // Rep progression options
  repOptions?: Array<{
    increment: number
    newReps: number
  }>

  // Volume progression options
  volumeOptions?: Array<{
    increment: number
    newSets: number
  }>

  // Suggested option (based on exercise type and history)
  suggested?: {
    method: 'weight' | 'reps' | 'volume'
    value: number
    reasoning: string
  }
}

// Progression settings (user preferences)
export interface ProgressionSettings {
  userId: string
  exerciseId?: string  // null = default for all exercises

  // Trigger thresholds
  consecutiveSuccessesRequired: number  // default: 2
  requireAllSets: boolean  // vs majority of sets
  repsTolerance: number  // "within N reps" vs exact match

  // Behavior
  autoShowModal: boolean  // show modal automatically
  autoApplyPreferred: boolean  // skip modal if preferred method set
  preferredMethod?: 'weight' | 'reps' | 'volume' | null

  // Weight increments (kg)
  preferredWeightIncrement?: number

  // Frequency control
  minDaysBetweenProgressions?: number  // prevent too aggressive progression
}

// Progression history record
export interface ProgressionHistory {
  id: string
  userId: string
  exerciseId: string
  workoutDayExerciseId: string
  workoutLogId: string
  date: string

  type: 'progression' | 'regression' | 'deload'
  changeType: 'weight' | 'reps' | 'volume'

  oldWeight: number
  newWeight: number
  oldReps: number
  newReps: number
  oldSets: number
  newSets: number

  triggerReason: string
  userConfirmed: boolean
  autoApplied: boolean

  createdAt: string
}

// Helper type for progression modal data
export interface ProgressionModalData {
  analysis: ProgressionAnalysis
  exercise: Exercise
  onApply: (changes: ProgressionChanges) => Promise<void>
  onDismiss: () => void
}

// Changes to apply from progression
export interface ProgressionChanges {
  method: 'weight' | 'reps' | 'volume' | 'keep_current'
  weightIncrement?: number
  repIncrement?: number
  setIncrement?: number
}
