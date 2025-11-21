import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Globe, Lock, Plus, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { createExercise, updateExercise, getExerciseById } from '@/lib/database'
import type { Exercise, CustomMetric } from '@/types/database'

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

const MUSCLE_SUBCATEGORIES: Record<string, string[]> = {
  Chest: ['Upper Chest', 'Middle Chest', 'Lower Chest'],
  Back: ['Lats', 'Traps', 'Rhomboids', 'Lower Back', 'Erector Spinae'],
  Shoulders: ['Front Delt', 'Side Delt', 'Rear Delt'],
  Arms: ['Biceps', 'Triceps', 'Forearms'],
  Legs: ['Quads', 'Hamstrings', 'Adductors', 'Abductors'],
  Core: ['Abs', 'Obliques'],
  Glutes: ['Glute Max', 'Glute Med/Min'],
  Calves: ['Gastrocnemius', 'Soleus'],
}

const EQUIPMENT_OPTIONS = {
  Weights: ['Barbell', 'Dumbbell', 'Kettlebell'],
  Bodyweight: ['Bodyweight', 'Pull-up Bar', 'Rings', 'Parallettes', 'Dip Station', 'Box/Bench', 'Wall', 'Ab Wheel'],
  Gym: ['Gym Machine', 'Cable'],
  Other: ['Resistance Band', 'Medicine Ball', 'TRX', 'Other'],
}

