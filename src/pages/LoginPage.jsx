import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogle } = useAuth()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setMessage('')
    setMessageType('')

    try {
      await signInWithGoogle()
    } catch (error) {
      setMessageType('error')
      setMessage('❌ ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />

      <div className="max-w-sm w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-violet-500/20 rotate-3">
            <span className="text-3xl -rotate-3">�</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SpotMap</h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Geheime Spots teilen.<br />Nur für deinen Circle.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/[0.06]">
          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full px-4 py-3.5 bg-white text-gray-800 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Wird angemeldet...' : 'Mit Google anmelden'}
          </button>

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

          {/* Info Footer */}
          <div className="mt-5 flex items-center gap-2 justify-center text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Nur eingeladene Mitglieder haben Zugang
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
