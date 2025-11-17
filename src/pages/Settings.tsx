import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Scale, Moon, Bell, Database } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export function Settings() {
  const navigate = useNavigate()
  const { userProfile, refreshProfile } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    preferredUnit: userProfile?.preferred_unit || 'lbs',
    darkMode: false, // Future feature
    notifications: true, // Future feature
  })

  const handleUnitChange = async (unit: 'lbs' | 'kg') => {
    if (!userProfile) return

    try {
      setIsSaving(true)
      setSettings({ ...settings, preferredUnit: unit })

      // Update in database
      const { error } = await supabase
        .from('users')
        .update({ preferred_unit: unit })
        .eq('id', userProfile.id)

      if (error) throw error

      // Refresh profile to get updated data
      await refreshProfile()

      setSuccessMessage('Unit preference updated!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('[Settings] Failed to update unit:', error)
      alert('Failed to update unit preference')
      // Revert on error
      setSettings({ ...settings, preferredUnit: userProfile.preferred_unit })
    } finally {
      setIsSaving(false)
    }
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
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-800 font-semibold">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Settings Groups */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Workout Preferences */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Workout Preferences</h3>

          {/* Unit Preference */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 rounded-xl p-2">
                <Scale className="w-5 h-5 text-primary-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Weight Unit</p>
                <p className="text-sm text-gray-600">Choose your preferred weight unit</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleUnitChange('lbs')}
                disabled={isSaving}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  settings.preferredUnit === 'lbs'
                    ? 'bg-primary-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Pounds (lbs)
              </button>
              <button
                onClick={() => handleUnitChange('kg')}
                disabled={isSaving}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  settings.preferredUnit === 'kg'
                    ? 'bg-primary-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Kilograms (kg)
              </button>
            </div>
          </div>
        </div>

        {/* Appearance (Coming Soon) */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance</h3>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-xl p-2">
                  <Moon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>
              <div className="w-12 h-7 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Notifications (Coming Soon) */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-xl p-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Workout Reminders</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>
              <div className="w-12 h-7 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Data & Privacy</h3>

          <div className="space-y-3">
            <button
              onClick={() => alert('Export data feature coming soon!')}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-primary-purple-400 hover:bg-purple-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-xl p-2">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-900">Export Your Data</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="pt-4 pb-8 text-center text-sm text-gray-500">
          <p className="font-semibold mb-1">Fit Track App</p>
          <p>Version 1.0.0</p>
          <p className="mt-2">Made with 💪 for fitness enthusiasts</p>
        </div>
      </div>
    </div>
  )
}
