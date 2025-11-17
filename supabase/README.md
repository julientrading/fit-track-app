# Supabase Database Setup

This folder contains all database migrations for Fit Track App.

## 📋 Database Schema Overview

The database consists of 11 main tables:

1. **users** - User profiles and gamification data
2. **exercises** - Exercise library (system + user-created)
3. **programs** - Workout programs
4. **workout_days** - Days within a program
5. **workout_day_exercises** - Exercises assigned to each day
6. **workout_logs** - Completed workout sessions
7. **exercise_logs** - Exercise performance within a workout
8. **sets** - Individual set data (weight, reps, RPE)
9. **personal_records** - PR tracking per exercise
10. **achievements** - User achievements and badges
11. **friendships** - Social connections

## 🚀 Running Migrations

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - First: `20241116000000_initial_schema.sql`
   - Second: `20241116000001_rls_policies.sql`
   - Third: `20241116000002_helper_functions.sql`
4. Click **Run** for each file

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all migrations
supabase db push
```

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Public/template content is accessible to all
- Friends can see limited data about each other

## 🛠️ Helper Functions

The database includes several helper functions:

- **calculate_workout_volume()** - Calculates total volume for a workout
- **check_and_update_pr()** - Automatically checks and updates personal records
- **update_user_streak()** - Updates user workout streaks
- **get_last_performance()** - Retrieves last performance for an exercise

## 📊 Automatic Triggers

The following happen automatically:

1. **PR Detection** - When a set is logged, it checks if it's a PR
2. **Workout Summary** - Total volume, sets, reps are auto-calculated
3. **Updated_at** - All tables automatically update their `updated_at` timestamp

## 🔍 Testing Your Schema

After running migrations, verify everything works:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verify functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

## 📝 Next Steps

After setting up the database:

1. Create a test user in Supabase Authentication
2. Insert some sample exercises
3. Create a test program
4. Log a test workout
5. Verify data appears correctly in your app

## 🐛 Troubleshooting

**"relation already exists" error:**
- This means the table already exists. Either drop it first or skip that migration.

**Permission denied:**
- Make sure you're connected to the correct project
- Verify you have admin access to the database

**RLS policies not working:**
- Make sure you're authenticated when testing
- Check that `auth.uid()` returns the correct user ID

## 📖 Documentation

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
