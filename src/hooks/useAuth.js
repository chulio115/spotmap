import { useState, useEffect } from 'react'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check für existing session beim App-Start
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('spotmap_user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setCurrentUser(user)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        localStorage.removeItem('spotmap_user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email) => {
    try {
      setLoading(true)
      setError(null)

      // Hier wird später die Supabase Magic Link Auth implementiert
      // const { error } = await supabase.auth.signInWithOtp({
      //   email,
      //   options: {
      //     emailRedirectTo: window.location.origin
      //   }
      // })

      // Mock Simulation - Prüfe ob E-Mail auf Allowlist
      const mockAllowlist = [
        'admin@spotmap.de',
        'user1@example.com', 
        'user2@example.com',
        'demo@user.de'
      ]

      if (!mockAllowlist.includes(email)) {
        throw new Error('Du wurdest noch nicht eingeladen. Kontaktiere den Admin.')
      }

      // Mock Magic Link Simulation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock User nach Magic Link
      const mockUser = {
        id: 'user_' + Date.now(),
        email: email,
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      }

      setCurrentUser(mockUser)
      localStorage.setItem('spotmap_user', JSON.stringify(mockUser))
      
      return { user: mockUser, error: null }

    } catch (err) {
      const errorMessage = err.message || 'Login fehlgeschlagen'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      // Hier wird später die Supabase SignOut implementiert
      // await supabase.auth.signOut()

      setCurrentUser(null)
      localStorage.removeItem('spotmap_user')
      setError(null)

    } catch (err) {
      console.error('Logout failed:', err)
      throw new Error('Logout fehlgeschlagen')
    }
  }

  const updateProfile = async (updates) => {
    try {
      // Hier wird später die Supabase User Update implementiert
      // const { data, error } = await supabase.auth.updateUser(updates)

      const updatedUser = { ...currentUser, ...updates }
      setCurrentUser(updatedUser)
      localStorage.setItem('spotmap_user', JSON.stringify(updatedUser))

      return updatedUser

    } catch (err) {
      console.error('Profile update failed:', err)
      throw new Error('Profil konnte nicht aktualisiert werden')
    }
  }

  const resetPassword = async (email) => {
    try {
      // Hier wird später die Supabase Password Reset implementiert
      // const { error } = await supabase.auth.resetPasswordForEmail(email)

      console.log('Password reset würde gesendet an:', email)
      return { error: null }

    } catch (err) {
      console.error('Password reset failed:', err)
      throw new Error('Password Reset fehlgeschlagen')
    }
  }

  const isAdmin = () => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
    return currentUser?.email === adminEmail
  }

  const isAuthenticated = () => {
    return currentUser !== null
  }

  const refreshSession = async () => {
    try {
      // Hier wird später die Supabase Session Refresh implementiert
      // const { data, error } = await supabase.auth.refreshSession()

      // Mock - Session bleibt gültig
      return currentUser

    } catch (err) {
      console.error('Session refresh failed:', err)
      await signOut()
      throw new Error('Session abgelaufen')
    }
  }

  return {
    currentUser,
    loading,
    error,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    isAdmin,
    isAuthenticated,
    refreshSession,
    clearError: () => setError(null)
  }
}
