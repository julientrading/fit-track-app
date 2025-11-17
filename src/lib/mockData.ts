// Mock data for development (will be replaced with real Supabase data later)

export const mockUser = {
  id: '1',
  name: 'Alex',
  email: 'alex@fittrack.com',
  streak: 14,
  level: 12,
  xp: 850,
  xpToNextLevel: 1000,
}

export const mockNextWorkout = {
  id: '1',
  name: 'Pull Day',
  programName: 'Push Pull Legs',
  estimatedDuration: 60,
  currentDay: 5,
  totalDays: 6,
  allExercises: [
    { name: 'Weighted Pull-ups', sets: 3 },
    { name: 'Barbell Rows', sets: 4 },
    { name: 'Face Pulls', sets: 3 },
    { name: 'Bicep Curls', sets: 3 },
    { name: 'Hammer Curls', sets: 3 },
  ],
}

export const mockWeeklyStats = {
  workouts: 4,
  workoutsChange: '+2',
  totalTime: '4.2h',
  avgTime: '~63 min/session',
  personalRecords: 3,
  xpEarned: 850,
  levelProgress: 73,
}

export const mockRecentActivity = [
  {
    id: '1',
    name: 'Push Day',
    daysAgo: 2,
    duration: 58,
    xp: 150,
    achievements: [
      { type: 'pr', name: 'Bench Press' },
      { type: 'pr', name: 'Dips' },
    ],
  },
  {
    id: '2',
    name: 'Leg Day',
    daysAgo: 3,
    duration: 62,
    xp: 180,
    achievements: [{ type: 'badge', name: '🏆 Leg Legend' }],
  },
]

export const mockLatestAchievement = {
  id: '1',
  emoji: '🏆',
  name: 'Two Week Warrior',
  description: 'Complete 14 consecutive days',
  nextAchievement: 'Three Week Champion',
  progress: 14,
  goal: 21,
  progressPercentage: 67,
}
