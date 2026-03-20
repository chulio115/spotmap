import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Mail, Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isLoading, setIsLoading] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { signInWithGoogle, signInWithEmail } = useAuth()

  const handleGoogleSignIn = async () => {
    setIsLoading('google')
    setMessage('')
    setMessageType('')
    try {
      await signInWithGoogle()
    } catch (error) {
      setMessageType('error')
      setMessage(error.message)
    } finally {
      setIsLoading('')
    }
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    
    setIsLoading('email')
    setMessage('')
    setMessageType('')
    try {
      await signInWithEmail(email.trim(), password)
    } catch (error) {
      setMessageType('error')
      setMessage(error.message)
    } finally {
      setIsLoading('')
    }
  }

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setMessage('Bitte zuerst E-Mail eingeben')
      setMessageType('error')
      return
    }
    // TODO: Implement password reset
    setMessage('Passwort-Reset kommt bald!')
    setMessageType('info')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />

      <div className="max-w-sm w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-violet-500/20 rotate-3">
            <span className="text-3xl -rotate-3">📍</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SpotMap</h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Geheime Spots teilen.<br />Nur für deinen Circle.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/[0.06]">

          {/* Email/Password Login Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  placeholder="Dein Passwort"
                  className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[15px] pr-12"
                  required
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading === 'email' || !email.trim() || !password}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading === 'email' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Wird angemeldet...</>
              ) : (
                'Anmelden'
              )}
            </button>

            {/* Password Reset */}
            <div className="text-center">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-sm text-violet-400 font-medium hover:text-violet-300 transition-colors"
              >
                Passwort vergessen?
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-600">oder</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleSignIn}
            disabled={!!isLoading}
            className="w-full px-4 py-3.5 bg-white text-gray-800 font-semibold rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
          >
            {isLoading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Mit Google anmelden
          </button>

          {/* Error Message */}
          {message && messageType === 'error' && (
            <div className="mt-4 p-3.5 rounded-2xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              {message}
            </div>
          )}

          {/* Info */}
          <div className="mt-5 flex items-center gap-2 justify-center text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Nur eingeladene Mitglieder haben Zugang
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Noch keinen Account?{' '}
              <button
                onClick={() => window.location.href = '/register'}
                className="text-violet-400 font-medium hover:text-violet-300 transition-colors"
              >
                Jetzt registrieren
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600">
          Kein Zugang? Frag jemanden aus dem Circle.
        </p>
      </div>
    </div>
  )
}
