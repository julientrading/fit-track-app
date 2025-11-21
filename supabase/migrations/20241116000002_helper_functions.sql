-- Helper Functions for Common Operations

-- =====================================================
-- FUNCTION: Calculate workout volume
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_workout_volume(workout_log_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_volume NUMERIC;
BEGIN
  SELECT COALESCE(SUM(weight * reps), 0)
  INTO total_volume
  FROM public.sets s
  JOIN public.exercise_logs el ON el.id = s.exercise_log_id
  WHERE el.workout_log_id = workout_log_uuid
  AND s.weight IS NOT NULL
  AND s.reps IS NOT NULL;

  RETURN total_volume;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Check and update personal record
-- =====================================================
CREATE OR REPLACE FUNCTION check_and_update_pr(
  p_user_id UUID,
  p_exercise_id UUID,
  p_set_id UUID,
  p_weight NUMERIC,
  p_reps INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_pr RECORD;
  new_volume NUMERIC;
  is_new_pr BOOLEAN := false;
BEGIN
  new_volume := p_weight * p_reps;

  -- Check for max weight PR
  SELECT * INTO current_pr
  FROM public.personal_records
  WHERE user_id = p_user_id
  AND exercise_id = p_exercise_id
  AND record_type = 'max_weight';

  IF NOT FOUND OR p_weight > current_pr.weight THEN
    INSERT INTO public.personal_records (user_id, exercise_id, record_type, weight, reps, set_id)
    VALUES (p_user_id, p_exercise_id, 'max_weight', p_weight, p_reps, p_set_id)
    ON CONFLICT (user_id, exercise_id, record_type)
    DO UPDATE SET
      weight = p_weight,
      reps = p_reps,
      set_id = p_set_id,
      achieved_at = NOW();
    is_new_pr := true;
  END IF;

  -- Check for max volume PR (weight x reps)
  SELECT * INTO current_pr
  FROM public.personal_records
  WHERE user_id = p_user_id
  AND exercise_id = p_exercise_id
  AND record_type = 'max_volume';

  IF NOT FOUND OR new_volume > current_pr.volume THEN
    INSERT INTO public.personal_records (user_id, exercise_id, record_type, weight, reps, volume, set_id)
    VALUES (p_user_id, p_exercise_id, 'max_volume', p_weight, p_reps, new_volume, p_set_id)
    ON CONFLICT (user_id, exercise_id, record_type)
    DO UPDATE SET
      weight = p_weight,
      reps = p_reps,
      volume = new_volume,
      set_id = p_set_id,
      achieved_at = NOW();
    is_new_pr := true;
  END IF;

  -- Mark set as PR if it is one
  IF is_new_pr THEN
    UPDATE public.sets
    SET is_personal_record = true
    WHERE id = p_set_id;
  END IF;

  RETURN is_new_pr;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Update user streak
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  last_workout DATE;
  current_streak INT;
  longest_streak INT;
BEGIN
  -- Get user's current streaks
  SELECT users.last_workout_date, users.current_streak, users.longest_streak
  INTO last_workout, current_streak, longest_streak
  FROM public.users
  WHERE id = p_user_id;

  -- If last workout was yesterday, increment streak
  IF last_workout = CURRENT_DATE - INTERVAL '1 day' THEN
    current_streak := current_streak + 1;

  -- If last workout was today, don't change streak
  ELSIF last_workout = CURRENT_DATE THEN
    -- Do nothing
    RETURN;

  -- Otherwise, reset streak to 1
  ELSE
    current_streak := 1;
  END IF;

  -- Update longest streak if current exceeds it
  IF current_streak > longest_streak THEN
    longest_streak := current_streak;
  END IF;

  -- Update user record
  UPDATE public.users
  SET
    current_streak = current_streak,
    longest_streak = longest_streak,
    last_workout_date = CURRENT_DATE
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get last performance for exercise
-- =====================================================
CREATE OR REPLACE FUNCTION get_last_performance(
  p_user_id UUID,
  p_exercise_id UUID,
  p_set_number INTEGER DEFAULT 1
)
RETURNS TABLE (
  weight NUMERIC,
  reps INTEGER,
  rpe INTEGER,
  performed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.weight,
    s.reps,
    s.rpe,
    s.created_at as performed_at
  FROM public.sets s
  JOIN public.exercise_logs el ON el.id = s.exercise_log_id
  JOIN public.workout_logs wl ON wl.id = el.workout_log_id
  WHERE s.user_id = p_user_id
  AND s.exercise_id = p_exercise_id
  AND s.set_number = p_set_number
  AND wl.status = 'completed'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update workout summary on set completion
-- =====================================================
CREATE OR REPLACE FUNCTION update_workout_summary()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.workout_logs
  SET
    total_sets = (
      SELECT COUNT(*)
      FROM public.sets s
      JOIN public.exercise_logs el ON el.id = s.exercise_log_id
      WHERE el.workout_log_id = (
        SELECT workout_log_id
        FROM public.exercise_logs
        WHERE id = NEW.exercise_log_id
      )
    ),
    total_reps = (
      SELECT COALESCE(SUM(reps), 0)
      FROM public.sets s
      JOIN public.exercise_logs el ON el.id = s.exercise_log_id
      WHERE el.workout_log_id = (
        SELECT workout_log_id
        FROM public.exercise_logs
        WHERE id = NEW.exercise_log_id
      )
    ),
    total_volume = (
      SELECT COALESCE(SUM(weight * reps), 0)
      FROM public.sets s
      JOIN public.exercise_logs el ON el.id = s.exercise_log_id
      WHERE el.workout_log_id = (
        SELECT workout_log_id
        FROM public.exercise_logs
        WHERE id = NEW.exercise_log_id
      )
      AND weight IS NOT NULL
      AND reps IS NOT NULL
    ),
    personal_records_count = (
      SELECT COUNT(*)
      FROM public.sets s
      JOIN public.exercise_logs el ON el.id = s.exercise_log_id
      WHERE el.workout_log_id = (
        SELECT workout_log_id
        FROM public.exercise_logs
        WHERE id = NEW.exercise_log_id
      )
      AND s.is_personal_record = true
    )
  WHERE id = (
    SELECT workout_log_id
    FROM public.exercise_logs
    WHERE id = NEW.exercise_log_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workout_summary_on_set
  AFTER INSERT OR UPDATE ON public.sets
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_summary();

-- =====================================================
-- TRIGGER: Check for PR on set insert/update
-- =====================================================
CREATE OR REPLACE FUNCTION check_pr_on_set()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL THEN
    PERFORM check_and_update_pr(
      NEW.user_id,
      NEW.exercise_id,
      NEW.id,
      NEW.weight,
      NEW.reps
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_pr_after_set
  AFTER INSERT OR UPDATE ON public.sets
  FOR EACH ROW
  EXECUTE FUNCTION check_pr_on_set();
