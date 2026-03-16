import { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signOut, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsAdmin(firebaseUser?.email === import.meta.env.VITE_ADMIN_EMAIL)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    // Check if user clicked on email link
    const handleEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = localStorage.getItem('emailForSignIn')
        
        if (!email) {
          // User opened link on different device - ask for email
          email = window.prompt('Bitte gib deine E-Mail-Adresse zur Bestätigung ein:')
        }

        if (email) {
          try {
            await signInWithEmailLink(auth, email, window.location.href)
            
            // Check if email is in allowlist after successful login
            const allowedEmailDoc = await getDoc(doc(db, 'allowed_emails', email))
            
            if (!allowedEmailDoc.exists()) {
              // Sign out if not allowed
              await signOut(auth)
              alert('Du wurdest noch nicht eingeladen. Kontaktiere den Admin.')
              return
            }
            
            localStorage.removeItem('emailForSignIn')
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname)
          } catch (error) {
            console.error('Error signing in with email link:', error)
            alert('Login fehlgeschlagen. Bitte versuche es erneut.')
          }
        }
      }
    }

    handleEmailLink()
  }, [])

  const sendMagicLink = async (email) => {
    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      
      // Save email to localStorage for verification
      localStorage.setItem('emailForSignIn', email)
      
      return { success: true }
    } catch (error) {
      console.error('Error sending magic link:', error)
      
      // Bessere Fehlermeldungen
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email Link Login ist nicht aktiviert. Bitte aktiviere es in der Firebase Console.')
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Ungültige E-Mail-Adresse.')
      } else {
        throw new Error('Fehler beim Senden des Login-Links: ' + error.message)
      }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    sendMagicLink,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
