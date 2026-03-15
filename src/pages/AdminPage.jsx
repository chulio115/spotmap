import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'

export default function AdminPage() {
  const { user } = useAuth()
  const [allowedEmails, setAllowedEmails] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Lade allowed emails aus Firestore
  useEffect(() => {
    const fetchAllowedEmails = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'allowed_emails'))
        const emails = snapshot.docs.map(doc => ({
          email: doc.id,
          ...doc.data()
        }))
        setAllowedEmails(emails)
      } catch (error) {
        console.error('Error fetching allowed emails:', error)
      }
    }

    fetchAllowedEmails()
  }, [])

  const handleAddEmail = async (e) => {
    e.preventDefault()
    
    if (!newEmail.trim()) {
      setMessage('Bitte gib eine E-Mail-Adresse ein')
      setMessageType('error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      setMessage('Bitte gib eine gültige E-Mail-Adresse ein')
      setMessageType('error')
      return
    }

    // Prüfe ob E-Mail bereits existiert
    if (allowedEmails.some(item => item.email === newEmail)) {
      setMessage('Diese E-Mail ist bereits auf der Allowlist')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // Füge Email zu Firestore hinzu
      await setDoc(doc(db, 'allowed_emails', newEmail), {
        email: newEmail,
        invitedBy: user.uid,
        createdAt: serverTimestamp()
      })
      
      const newEntry = {
        email: newEmail,
        invitedBy: user.uid,
        createdAt: new Date()
      }
      
      setAllowedEmails(prev => [...prev, newEntry])
      setNewEmail('')
      setMessage('✅ E-Mail erfolgreich zur Allowlist hinzugefügt')
      setMessageType('success')
      
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error)
      setMessage('❌ Fehler beim Hinzufügen der E-Mail')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveEmail = async (email) => {
    if (!window.confirm('Möchtest du diese E-Mail wirklich von der Allowlist entfernen?')) {
      return
    }

    try {
      // Entferne Email aus Firestore
      await deleteDoc(doc(db, 'allowed_emails', email))
      
      setAllowedEmails(prev => prev.filter(item => item.email !== email))
      setMessage('✅ E-Mail erfolgreich von der Allowlist entfernt')
      setMessageType('success')
      
    } catch (error) {
      console.error('Fehler beim Entfernen:', error)
      setMessage('❌ Fehler beim Entfernen der E-Mail')
      setMessageType('error')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Verwalte die Allowlist und registrierten User</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Erlaubte E-Mails</p>
                <p className="text-2xl font-bold text-white">{allowedEmails.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Registrierte User</p>
                <p className="text-2xl font-bold text-white">{registeredUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {allowedEmails.length > 0 
                    ? Math.round((registeredUsers.length / allowedEmails.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Add Email Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">E-Mail zur Allowlist hinzufügen</h2>
          <form onSubmit={handleAddEmail} className="flex gap-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="neue@email.de"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </button>
          </form>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-900/50 text-green-300 border border-green-700'
                : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Allowed Emails */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Allowlist ({allowedEmails.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allowedEmails.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.email}</p>
                    <p className="text-gray-400 text-sm">
                      Eingeladen von {item.invited_by || 'System'} • {formatDate(item.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveEmail(item.id)}
                    className="ml-4 p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {allowedEmails.length === 0 && (
                <p className="text-gray-500 text-center py-8">Noch keine E-Mails auf der Allowlist</p>
              )}
            </div>
          </div>

          {/* Registered Users */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Registrierte User ({registeredUsers.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {registeredUsers.map(user => (
                <div key={user.id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      <div className="text-gray-400 text-sm space-y-1">
                        <p>Registriert: {formatDate(user.created_at)}</p>
                        <p>Letzter Login: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Noch nie'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${user.last_sign_in_at && (new Date() - new Date(user.last_sign_in_at)) < 24 * 60 * 60 * 1000 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-400">
                        {user.last_sign_in_at && (new Date() - new Date(user.last_sign_in_at)) < 24 * 60 * 60 * 1000 ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {registeredUsers.length === 0 && (
                <p className="text-gray-500 text-center py-8">Noch keine User registriert</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
