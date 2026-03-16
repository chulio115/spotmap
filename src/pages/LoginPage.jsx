import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isLoading, setIsLoading] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const { signInWithGoogle, sendMagicLink } = useAuth()

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

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading('email')
    setMessage('')
    setMessageType('')
    try {
      await sendMagicLink(email.trim())
      setMagicLinkSent(true)
    } catch (error) {
      setMessageType('error')
      setMessage(error.message)
    } finally {
      setIsLoading('')
    }
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

          {/* Magic Link Sent State */}
          {magicLinkSent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Link gesendet!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Prüfe dein Postfach für <span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => { setMagicLinkSent(false); setEmail(''); setShowEmailForm(false) }}
                className="text-sm text-violet-400 font-medium"
              >
                Zurück zum Login
              </button>
            </div>
          ) : showEmailForm ? (
            /* Email Magic Link Form */
            <div>
              <button
                onClick={() => setShowEmailForm(false)}
                className="flex items-center gap-1.5 text-gray-400 text-sm mb-4 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[15px]"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading === 'email' || !email.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading === 'email' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Wird gesendet...</>
                  ) : (
                    'Login-Link senden'
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Main Auth Buttons */
            <div className="space-y-3">
              {/* Google */}
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

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-600">oder</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Magic Link */}
              <button
                onClick={() => setShowEmailForm(true)}
                disabled={!!isLoading}
                className="w-full px-4 py-3.5 bg-white/[0.04] text-gray-300 font-medium rounded-2xl hover:bg-white/[0.08] transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-white/[0.06] active:scale-[0.98]"
              >
                <Mail className="w-5 h-5 text-gray-400" />
                Mit E-Mail-Link anmelden
              </button>
            </div>
          )}

          {/* Error Message */}
          {message && messageType === 'error' && (
            <div className="mt-4 p-3.5 rounded-2xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              {message}
            </div>
          )}

          {/* Info */}
          {!showEmailForm && !magicLinkSent && (
            <div className="mt-5 flex items-center gap-2 justify-center text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Nur eingeladene Mitglieder haben Zugang
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600">
          Kein Zugang? Frag jemanden aus dem Circle.
        </p>
      </div>
    </div>
  )
}
