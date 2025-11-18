import { supabase } from '../lib/supabase'

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

async function seedExercises() {
  console.log('🌱 Seeding exercises...')

  try {
    // Insert all exercises
    const { data, error } = await supabase
      .from('exercises')
      .insert(sampleExercises)
      .select()

    if (error) {
      console.error('❌ Error seeding exercises:', error)
      throw error
    }

    console.log('✅ Successfully seeded', data?.length, 'exercises!')
    console.log('Exercises:', data?.map((e) => e.name).join(', '))

    return data
  } catch (error) {
    console.error('Failed to seed exercises:', error)
    throw error
  }
}

// Run the seed function
seedExercises()
  .then(() => {
    console.log('🎉 Seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
