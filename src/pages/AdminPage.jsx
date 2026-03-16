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

  const formatDate = (timestamp) => {
    if (!timestamp) return '–'
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Verwalte die Allowlist — Nur eingeladene E-Mails können sich einloggen</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Eingeladene E-Mails</p>
                <p className="text-3xl font-bold text-white mt-1">{allowedEmails.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Eingeloggt als</p>
                <p className="text-sm font-medium text-white mt-1 truncate">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 rounded-full border border-cyan-500/30">Admin</span>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Add Email Form */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Freund einladen</h2>
          <form onSubmit={handleAddEmail} className="flex gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-900/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              placeholder="freund@email.de"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? 'Lädt...' : '+ Einladen'}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-xl text-sm ${
                messageType === 'success'
                  ? 'bg-green-900/30 text-green-300 border border-green-700/50'
                  : 'bg-red-900/30 text-red-300 border border-red-700/50'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Allowed Emails List */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Allowlist ({allowedEmails.length})</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {allowedEmails.map(item => (
              <div key={item.email} className="flex items-center justify-between p-4 bg-gray-900/40 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.email}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Hinzugefügt: {formatDate(item.createdAt)}
                  </p>
                </div>
                {item.email !== user?.email && (
                  <button
                    onClick={() => handleRemoveEmail(item.email)}
                    className="ml-4 p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                    title="Entfernen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {allowedEmails.length === 0 && (
              <p className="text-gray-500 text-center py-12">Noch keine E-Mails auf der Allowlist</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
