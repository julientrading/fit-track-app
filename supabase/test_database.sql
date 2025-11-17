-- =====================================================
-- DATABASE VERIFICATION & TESTING QUERIES
-- Run these in Supabase SQL Editor to verify your database
-- =====================================================

-- =====================================================
-- 1. VERIFY ALL TABLES EXIST
-- =====================================================
-- Expected: Should show 11 tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 2. VERIFY RLS IS ENABLED
-- =====================================================
-- Expected: All tables should have rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 3. VERIFY HELPER FUNCTIONS EXIST
-- =====================================================
-- Expected: Should show 7 functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- =====================================================
-- 4. CREATE A TEST USER PROFILE
-- =====================================================
-- Note: Replace 'YOUR_USER_ID' with your actual auth.users ID
-- You can find this in: Authentication → Users → Copy your user ID

INSERT INTO public.users (
  id,
  email,
  full_name,
  preferred_unit
) VALUES (
  'YOUR_USER_ID', -- Replace with your actual user ID from auth.users
  'test@fittrack.com',
  'Test User',
  'lbs'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  preferred_unit = EXCLUDED.preferred_unit;

-- =====================================================
-- 5. INSERT SAMPLE EXERCISES
-- =====================================================
INSERT INTO public.exercises (
  name,
  description,
  category,
  muscle_groups,
  equipment,
  difficulty,
  tracks_weight,
  tracks_reps,
  is_public
) VALUES
  (
    'Barbell Bench Press',
    'Compound chest exercise performed lying on a bench',
    'compound',
    ARRAY['chest', 'shoulders', 'triceps'],
    ARRAY['barbell', 'bench'],
    'intermediate',
    true,
    true,
    true
  ),
  (
    'Barbell Squat',
    'Compound leg exercise - the king of all exercises',
    'compound',
    ARRAY['quads', 'glutes', 'hamstrings'],
    ARRAY['barbell', 'squat rack'],
    'intermediate',
    true,
    true,
    true
  ),
  (
    'Pull-ups',
    'Bodyweight back exercise',
    'compound',
    ARRAY['back', 'biceps'],
    ARRAY['pull-up bar'],
    'intermediate',
    true,
    true,
    true
  ),
  (
    'Dumbbell Shoulder Press',
    'Shoulder pressing movement with dumbbells',
    'compound',
    ARRAY['shoulders', 'triceps'],
    ARRAY['dumbbells'],
    'beginner',
    true,
    true,
    true
  ),
  (
    'Barbell Deadlift',
    'Full body compound movement',
    'compound',
    ARRAY['back', 'glutes', 'hamstrings'],
    ARRAY['barbell'],
    'advanced',
    true,
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. VERIFY EXERCISES WERE CREATED
-- =====================================================
SELECT id, name, category, muscle_groups, is_public
FROM public.exercises
ORDER BY name;

-- =====================================================
-- 7. CREATE A TEST PROGRAM
-- =====================================================
-- Note: Replace 'YOUR_USER_ID' with your actual user ID
INSERT INTO public.programs (
  user_id,
  name,
  description,
  goal,
  difficulty,
  duration_weeks,
  days_per_week,
  is_active
) VALUES (
  'YOUR_USER_ID', -- Replace with your user ID
  'Push Pull Legs',
  'Classic 3-day split focusing on push, pull, and leg movements',
  'build_muscle',
  'intermediate',
  12,
  3,
  true
)
RETURNING id, name, description;

-- Save the program ID from above, you'll need it for the next step!

-- =====================================================
-- 8. CREATE WORKOUT DAYS FOR THE PROGRAM
-- =====================================================
-- Note: Replace 'YOUR_PROGRAM_ID' with the ID from step 7
INSERT INTO public.workout_days (
  program_id,
  name,
  description,
  day_number
) VALUES
  (
    'YOUR_PROGRAM_ID', -- Replace with your program ID
    'Push Day',
    'Chest, shoulders, and triceps',
    1
  ),
  (
    'YOUR_PROGRAM_ID',
    'Pull Day',
    'Back and biceps',
    2
  ),
  (
    'YOUR_PROGRAM_ID',
    'Leg Day',
    'Quads, hamstrings, and glutes',
    3
  )
RETURNING id, name, day_number;

-- =====================================================
-- 9. TEST AUTOMATIC FEATURES
-- =====================================================

-- Test 1: Create a workout log
-- Replace 'YOUR_USER_ID' and 'YOUR_PROGRAM_ID'
INSERT INTO public.workout_logs (
  user_id,
  program_id,
  name,
  started_at,
  status
) VALUES (
  'YOUR_USER_ID',
  'YOUR_PROGRAM_ID',
  'Test Push Day',
  NOW(),
  'in_progress'
)
RETURNING id, name, started_at;

-- Save the workout_log ID!

-- Test 2: Create an exercise log
-- Replace 'YOUR_WORKOUT_LOG_ID' and 'YOUR_EXERCISE_ID' (get bench press ID from step 6)
INSERT INTO public.exercise_logs (
  workout_log_id,
  exercise_id,
  exercise_order,
  exercise_name
) VALUES (
  'YOUR_WORKOUT_LOG_ID',
  'YOUR_EXERCISE_ID', -- Use Bench Press ID
  1,
  'Barbell Bench Press'
)
RETURNING id, exercise_name;

-- Save the exercise_log ID!

-- Test 3: Log some sets (this will trigger automatic PR detection!)
-- Replace 'YOUR_EXERCISE_LOG_ID', 'YOUR_USER_ID', 'YOUR_EXERCISE_ID'
INSERT INTO public.sets (
  exercise_log_id,
  user_id,
  exercise_id,
  set_number,
  set_type,
  weight,
  reps,
  rpe,
  completed
) VALUES
  (
    'YOUR_EXERCISE_LOG_ID',
    'YOUR_USER_ID',
    'YOUR_EXERCISE_ID', -- Bench Press ID
    1,
    'warmup',
    135,
    10,
    6,
    true
  ),
  (
    'YOUR_EXERCISE_LOG_ID',
    'YOUR_USER_ID',
    'YOUR_EXERCISE_ID',
    2,
    'working',
    225,
    8,
    8,
    true
  ),
  (
    'YOUR_EXERCISE_LOG_ID',
    'YOUR_USER_ID',
    'YOUR_EXERCISE_ID',
    3,
    'working',
    225,
    10,
    9,
    true
  )
RETURNING id, set_number, weight, reps, is_personal_record;

-- =====================================================
-- 10. VERIFY AUTOMATIC FEATURES WORKED
-- =====================================================

-- Check if PRs were automatically created
-- Replace 'YOUR_USER_ID' and 'YOUR_EXERCISE_ID'
SELECT
  record_type,
  weight,
  reps,
  volume,
  achieved_at
FROM public.personal_records
WHERE user_id = 'YOUR_USER_ID'
AND exercise_id = 'YOUR_EXERCISE_ID';

-- Check if workout summary was auto-calculated
-- Replace 'YOUR_WORKOUT_LOG_ID'
SELECT
  name,
  total_sets,
  total_reps,
  total_volume,
  personal_records_count
FROM public.workout_logs
WHERE id = 'YOUR_WORKOUT_LOG_ID';

-- =====================================================
-- 11. TEST HELPER FUNCTION: Get Last Performance
-- =====================================================
-- Replace 'YOUR_USER_ID' and 'YOUR_EXERCISE_ID'
SELECT *
FROM get_last_performance(
  'YOUR_USER_ID',
  'YOUR_EXERCISE_ID',
  1 -- set number
);

-- =====================================================
-- 12. VIEW ALL YOUR DATA
-- =====================================================
-- Replace 'YOUR_USER_ID'

-- Your programs
SELECT id, name, description, is_active
FROM public.programs
WHERE user_id = 'YOUR_USER_ID';

-- Your workout history
SELECT id, name, started_at, total_sets, total_volume, status
FROM public.workout_logs
WHERE user_id = 'YOUR_USER_ID'
ORDER BY started_at DESC;

-- Your personal records
SELECT e.name as exercise_name, pr.record_type, pr.weight, pr.reps, pr.volume
FROM public.personal_records pr
JOIN public.exercises e ON e.id = pr.exercise_id
WHERE pr.user_id = 'YOUR_USER_ID';

-- =====================================================
-- 13. CLEANUP (Optional - run this to start fresh)
-- =====================================================
-- WARNING: This deletes all test data!
-- Only run if you want to start over

-- DELETE FROM public.sets WHERE user_id = 'YOUR_USER_ID';
-- DELETE FROM public.exercise_logs WHERE workout_log_id IN (SELECT id FROM public.workout_logs WHERE user_id = 'YOUR_USER_ID');
-- DELETE FROM public.workout_logs WHERE user_id = 'YOUR_USER_ID';
-- DELETE FROM public.workout_days WHERE program_id IN (SELECT id FROM public.programs WHERE user_id = 'YOUR_USER_ID');
-- DELETE FROM public.programs WHERE user_id = 'YOUR_USER_ID';
-- DELETE FROM public.personal_records WHERE user_id = 'YOUR_USER_ID';
-- DELETE FROM public.users WHERE id = 'YOUR_USER_ID';

-- =====================================================
-- SUCCESS CHECKLIST
-- =====================================================
-- ✅ All 11 tables exist
-- ✅ RLS is enabled on all tables
-- ✅ Helper functions exist
-- ✅ Sample exercises created
-- ✅ Test program created
-- ✅ Workout logged successfully
-- ✅ Sets logged successfully
-- ✅ PRs auto-detected and saved
-- ✅ Workout summary auto-calculated
-- ✅ Helper function works

-- If all of the above work, your database is ready! 🎉
