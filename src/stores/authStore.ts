import { create } from 'zustand'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { User } from '@/types/database'
import { getCurrentUser, getUserProfile, login, logout, signUp, onAuthStateChange } from '@/lib/auth'
import type { LoginData, SignUpData } from '@/lib/auth'

interface AuthState {
  // State
  authUser: AuthUser | null
  userProfile: User | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  login: (data: LoginData) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  authUser: null,
  userProfile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Initialize auth state and listen for changes
  initialize: async () => {
    try {
      console.log('[AuthStore] Initializing auth...')
      set({ isLoading: true })

      // Get current user
      console.log('[AuthStore] Getting current user...')
      const authUser = await getCurrentUser()
      console.log('[AuthStore] Current user:', authUser ? 'logged in' : 'not logged in')

      if (authUser) {
        // Get user profile
        console.log('[AuthStore] Fetching user profile...')
        const userProfile = await getUserProfile(authUser.id)
        console.log('[AuthStore] User profile loaded')
        set({ authUser, userProfile, isInitialized: true, isLoading: false })
      } else {
        console.log('[AuthStore] No user logged in, initialization complete')
        set({ authUser: null, userProfile: null, isInitialized: true, isLoading: false })
      }

      // Listen for auth changes
      console.log('[AuthStore] Setting up auth state listener...')
      onAuthStateChange(async (event, session) => {
        console.log('[AuthStore] Auth state changed:', event)
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await getUserProfile(session.user.id)
          set({ authUser: session.user, userProfile })
        } else if (event === 'SIGNED_OUT') {
          set({ authUser: null, userProfile: null })
        }
      })
      console.log('[AuthStore] Auth initialization complete')
    } catch (error) {
      console.error('[AuthStore] Failed to initialize auth:', error)
      set({ error: (error as Error).message, isInitialized: true, isLoading: false })
    }
  },

  // Sign up new user
  signUp: async (data: SignUpData) => {
    try {
      set({ isLoading: true, error: null })
      const result = await signUp(data)

      if (result.user) {
        const userProfile = await getUserProfile(result.user.id)
        set({ authUser: result.user, userProfile, isLoading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // Login existing user
  login: async (data: LoginData) => {
    try {
      set({ isLoading: true, error: null })
      const result = await login(data)

      if (result.user) {
        const userProfile = await getUserProfile(result.user.id)
        set({ authUser: result.user, userProfile, isLoading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // Logout current user
  logout: async () => {
    try {
      set({ isLoading: true, error: null })
      await logout()
      set({ authUser: null, userProfile: null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // Refresh user profile
  refreshProfile: async () => {
    const { authUser } = get()
    if (!authUser) return

    try {
      const userProfile = await getUserProfile(authUser.id)
      set({ userProfile })
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}))
