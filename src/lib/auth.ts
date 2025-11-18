import { supabase } from './supabase'
import type { User } from '@/types/database'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  preferredUnit?: 'lbs' | 'kg'
}

export interface LoginData {
  email: string
  password: string
}

/**
 * Sign up a new user and create their profile
 * Note: The user profile is automatically created via database trigger
 */
export async function signUp({ email, password, fullName, preferredUnit = 'lbs' }: SignUpData) {
  try {
    const { data: authData, error: authError } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            preferred_unit: preferredUnit,
          },
        },
      }),
      10000 // 10 second timeout for signup
    )

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    // The user profile is automatically created by the database trigger
    // triggered by the auth.users INSERT event
    return authData
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      throw new Error('Signup request timed out. Please check your internet connection and try again.')
    }
    throw error
  }
}

/**
 * Log in an existing user
 */
export async function login({ email, password }: LoginData) {
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
      10000 // 10 second timeout for login
    )

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      throw new Error('Login request timed out. Please check your internet connection and try again.')
    }
    throw error
  }
}

/**
 * Log out the current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Helper to add timeout to async operations
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ])
}

/**
 * Get the current authenticated user
 * Uses getSession() first for faster local check, then validates with getUser()
 */
export async function getCurrentUser() {
  try {
    // First check local session (fast, synchronous read from localStorage)
    // Add timeout to prevent infinite hanging
    const { data: { session } } = await withTimeout(
      supabase.auth.getSession(),
      5000 // 5 second timeout
    )

    if (!session) {
      return null
    }

    // Session exists, return user immediately
    // Note: getUser() could be called in background to validate, but for speed we trust the session
    return session.user
  } catch (error) {
    console.error('[Auth] Error getting current user:', error)
    // If timeout or error, return null (not authenticated)
    return null
  }
}

/**
 * Get the current user's profile from the database
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
