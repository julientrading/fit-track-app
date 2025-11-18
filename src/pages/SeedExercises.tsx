import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const sampleExercises = [
  {
    name: 'Barbell Bench Press',
    description: 'A classic compound exercise that primarily targets the chest, shoulders, and triceps.',
    instructions: `1. Lie flat on a bench with feet firmly on the ground
2. Grip the barbell slightly wider than shoulder-width
3. Lower the bar to your mid-chest with control
4. Press the bar back up to starting position
5. Keep your shoulder blades retracted throughout`,
    category: 'compound',
    muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'intermediate',
    video_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    tracks_weight: true,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Deadlift',
    description: 'The king of compound movements. Targets the entire posterior chain.',
    instructions: `1. Stand with feet hip-width apart, barbell over mid-foot
2. Bend down and grip the bar just outside your legs
3. Keep chest up, back flat, and core tight
4. Drive through your heels to stand up straight
5. Lower the bar back down with control`,
    category: 'compound',
    muscle_groups: ['Back', 'Glutes', 'Hamstrings', 'Core'],
    equipment: ['Barbell'],
    difficulty: 'advanced',
    video_url: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    tracks_weight: true,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Squat',
    description: 'A fundamental compound movement for building lower body strength and mass.',
    instructions: `1. Position barbell on upper traps
2. Stand with feet shoulder-width apart
3. Descend by breaking at hips and knees simultaneously
4. Go until thighs are parallel or lower
5. Drive through heels to return to standing`,
    category: 'compound',
    muscle_groups: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'intermediate',
    video_url: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    tracks_weight: true,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Pull-ups',
    description: 'A bodyweight exercise that builds upper body pulling strength.',
    instructions: `1. Hang from a pull-up bar with palms facing away
2. Engage your core and pull your body up
3. Continue until chin clears the bar
4. Lower yourself back down with control
5. Repeat for desired reps`,
    category: 'compound',
    muscle_groups: ['Back', 'Biceps', 'Forearms'],
    equipment: ['Pull-up Bar'],
    difficulty: 'intermediate',
    tracks_weight: false,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Dumbbell Shoulder Press',
    description: 'An excellent exercise for building shoulder strength and size.',
    instructions: `1. Sit on a bench with back support
2. Hold dumbbells at shoulder height, palms forward
3. Press weights overhead until arms are extended
4. Lower dumbbells back to shoulder height
5. Keep core engaged throughout`,
    category: 'compound',
    muscle_groups: ['Shoulders', 'Triceps'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'beginner',
    tracks_weight: true,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Bicep Curls',
    description: 'An isolation exercise that targets the biceps.',
    instructions: `1. Stand with dumbbells at your sides, palms forward
2. Keep elbows close to your body
3. Curl the weights up toward shoulders
4. Squeeze biceps at the top
5. Lower weights back down with control`,
    category: 'isolation',
    muscle_groups: ['Biceps', 'Forearms'],
    equipment: ['Dumbbells'],
    difficulty: 'beginner',
    tracks_weight: true,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Plank',
    description: 'An isometric core exercise that builds stability and endurance.',
    instructions: `1. Start in a push-up position on forearms
2. Keep body in a straight line from head to heels
3. Engage core and glutes
4. Hold position without letting hips sag
5. Breathe steadily throughout`,
    category: 'isolation',
    muscle_groups: ['Core', 'Shoulders'],
    equipment: [],
    difficulty: 'beginner',
    tracks_weight: false,
    tracks_reps: false,
    tracks_time: true,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Running',
    description: 'Cardiovascular exercise that improves endurance and burns calories.',
    instructions: `1. Start with a 5-minute warm-up walk
2. Maintain good posture with shoulders back
3. Land mid-foot, not on heels
4. Keep arms at 90 degrees, swinging naturally
5. Breathe rhythmically and stay relaxed`,
    category: 'cardio',
    muscle_groups: ['Legs', 'Cardio'],
    equipment: ['Running Shoes'],
    difficulty: 'beginner',
    tracks_weight: false,
    tracks_reps: false,
    tracks_time: true,
    tracks_distance: true,
    is_public: true,
  },
  {
    name: 'Lateral Raises',
    description: 'An isolation exercise that targets the side deltoids.',
    instructions: `1. Stand with dumbbells at your sides, palms facing in
2. Keep a slight bend in your elbows
3. Raise arms out to the sides until parallel to floor
4. Pause briefly at the top
5. Lower weights back down with control`,
    category: 'isolation',
    muscle_groups: ['Shoulders'],
    equipment: ['Dumbbells'],
    difficulty: 'beginner',
    tracks_weight: true,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
  {
    name: 'Romanian Deadlift',
    description: 'A hip-hinge movement that emphasizes the hamstrings and glutes.',
    instructions: `1. Stand with feet hip-width, holding barbell at thigh level
2. Keep knees slightly bent throughout
3. Push hips back while lowering the bar along your legs
4. Lower until you feel a stretch in hamstrings
5. Drive hips forward to return to standing`,
    category: 'compound',
    muscle_groups: ['Hamstrings', 'Glutes', 'Back'],
    equipment: ['Barbell'],
    difficulty: 'intermediate',
    tracks_weight: true,
    tracks_reps: true,
    tracks_time: false,
    tracks_distance: false,
    is_public: true,
  },
]

export function SeedExercises() {
  const navigate = useNavigate()
  const [isSeeding, setIsSeeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [clearSuccess, setClearSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seededCount, setSeededCount] = useState(0)
  const [clearedCount, setClearedCount] = useState(0)

  const handleClear = async () => {
    const confirmed = window.confirm(
      '⚠️ This will delete ALL public exercises from the database. Are you sure?'
    )

    if (!confirmed) return

    setIsClearing(true)
    setError(null)
    setClearSuccess(false)
    setSuccess(false)
    setClearedCount(0)

    try {
      console.log('🗑️ Clearing all public exercises...')

      const { data, error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('is_public', true)
        .select()

      if (deleteError) {
        throw deleteError
      }

      console.log('✅ Successfully cleared exercises:', data)
      setClearedCount(data?.length || 0)
      setClearSuccess(true)
    } catch (err) {
      console.error('❌ Error clearing exercises:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear exercises')
    } finally {
      setIsClearing(false)
    }
  }

  const handleSeed = async () => {
    setIsSeeding(true)
    setError(null)
    setSuccess(false)
    setClearSuccess(false)
    setSeededCount(0)

    try {
      console.log('🌱 Starting to seed exercises...')

      const { data, error: insertError } = await supabase
        .from('exercises')
        .insert(sampleExercises)
        .select()

      if (insertError) {
        throw insertError
      }

      console.log('✅ Successfully seeded exercises:', data)
      setSeededCount(data?.length || 0)
      setSuccess(true)
    } catch (err) {
      console.error('❌ Error seeding exercises:', err)
      setError(err instanceof Error ? err.message : 'Failed to seed exercises')
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl border-2 border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
            <Dumbbell className="w-8 h-8 text-primary-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Exercise Database</h1>
          <p className="text-gray-600">
            Clear all exercises and seed fresh, or just add 10 sample exercises for testing.
          </p>
        </div>

        {/* Seed Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold">Success!</p>
              <p className="text-green-700 text-sm mt-1">
                Successfully seeded {seededCount} exercises to the database.
              </p>
            </div>
          </div>
        )}

        {/* Clear Success Message */}
        {clearSuccess && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-semibold">Cleared!</p>
              <p className="text-blue-700 text-sm mt-1">
                Successfully deleted {clearedCount} exercise{clearedCount !== 1 ? 's' : ''} from the database.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Exercise List Preview */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Exercises to be added:</h3>
          <ul className="space-y-2 text-sm">
            {sampleExercises.map((ex, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <div className="w-1.5 h-1.5 bg-primary-purple-600 rounded-full"></div>
                <span>
                  {ex.name} <span className="text-gray-500">({ex.category})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Clear All Button */}
          <Button
            onClick={handleClear}
            fullWidth
            size="lg"
            disabled={isClearing || isSeeding}
            className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Clearing...</span>
              </div>
            ) : (
              '🗑️ Clear All Exercises'
            )}
          </Button>

          {/* Seed Button */}
          <Button
            onClick={handleSeed}
            variant="primary"
            fullWidth
            size="lg"
            disabled={isSeeding || isClearing}
          >
            {isSeeding ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Seeding...</span>
              </div>
            ) : (
              '🌱 Seed 10 Exercises'
            )}
          </Button>

          {/* Go to Library / Cancel Button */}
          <Button
            onClick={() => navigate('/library')}
            variant="outline"
            fullWidth
            size="lg"
          >
            {success || clearSuccess ? 'Go to Library' : 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  )
}
