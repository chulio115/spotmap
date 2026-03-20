import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Pre-fill email from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!email.trim()) {
      setMessage('Bitte E-Mail eingeben')
      setMessageType('error')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Ungültige E-Mail-Adresse')
      setMessageType('error')
      return
    }
    
    if (password.length < 6) {
      setMessage('Passwort muss mindestens 6 Zeichen haben')
      setMessageType('error')
      return
    }
    
    if (password !== confirmPassword) {
      setMessage('Passwörter stimmen nicht überein')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage('')
    
    try {
      // Check if email is in allowlist
      const allowedEmailDoc = await getDoc(doc(db, 'allowed_emails', email.toLowerCase()))
      if (!allowedEmailDoc.exists()) {
        throw new Error('Du wurdest noch nicht eingeladen. Kontaktiere den Admin.')
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      setIsSuccess(true)
      setMessage('Account erstellt! Du wirst weitergeleitet...')
      setMessageType('success')
      
      // Redirect to map after 2 seconds
      setTimeout(() => {
        navigate('/map')
      }, 2000)
      
    } catch (error) {
      console.error('Registration error:', error)
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Diese E-Mail wird bereits verwendet. Bitte logge dich ein.')
      } else if (error.code === 'auth/weak-password') {
        setMessage('Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.')
      } else {
        setMessage(error.message)
      }
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Account erstellt!</h2>
          <p className="text-gray-400">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />

      <div className="max-w-sm w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-violet-500/20 rotate-3">
            <span className="text-3xl -rotate-3">📍</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Account erstellen</h1>
          <p className="text-gray-400 mt-2 text-sm">Willkommen bei SpotMap!</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/[0.06]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[15px]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[15px] pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Passwort bestätigen</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen"
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[15px]"
                required
                minLength={6}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Account erstellen'
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3.5 rounded-2xl text-sm font-medium ${
                messageType === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message}
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-5 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-violet-400 font-medium hover:text-violet-300 transition-colors"
            >
              Zurück zum Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
