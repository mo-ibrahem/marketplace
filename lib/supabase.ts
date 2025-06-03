import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })
      return { data, error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { data: null, error }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { data: null, error }
    }
  },

  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { data, error }
    } catch (error) {
      console.error("Google sign in error:", error)
      return { data: null, error }
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error }
    }
  },

  getCurrentUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error("Get current user error:", error)
      return { user: null, error }
    }
  },

  supabase, // Export supabase client for direct access when needed
}
