-- Migration: Exercise Improvements
-- Date: 2024-11-19
-- Description: Adds support for muscle subcategories, custom metrics, and new exercise categories

-- 1. Add new category options: 'mobility' and 'warmup'
ALTER TABLE public.exercises
  DROP CONSTRAINT IF EXISTS exercises_category_check;

ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_category_check
  CHECK (category IN ('compound', 'isolation', 'cardio', 'flexibility', 'mobility', 'warmup', 'other'));

-- 2. Add muscle_targets field for specific muscle targeting
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS muscle_targets TEXT[] DEFAULT NULL;

COMMENT ON COLUMN public.exercises.muscle_targets IS 'Specific muscle targets for precision tracking (e.g., "Front Delt", "Rear Delt")';

-- 3. Add custom_metrics field for flexible exercise tracking
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS custom_metrics JSONB DEFAULT NULL;

COMMENT ON COLUMN public.exercises.custom_metrics IS 'Array of custom metric definitions. Example: [{"id": "rpe", "name": "RPE", "unit": "/10", "type": "number", "tracking_level": "per_set"}]';

-- 4. Add custom_values field to sets table for storing custom metric data
ALTER TABLE public.sets
  ADD COLUMN IF NOT EXISTS custom_values JSONB DEFAULT NULL;

COMMENT ON COLUMN public.sets.custom_values IS 'Custom metric values for this set. Example: {"rpe": 8, "heart_rate": 145}';

-- Create index for faster queries on custom metrics
CREATE INDEX IF NOT EXISTS idx_exercises_custom_metrics ON public.exercises USING GIN (custom_metrics);
CREATE INDEX IF NOT EXISTS idx_sets_custom_values ON public.sets USING GIN (custom_values);
