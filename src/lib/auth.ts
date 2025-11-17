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
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        preferred_unit: preferredUnit,
      },
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('Failed to create user account')
  }

  // The user profile is automatically created by the database trigger
  // triggered by the auth.users INSERT event
  return authData
}

/**
 * Log in an existing user
 */
export async function login({ email, password }: LoginData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
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
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return user
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
