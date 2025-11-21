import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'

export function Signup() {
  const navigate = useNavigate()
  const { signUp, isLoading, clearError } = useAuthStore()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferredUnit: 'lbs' as 'lbs' | 'kg',
  })
  const [passwordError, setPasswordError] = useState('')
  const [signupError, setSignupError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setPasswordError('')
    setSignupError(null)

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        preferredUnit: formData.preferredUnit,
      })
      navigate('/')
    } catch (error) {
      setSignupError((error as Error).message)
      console.error('Signup failed:', error)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-lg mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start tracking your fitness journey today
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {signupError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Signup failed
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {signupError}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => updateFormData('fullName', e.target.value)}
              leftIcon={<User className="w-5 h-5" />}
              required
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              required
              autoComplete="new-password"
              helperText="At least 6 characters"
              error={passwordError}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              required
              autoComplete="new-password"
            />

            {/* Preferred Unit Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Preferred Weight Unit
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateFormData('preferredUnit', 'lbs')}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.preferredUnit === 'lbs'
                      ? 'border-primary-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.preferredUnit === 'lbs' && (
                      <CheckCircle2 className="w-5 h-5 text-primary-purple-600" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      lbs
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Pounds
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('preferredUnit', 'kg')}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.preferredUnit === 'kg'
                      ? 'border-primary-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.preferredUnit === 'kg' && (
                      <CheckCircle2 className="w-5 h-5 text-primary-purple-600" />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      kg
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Kilograms
                  </p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-purple-600 hover:text-primary-purple-700 font-semibold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-purple-600 hover:underline">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-purple-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
