-- Automatically create user profile when auth user is created
-- This trigger runs with elevated privileges, bypassing RLS

-- Function to create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    preferred_unit,
    xp,
    level,
    current_streak,
    longest_streak,
    theme,
    subscription_tier,
    subscription_status
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'preferred_unit', 'lbs'),
    0,
    1,
    0,
    0,
    'auto',
    'free',
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that calls the function after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
