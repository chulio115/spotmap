import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getCategoryById } from '../constants/categories'
import { ArrowLeft, User, MapPin, Shield, Trash2, UserPlus, Mail, ChevronRight, Navigation } from 'lucide-react'

export default function SettingsPage({ spots = [], onDeleteSpot, onSpotNavigate }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Admin state
  const [allowedEmails, setAllowedEmails] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [adminMsg, setAdminMsg] = useState('')

  const mySpots = spots.filter(s => s.createdBy === user?.uid)
  const allSpots = spots

  useEffect(() => {
    if (isAdmin) {
      const fetchEmails = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'allowed_emails'))
          setAllowedEmails(snapshot.docs.map(d => ({ email: d.id, ...d.data() })))
        } catch (err) {
          console.error('Error fetching allowed emails:', err)
        }
      }
      fetchEmails()
    }
  }, [isAdmin])

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return
    setIsSavingProfile(true)
    setProfileMsg('')
    try {
      await updateProfile(user, { displayName: displayName.trim() })
      setProfileMsg('Profil gespeichert!')
      setTimeout(() => setProfileMsg(''), 2000)
    } catch (err) {
      setProfileMsg('Fehler: ' + err.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAdminMsg('Ungültige E-Mail')
      return
    }
    if (allowedEmails.some(item => item.email === email)) {
      setAdminMsg('Bereits eingeladen')
      return
    }
    setIsInviting(true)
    setAdminMsg('')
    try {
      await setDoc(doc(db, 'allowed_emails', email), {
        email,
        invitedBy: user.uid,
        createdAt: serverTimestamp()
      })
      setAllowedEmails(prev => [...prev, { email, invitedBy: user.uid, createdAt: new Date() }])
      setNewEmail('')
      setAdminMsg('Eingeladen!')
      setTimeout(() => setAdminMsg(''), 2000)
    } catch (err) {
      setAdminMsg('Fehler: ' + err.message)
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveEmail = async (email) => {
    if (!window.confirm(`${email} wirklich entfernen?`)) return
    try {
      await deleteDoc(doc(db, 'allowed_emails', email))
      setAllowedEmails(prev => prev.filter(i => i.email !== email))
    } catch (err) {
      setAdminMsg('Fehler: ' + err.message)
    }
  }

  const handleDeleteSpot = async (spotId) => {
    if (!window.confirm('Spot wirklich löschen?')) return
    try {
      await onDeleteSpot(spotId)
    } catch (err) {
      alert('Fehler: ' + err.message)
    }
  }

  const formatDate = (ts) => {
    if (!ts) return '–'
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'myspots', label: 'Meine Spots', icon: MapPin, count: mySpots.length },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
    ...(isAdmin ? [{ id: 'allspots', label: 'Alle Spots', icon: MapPin, count: allSpots.length }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-950" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-lg mx-auto px-4 pb-8">
        {/* Back + Title */}
        <div className="flex items-center gap-3 pt-5 pb-4">
          <button onClick={() => navigate('/map')} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Einstellungen</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] rounded-2xl p-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/[0.08] text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 py-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full ring-4 ring-white/[0.06]" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                </div>
              )}
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            {/* Name */}
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
              <label className="text-sm text-gray-400 mb-2 block">Anzeigename</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[15px]"
                placeholder="Dein Name..."
              />
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile || !displayName.trim()}
                className="mt-3 w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-500 transition-all disabled:opacity-40"
              >
                {isSavingProfile ? 'Speichern...' : 'Speichern'}
              </button>
              {profileMsg && <p className="mt-2 text-sm text-emerald-400">{profileMsg}</p>}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full py-3 text-red-400 text-sm font-medium rounded-2xl border border-red-500/20 hover:bg-red-500/[0.06] transition-all"
            >
              Abmelden
            </button>
          </div>
        )}

        {/* My Spots Tab */}
        {activeTab === 'myspots' && (
          <div className="space-y-2">
            {mySpots.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Du hast noch keine Spots erstellt</p>
                <button onClick={() => navigate('/map')} className="mt-3 text-sm text-violet-400 font-medium">
                  Zur Karte →
                </button>
              </div>
            ) : (
              mySpots.map(spot => {
                const cat = getCategoryById(spot.category)
                if (!cat) return null
                return (
                  <div key={spot.id} className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: cat.color + '18' }}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{spot.title}</p>
                      <p className="text-gray-600 text-xs">{formatDate(spot.createdAt)}</p>
                    </div>
                    <button onClick={() => { onSpotNavigate?.(spot); navigate('/map') }} className="p-2 text-gray-600 hover:text-violet-400 transition-colors" title="Zum Spot springen">
                      <Navigation className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSpot(spot.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.04] text-center">
                <p className="text-2xl font-bold text-white">{allSpots.length}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Spots</p>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.04] text-center">
                <p className="text-2xl font-bold text-white">{allowedEmails.length}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Mitglieder</p>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.04] text-center">
                <p className="text-2xl font-bold text-white">{new Set(allSpots.map(s => s.createdBy)).size}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Autoren</p>
              </div>
            </div>

            {/* Invite */}
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-violet-400" />
                Freund einladen
              </h3>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-sm"
                  placeholder="freund@email.de"
                  disabled={isInviting}
                />
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-500 transition-all disabled:opacity-40 whitespace-nowrap"
                >
                  {isInviting ? '...' : 'Einladen'}
                </button>
              </form>
              {adminMsg && <p className="mt-2 text-sm text-emerald-400">{adminMsg}</p>}
            </div>

            {/* Allowlist */}
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-violet-400" />
                Eingeladene ({allowedEmails.length})
              </h3>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {allowedEmails.map(item => (
                  <div key={item.email} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{item.email}</p>
                      <p className="text-gray-600 text-xs">{formatDate(item.createdAt)}</p>
                    </div>
                    {item.email !== user?.email && (
                      <button onClick={() => handleRemoveEmail(item.email)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {allowedEmails.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-6">Keine Einladungen</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Spots Tab (Admin) */}
        {activeTab === 'allspots' && isAdmin && (
          <div className="space-y-2">
            {allSpots.length === 0 ? (
              <p className="text-gray-500 text-center py-16">Keine Spots vorhanden</p>
            ) : (
              allSpots.map(spot => {
                const cat = getCategoryById(spot.category)
                if (!cat) return null
                return (
                  <div key={spot.id} className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: cat.color + '18' }}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{spot.title}</p>
                      <p className="text-gray-600 text-xs">{spot.createdByEmail || '?'} · {formatDate(spot.createdAt)}</p>
                    </div>
                    <button onClick={() => { onSpotNavigate?.(spot); navigate('/map') }} className="p-2 text-gray-600 hover:text-violet-400 transition-colors" title="Zum Spot springen">
                      <Navigation className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSpot(spot.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
