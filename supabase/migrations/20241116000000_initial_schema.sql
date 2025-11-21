-- Fit Track App Database Schema
-- This migration creates all necessary tables for the fitness tracking application

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,

  -- Gamification
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,

  -- Preferences
  preferred_unit TEXT DEFAULT 'lbs' CHECK (preferred_unit IN ('lbs', 'kg')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_ends_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXERCISES TABLE (Library of all exercises)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,

  -- Classification
  category TEXT NOT NULL CHECK (category IN ('compound', 'isolation', 'cardio', 'flexibility', 'other')),
  muscle_groups TEXT[] DEFAULT '{}', -- ['chest', 'shoulders', 'triceps']
  equipment TEXT[] DEFAULT '{}', -- ['barbell', 'bench']
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Media
  video_url TEXT,
  thumbnail_url TEXT,

  -- Metrics this exercise can track
  tracks_weight BOOLEAN DEFAULT true,
  tracks_reps BOOLEAN DEFAULT true,
  tracks_time BOOLEAN DEFAULT false,
  tracks_distance BOOLEAN DEFAULT false,

  -- Ownership (null = system exercise, UUID = user-created)
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON public.exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_public ON public.exercises(is_public) WHERE is_public = true;

-- =====================================================
-- PROGRAMS TABLE (Workout programs)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,

  -- Classification
  goal TEXT, -- 'build_muscle', 'lose_weight', 'gain_strength', etc.
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER, -- Total program duration

  -- Scheduling
  days_per_week INTEGER,

  -- Visibility
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false, -- System templates vs user programs

  -- Stats (denormalized for performance)
  total_workouts INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_user_id ON public.programs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs(user_id, is_active) WHERE is_active = true;

-- =====================================================
-- WORKOUT_DAYS TABLE (Days in a program)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL, -- 'Push Day', 'Pull Day', 'Leg Day'
  description TEXT,
  day_number INTEGER NOT NULL, -- Order in the program (1, 2, 3...)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(program_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_workout_days_program ON public.workout_days(program_id);

-- =====================================================
-- WORKOUT_DAY_EXERCISES TABLE (Exercises in a workout day)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workout_day_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id UUID NOT NULL REFERENCES public.workout_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,

  -- Order
  exercise_order INTEGER NOT NULL, -- Order in the workout

  -- Set Configuration
  sets JSONB NOT NULL, -- Array of set configurations
  -- Example: [
  --   { "type": "warmup", "targetWeight": 135, "targetReps": 10 },
  --   { "type": "working", "targetWeight": 225, "targetReps": { "min": 8, "max": 10 } },
  --   { "type": "working", "targetWeight": 225, "targetReps": { "type": "failure" } }
  -- ]

  -- Rest time between sets (in seconds)
  rest_time INTEGER DEFAULT 120,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(workout_day_id, exercise_order)
);

CREATE INDEX IF NOT EXISTS idx_workout_day_exercises_day ON public.workout_day_exercises(workout_day_id);
CREATE INDEX IF NOT EXISTS idx_workout_day_exercises_exercise ON public.workout_day_exercises(exercise_id);

-- =====================================================
-- WORKOUT_LOGS TABLE (Completed workouts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  workout_day_id UUID REFERENCES public.workout_days(id) ON DELETE SET NULL,

  -- Basic Info
  name TEXT NOT NULL, -- Snapshot of workout name

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- Total workout duration

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),

  -- Performance Summary (calculated)
  total_volume NUMERIC, -- Total weight x reps
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  personal_records_count INTEGER DEFAULT 0,

  -- Gamification
  xp_earned INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,
  feeling TEXT, -- How user felt overall

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_program ON public.workout_logs(program_id);

-- =====================================================
-- EXERCISE_LOGS TABLE (Exercise performance in a workout)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,

  -- Order
  exercise_order INTEGER NOT NULL,

  -- Exercise info snapshot
  exercise_name TEXT NOT NULL,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout ON public.exercise_logs(workout_log_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise ON public.exercise_logs(exercise_id);

-- =====================================================
-- SETS TABLE (Individual set performance)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID NOT NULL REFERENCES public.exercise_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,

  -- Set Info
  set_number INTEGER NOT NULL,
  set_type TEXT DEFAULT 'working' CHECK (set_type IN ('warmup', 'working', 'dropset', 'failure')),

  -- Performance Data
  weight NUMERIC,
  reps INTEGER,
  time_seconds INTEGER, -- For timed exercises
  distance NUMERIC, -- For distance-based exercises
  rpe INTEGER CHECK (rpe >= 0 AND rpe <= 10), -- Rate of Perceived Exertion

  -- Status
  completed BOOLEAN DEFAULT true,
  is_personal_record BOOLEAN DEFAULT false,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sets_exercise_log ON public.sets(exercise_log_id);
CREATE INDEX IF NOT EXISTS idx_sets_user_exercise ON public.sets(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_sets_user_date ON public.sets(user_id, created_at DESC);

-- =====================================================
-- PERSONAL_RECORDS TABLE (Track PRs)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,

  -- Record Type
  record_type TEXT NOT NULL CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume', 'best_time')),

  -- Record Value
  weight NUMERIC,
  reps INTEGER,
  volume NUMERIC, -- weight x reps
  time_seconds INTEGER,

  -- When achieved
  set_id UUID REFERENCES public.sets(id) ON DELETE SET NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exercise_id, record_type)
);

CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(user_id, exercise_id);

-- =====================================================
-- ACHIEVEMENTS TABLE (User achievements & badges)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Achievement Info
  achievement_type TEXT NOT NULL, -- 'streak_7', 'workout_50', 'pr_bench_press', etc.
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji or icon name

  -- Progress
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,

  -- XP Reward
  xp_reward INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON public.achievements(user_id, unlocked);

-- =====================================================
-- FRIENDSHIPS TABLE (Social connections)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(user_id, status);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER exercises_updated_at BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workout_days_updated_at BEFORE UPDATE ON public.workout_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workout_day_exercises_updated_at BEFORE UPDATE ON public.workout_day_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workout_logs_updated_at BEFORE UPDATE ON public.workout_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER exercise_logs_updated_at BEFORE UPDATE ON public.exercise_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sets_updated_at BEFORE UPDATE ON public.sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER personal_records_updated_at BEFORE UPDATE ON public.personal_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER achievements_updated_at BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
