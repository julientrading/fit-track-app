-- Row Level Security (RLS) Policies
-- This ensures users can only access their own data

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_day_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- EXERCISES TABLE POLICIES
-- =====================================================
-- Everyone can read public/system exercises
CREATE POLICY "Anyone can view public exercises"
  ON public.exercises FOR SELECT
  USING (is_public = true OR created_by IS NULL OR created_by = auth.uid());

-- Users can create their own exercises
CREATE POLICY "Users can create own exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own exercises
CREATE POLICY "Users can update own exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can delete their own exercises
CREATE POLICY "Users can delete own exercises"
  ON public.exercises FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- PROGRAMS TABLE POLICIES
-- =====================================================
-- Users can read their own programs and public templates
CREATE POLICY "Users can view own programs"
  ON public.programs FOR SELECT
  USING (auth.uid() = user_id OR (is_public = true AND is_template = true));

-- Users can create programs
CREATE POLICY "Users can create programs"
  ON public.programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own programs
CREATE POLICY "Users can update own programs"
  ON public.programs FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own programs
CREATE POLICY "Users can delete own programs"
  ON public.programs FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- WORKOUT_DAYS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view workout days of their programs"
  ON public.workout_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = workout_days.program_id
      AND (programs.user_id = auth.uid() OR (programs.is_public = true AND programs.is_template = true))
    )
  );

CREATE POLICY "Users can create workout days for their programs"
  ON public.workout_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = workout_days.program_id
      AND programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workout days of their programs"
  ON public.workout_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = workout_days.program_id
      AND programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workout days of their programs"
  ON public.workout_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = workout_days.program_id
      AND programs.user_id = auth.uid()
    )
  );

-- =====================================================
-- WORKOUT_DAY_EXERCISES TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view exercises in their workout days"
  ON public.workout_day_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_days wd
      JOIN public.programs p ON p.id = wd.program_id
      WHERE wd.id = workout_day_exercises.workout_day_id
      AND (p.user_id = auth.uid() OR (p.is_public = true AND p.is_template = true))
    )
  );

CREATE POLICY "Users can add exercises to their workout days"
  ON public.workout_day_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_days wd
      JOIN public.programs p ON p.id = wd.program_id
      WHERE wd.id = workout_day_exercises.workout_day_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises in their workout days"
  ON public.workout_day_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_days wd
      JOIN public.programs p ON p.id = wd.program_id
      WHERE wd.id = workout_day_exercises.workout_day_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises from their workout days"
  ON public.workout_day_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_days wd
      JOIN public.programs p ON p.id = wd.program_id
      WHERE wd.id = workout_day_exercises.workout_day_id
      AND p.user_id = auth.uid()
    )
  );

-- =====================================================
-- WORKOUT_LOGS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own workout logs"
  ON public.workout_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout logs"
  ON public.workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON public.workout_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON public.workout_logs FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- EXERCISE_LOGS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own exercise logs"
  ON public.exercise_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own exercise logs"
  ON public.exercise_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise logs"
  ON public.exercise_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercise logs"
  ON public.exercise_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- =====================================================
-- SETS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own sets"
  ON public.sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sets"
  ON public.sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sets"
  ON public.sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sets"
  ON public.sets FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PERSONAL_RECORDS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own PRs"
  ON public.personal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own PRs"
  ON public.personal_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PRs"
  ON public.personal_records FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- ACHIEVEMENTS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON public.achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FRIENDSHIPS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id);