export function ExerciseEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { userProfile } = useAuthStore()
  const isEditMode = !!id

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'compound' | 'isolation' | 'cardio' | 'flexibility' | 'mobility' | 'warmup' | 'other'>('compound')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedMuscleTargets, setSelectedMuscleTargets] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [requiresEquipment, setRequiresEquipment] = useState(false)
  const [tracksWeight, setTracksWeight] = useState(true)
  const [tracksReps, setTracksReps] = useState(true)
  const [tracksTime, setTracksTime] = useState(false)
  const [tracksDistance, setTracksDistance] = useState(false)
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([])
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
        setSelectedMuscleTargets(exercise.muscle_targets || [])
        setSelectedEquipment(exercise.equipment)
        setRequiresEquipment(exercise.equipment.length > 0)
        setTracksWeight(exercise.tracks_weight)
        setTracksReps(exercise.tracks_reps)
        setTracksTime(exercise.tracks_time)
        setTracksDistance(exercise.tracks_distance)
        setCustomMetrics(exercise.custom_metrics || [])
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
    setSelectedMuscleGroups((prev) => {
      if (prev.includes(muscle)) {
        // Remove muscle group and its subcategories
        const subcategories = MUSCLE_SUBCATEGORIES[muscle] || []
        setSelectedMuscleTargets((targets) =>
          targets.filter((t) => !subcategories.includes(t))
        )
        return prev.filter((m) => m !== muscle)
      } else {
        return [...prev, muscle]
      }
    })
  }

  const toggleMuscleTarget = (target: string) => {
    setSelectedMuscleTargets((prev) =>
      prev.includes(target) ? prev.filter((t) => t !== target) : [...prev, target]
    )
  }

  const toggleEquipment = (equip: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equip) ? prev.filter((e) => e !== equip) : [...prev, equip]
    )
  }

  const addCustomMetric = () => {
    const newMetric: CustomMetric = {
      id: `temp-${Date.now()}`,
      name: '',
      unit: '',
      type: 'number',
      tracking_level: 'per_set',
    }
    setCustomMetrics((prev) => [...prev, newMetric])
  }

  const updateCustomMetric = (id: string, updates: Partial<CustomMetric>) => {
    setCustomMetrics((prev) =>
      prev.map((metric) => (metric.id === id ? { ...metric, ...updates } : metric))
    )
  }

  const removeCustomMetric = (id: string) => {
    setCustomMetrics((prev) => prev.filter((metric) => metric.id !== id))
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

    // Clean custom metrics: remove temporary IDs and generate new ones
    const cleanedCustomMetrics = customMetrics.map((metric) => ({
      id: metric.id.startsWith('temp-') ? crypto.randomUUID() : metric.id,
      name: metric.name,
      unit: metric.unit,
      type: metric.type,
      tracking_level: metric.tracking_level,
    }))

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
          muscle_targets: selectedMuscleTargets.length > 0 ? selectedMuscleTargets : null,
          equipment: selectedEquipment,
          tracks_weight: tracksWeight,
          tracks_reps: tracksReps,
          tracks_time: tracksTime,
          tracks_distance: tracksDistance,
          custom_metrics: cleanedCustomMetrics.length > 0 ? cleanedCustomMetrics : null,
          is_public: isPublic,
        })
        console.log('[ExerciseEditor] Exercise updated successfully')
        navigate(`/library/exercise/${id}`, { replace: true })
      } else {
        // Create new exercise
        console.log('[ExerciseEditor] Creating exercise with:', {
          name: name.trim(),
          category,
          muscle_groups: selectedMuscleGroups,
          muscle_targets: selectedMuscleTargets,
          equipment: selectedEquipment,
          custom_metrics: cleanedCustomMetrics,
        })

        const newExercise = await createExercise({
          name: name.trim(),
          category,
          difficulty: difficulty || undefined,
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
          muscle_groups: selectedMuscleGroups,
          muscle_targets: selectedMuscleTargets.length > 0 ? selectedMuscleTargets : undefined,
          equipment: selectedEquipment,
          tracks_weight: tracksWeight,
          tracks_reps: tracksReps,
          tracks_time: tracksTime,
          tracks_distance: tracksDistance,
          custom_metrics: cleanedCustomMetrics.length > 0 ? cleanedCustomMetrics : undefined,
          is_public: isPublic,
          created_by: userProfile.id,
        })

        console.log('[ExerciseEditor] Exercise created:', newExercise)
        console.log('[ExerciseEditor] Navigating to:', `/library/exercise/${newExercise.id}`)
        navigate(`/library/exercise/${newExercise.id}`, { replace: true })
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
                { value: 'mobility', label: 'Mobility' },
                { value: 'warmup', label: 'Warmup' },
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Muscle Groups *</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select primary muscle groups, then optionally specify exact targets below
          </p>
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

          {/* Muscle Targets (Subcategories) */}
          {selectedMuscleGroups.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Specific Muscle Targets (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select specific muscles to target for more precise tracking and recommendations
              </p>
              <div className="space-y-4">
                {selectedMuscleGroups.map((muscle) => {
                  const subcategories = MUSCLE_SUBCATEGORIES[muscle]
                  if (!subcategories) return null

                  return (
                    <div key={muscle}>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        {muscle}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map((target) => (
                          <button
                            key={target}
                            onClick={() => toggleMuscleTarget(target)}
                            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition ${
                              selectedMuscleTargets.includes(target)
                                ? 'bg-purple-100 text-purple-700 border-2 border-purple-400'
                                : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {target}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Equipment</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresEquipment}
                onChange={(e) => {
                  setRequiresEquipment(e.target.checked)
                  if (!e.target.checked) {
                    setSelectedEquipment([])
                  }
                }}
                className="w-5 h-5 text-primary-purple-600 rounded"
              />
              <span className="text-sm font-semibold text-gray-700">Requires equipment</span>
            </label>
          </div>

          {requiresEquipment && (
            <div className="space-y-4">
              {Object.entries(EQUIPMENT_OPTIONS).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    {group}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((equip) => (
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
              ))}
            </div>
          )}

          {!requiresEquipment && (
            <p className="text-sm text-gray-500 italic">
              This exercise doesn't require any equipment (bodyweight, stretching, etc.)
            </p>
          )}
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

        {/* Custom Metrics */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Custom Metrics (Optional)</h2>
            <button
              type="button"
              onClick={addCustomMetric}
              className="flex items-center gap-2 px-3 py-2 bg-primary-purple-600 text-white font-semibold rounded-lg hover:bg-primary-purple-700 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Metric
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Track additional metrics like RPE, heart rate, elevation, tempo, etc.
          </p>

          {customMetrics.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 text-sm">
                No custom metrics added. Click "Add Metric" to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="border-2 border-gray-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Metric Details</h4>
                    <button
                      type="button"
                      onClick={() => removeCustomMetric(metric.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Metric Name *
                      </label>
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) =>
                          updateCustomMetric(metric.id, { name: e.target.value })
                        }
                        placeholder="e.g., RPE, Heart Rate"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-purple-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Unit *
                      </label>
                      <input
                        type="text"
                        value={metric.unit}
                        onChange={(e) =>
                          updateCustomMetric(metric.id, { unit: e.target.value })
                        }
                        placeholder="e.g., /10, bpm, feet"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={metric.type}
                        onChange={(e) =>
                          updateCustomMetric(metric.id, {
                            type: e.target.value as CustomMetric['type'],
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-purple-400 focus:outline-none"
                      >
                        <option value="number">Whole Number</option>
                        <option value="decimal">Decimal</option>
                        <option value="duration">Duration (mm:ss)</option>
                        <option value="text">Text</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Track For
                      </label>
                      <select
                        value={metric.tracking_level}
                        onChange={(e) =>
                          updateCustomMetric(metric.id, {
                            tracking_level: e.target.value as CustomMetric['tracking_level'],
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-primary-purple-400 focus:outline-none"
                      >
                        <option value="per_set">Each Set</option>
                        <option value="per_exercise">Whole Exercise</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
