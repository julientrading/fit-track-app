import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export function EditProfile() {
  const navigate = useNavigate()
  const { userProfile, refreshProfile } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState(userProfile?.full_name || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!userProfile) return

    if (!fullName.trim()) {
      setError('Name cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ full_name: fullName.trim() })
        .eq('id', userProfile.id)

      if (updateError) throw updateError

      // Refresh profile to get updated data
      await refreshProfile()

      // Navigate back to profile
      navigate('/profile')
    } catch (err) {
      console.error('[EditProfile] Failed to update profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary text-white px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-5 h-5" />}
              required
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-600">
              {userProfile.email || 'No email'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSaving || !fullName.trim()}
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>

          {/* Cancel Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate('/profile')}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </form>
      </div>
    </div>
  )
}
