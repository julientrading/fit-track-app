import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Globe, Lock } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { createExercise, updateExercise, getExerciseById } from '@/lib/database'
import type { Exercise } from '@/types/database'

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Glutes',
  'Calves',
  'Cardio',
]

const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbell',
  'Kettlebell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Resistance Band',
  'Medicine Ball',
  'TRX',
  'Other',
]

export function ExerciseEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { userProfile } = useAuthStore()
  const isEditMode = !!id

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'compound' | 'isolation' | 'cardio' | 'flexibility' | 'other'>('compound')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [tracksWeight, setTracksWeight] = useState(true)
  const [tracksReps, setTracksReps] = useState(true)
  const [tracksTime, setTracksTime] = useState(false)
  const [tracksDistance, setTracksDistance] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  // Load exercise data in edit mode
  useEffect(() => {
    if (!id || !isEditMode) return

    const loadExercise = async () => {
      try {
        setIsLoading(true)
        const exercise = await getExerciseById(id)

        if (!exercise) {
          alert('Exercise not found')
          navigate('/library/exercises')
          return
        }

        // Check if user owns this exercise
        if (userProfile && exercise.created_by !== userProfile.id) {
          alert('You can only edit your own exercises')
          navigate('/library/exercises')
          return
        }

        // Populate form with exercise data
        setName(exercise.name)
        setCategory(exercise.category)
        setDifficulty(exercise.difficulty || '')
        setDescription(exercise.description || '')
        setInstructions(exercise.instructions || '')
        setVideoUrl(exercise.video_url || '')
        setSelectedMuscleGroups(exercise.muscle_groups)
        setSelectedEquipment(exercise.equipment)
        setTracksWeight(exercise.tracks_weight)
        setTracksReps(exercise.tracks_reps)
        setTracksTime(exercise.tracks_time)
        setTracksDistance(exercise.tracks_distance)
        setIsPublic(exercise.is_public)
      } catch (error) {
        console.error('Failed to load exercise:', error)
        alert('Failed to load exercise')
        navigate('/library/exercises')
      } finally {
        setIsLoading(false)
      }
    }

    loadExercise()
  }, [id, isEditMode, userProfile, navigate])

  const toggleMuscleGroup = (muscle: string) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    )
  }

  const toggleEquipment = (equip: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equip) ? prev.filter((e) => e !== equip) : [...prev, equip]
    )
  }

  const handleSave = async () => {
    if (!userProfile) {
      alert('You must be logged in to save exercises')
      return
    }

    if (!name.trim()) {
      alert('Please enter an exercise name')
      return
    }

    if (selectedMuscleGroups.length === 0) {
      alert('Please select at least one muscle group')
      return
    }

    setIsSaving(true)
    try {
      if (isEditMode && id) {
        // Update existing exercise
        await updateExercise(id, {
          name: name.trim(),
          category,
          difficulty: difficulty || null,
          description: description.trim() || null,
          instructions: instructions.trim() || null,
          video_url: videoUrl.trim() || null,
          muscle_groups: selectedMuscleGroups,
          equipment: selectedEquipment,
          tracks_weight: tracksWeight,
          tracks_reps: tracksReps,
          tracks_time: tracksTime,
          tracks_distance: tracksDistance,
          is_public: isPublic,
        })
        alert('Exercise updated successfully!')
        navigate(`/library/exercise/${id}`)
      } else {
        // Create new exercise
        const newExercise = await createExercise({
          name: name.trim(),
          category,
          difficulty: difficulty || undefined,
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
          muscle_groups: selectedMuscleGroups,
          equipment: selectedEquipment,
          tracks_weight: tracksWeight,
          tracks_reps: tracksReps,
          tracks_time: tracksTime,
          tracks_distance: tracksDistance,
          is_public: isPublic,
          created_by: userProfile.id,
        })
        alert('Exercise created successfully!')
        navigate(`/library/exercise/${newExercise.id}`)
      }
    } catch (error) {
      console.error('Failed to save exercise:', error)
      alert('Failed to save exercise. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/library/exercises')}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex-1">
              {isEditMode ? 'Edit Exercise' : 'Create Exercise'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Exercise Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Barbell Bench Press"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-purple-400 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'compound', label: 'Compound' },
                { value: 'isolation', label: 'Isolation' },
                { value: 'cardio', label: 'Cardio' },
                { value: 'flexibility', label: 'Flexibility' },
                { value: 'other', label: 'Other' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value as any)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                    category === cat.value
                      ? 'bg-primary-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'Not Specified' },
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ].map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setDifficulty(diff.value as any)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                    difficulty === diff.value
                      ? 'bg-primary-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the exercise..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-purple-400 focus:outline-none resize-none"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-purple-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Muscle Groups */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Muscle Groups *</h2>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((muscle) => (
              <button
                key={muscle}
                onClick={() => toggleMuscleGroup(muscle)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  selectedMuscleGroups.includes(muscle)
                    ? 'bg-primary-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Equipment</h2>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((equip) => (
              <button
                key={equip}
                onClick={() => toggleEquipment(equip)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  selectedEquipment.includes(equip)
                    ? 'bg-primary-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {equip}
              </button>
            ))}
          </div>
        </div>

        {/* Tracking Options */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What to Track</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tracksWeight}
                onChange={(e) => setTracksWeight(e.target.checked)}
                className="w-5 h-5 text-primary-purple-600 rounded"
              />
              <span className="text-gray-900 font-semibold">Weight</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tracksReps}
                onChange={(e) => setTracksReps(e.target.checked)}
                className="w-5 h-5 text-primary-purple-600 rounded"
              />
              <span className="text-gray-900 font-semibold">Reps</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tracksTime}
                onChange={(e) => setTracksTime(e.target.checked)}
                className="w-5 h-5 text-primary-purple-600 rounded"
              />
              <span className="text-gray-900 font-semibold">Time</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tracksDistance}
                onChange={(e) => setTracksDistance(e.target.checked)}
                className="w-5 h-5 text-primary-purple-600 rounded"
              />
              <span className="text-gray-900 font-semibold">Distance</span>
            </label>
          </div>
        </div>

        {/* Video URL */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Demo Video (Optional)</h2>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-purple-400 focus:outline-none"
          />
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Visibility</h2>
          <p className="text-sm text-gray-600 mb-4">
            {isPublic
              ? 'This exercise will be visible to all users in the community library.'
              : 'This exercise will only be visible to you in your private library.'}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                isPublic ? 'bg-primary-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform flex items-center justify-center ${
                  isPublic ? 'translate-x-11' : 'translate-x-1'
                }`}
              >
                {isPublic ? (
                  <Globe className="w-4 h-4 text-primary-purple-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
              </span>
            </button>
            <div>
              <p className="font-semibold text-gray-900">
                {isPublic ? 'Public' : 'Private'}
              </p>
              <p className="text-sm text-gray-600">
                {isPublic ? 'Visible in community' : 'Only visible to you'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/library/exercises')}
            disabled={isSaving}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-primary-purple-600 text-white font-semibold rounded-xl hover:bg-primary-purple-700 transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Exercise'}
          </button>
        </div>
      </div>
    </div>
  )
}
