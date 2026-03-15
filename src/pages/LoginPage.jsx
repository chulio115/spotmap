import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage('Bitte gib eine E-Mail-Adresse ein')
      setMessageType('error')
      return
    }

    // E-Mail Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Bitte gib eine gültige E-Mail-Adresse ein')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // Hier wird später die Supabase Magic Link Auth implementiert
      console.log('Magic Link würde gesendet an:', email)
      
      // Mock Simulation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage('✅ Magic Link wurde an deine E-Mail gesendet!')
      setMessageType('success')
      
      // Simuliere erfolgreichen Login nach 3 Sekunden
      setTimeout(() => {
        onLogin({ email, id: 'demo-user-id' })
      }, 3000)
      
    } catch (error) {
      console.error('Login Fehler:', error)
      
      // Verschiedene Fehlermeldungen basierend auf dem Fehler
      if (error.message?.includes('allowed_emails')) {
        setMessage('❌ Du wurdest noch nicht eingeladen. Kontaktiere den Admin.')
      } else if (error.message?.includes('Invalid email')) {
        setMessage('❌ Ungültige E-Mail-Adresse')
      } else {
        setMessage('❌ Fehler beim Senden des Magic Links. Bitte versuche es später erneut.')
      }
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">🗺️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SpotMap</h1>
          <p className="text-gray-400">
            Private interaktive Karte für Freunde<br />
            Teile geheime Spots mit deinem Circle
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="deine@email.de"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Magic Link wird gesendet...
                </span>
              ) : (
                'Magic Link senden'
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                messageType === 'success'
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 text-xs text-gray-500 space-y-2">
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kein Passwort nötig - nur E-Mail!
            </p>
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Nur eingeladene E-Mails haben Zugang
            </p>
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Check deine E-Mail nach dem Magic Link
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Bereits Account? Magic Link funktioniert auch für returning users</p>
          <p className="mt-2">Kein Zugang? <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Admin kontaktieren</span></p>
        </div>
      </div>
    </div>
  )
}
