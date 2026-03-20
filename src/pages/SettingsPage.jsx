import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useCategoriesContext } from '../lib/CategoriesContext'
import { ArrowLeft, User, MapPin, Shield, Trash2, UserPlus, Mail, ChevronRight, Navigation, Trophy, Crown } from 'lucide-react'
import { sendInviteEmail } from '../services/emailService'
import { useUserStats } from '../hooks/useUserStats'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { ACHIEVEMENTS, getRankForXP, getNextRank, RANKS } from '../constants/gamification'

export default function SettingsPage({ spots = [], onDeleteSpot, onSpotNavigate }) {
  const { user, isAdmin, logout } = useAuth()
  const { categories, getCategoryById, addCategory, removeCategory } = useCategoriesContext()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const userStats = useUserStats(user?.uid, spots, [])
  const leaderboard = useLeaderboard(spots)

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Admin state
  const [allowedEmails, setAllowedEmails] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [adminMsg, setAdminMsg] = useState('')

  // Category management state
  const [showCatForm, setShowCatForm] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📍')
  const [newCatColor, setNewCatColor] = useState('#8B5CF6')
  const [catMsg, setCatMsg] = useState('')

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
      // Save to Firestore
      await setDoc(doc(db, 'allowed_emails', email), {
        email,
        invitedBy: user.uid,
        createdAt: serverTimestamp()
      })
      
      // Send invite email via Resend
      await sendInviteEmail(email)
      
      setAllowedEmails(prev => [...prev, { email, invitedBy: user.uid, createdAt: new Date() }])
      setNewEmail('')
      setAdminMsg('Eingeladen! E-Mail wurde gesendet.')
      setTimeout(() => setAdminMsg(''), 3000)
    } catch (err) {
      console.error('Invite error:', err)
      if (err.message.includes('Resend')) {
        setAdminMsg('E-Mail Fehler: ' + err.message)
      } else {
        setAdminMsg('Fehler: ' + err.message)
      }
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

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCatLabel.trim()) return
    const id = newCatLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
    if (categories.find(c => c.id === id)) {
      setCatMsg('Kategorie existiert bereits')
      return
    }
    try {
      await addCategory({ id, label: newCatLabel.trim(), emoji: newCatEmoji, color: newCatColor })
      setNewCatLabel('')
      setNewCatEmoji('📍')
      setNewCatColor('#8B5CF6')
      setShowCatForm(false)
      setCatMsg('Kategorie hinzugefügt!')
      setTimeout(() => setCatMsg(''), 2000)
    } catch (err) {
      setCatMsg('Fehler: ' + err.message)
    }
  }

  const handleRemoveCategory = async (catId) => {
    const spotsWithCat = allSpots.filter(s => s.category === catId)
    if (spotsWithCat.length > 0) {
      alert(`Kann nicht gelöscht werden: ${spotsWithCat.length} Spots nutzen diese Kategorie.`)
      return
    }
    if (!window.confirm('Kategorie wirklich löschen?')) return
    try {
      await removeCategory(catId)
      setCatMsg('Kategorie gelöscht')
      setTimeout(() => setCatMsg(''), 2000)
    } catch (err) {
      setCatMsg('Fehler: ' + err.message)
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
    { id: 'achievements', label: 'Badges', icon: Trophy },
    { id: 'leaderboard', label: 'Rangliste', icon: Crown },
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
            {/* Avatar + Rank */}
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full ring-4 ring-white/[0.06]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                  </div>
                )}
                {userStats && (
                  <span className="absolute -bottom-1 -right-1 text-2xl" title={userStats.rank.title}>
                    {userStats.rank.emoji}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {userStats && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                    {userStats.rank.title} · {userStats.xp} XP
                  </span>
                  {userStats.unlockedAchievements.length > 0 && (
                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      🏆 {userStats.unlockedAchievements.length}
                    </span>
                  )}
                </div>
              )}
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

        {/* Achievements Tab */}
        {activeTab === 'achievements' && userStats && (
          <div className="space-y-4">
            {/* XP + Rank Card */}
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-5 border border-violet-500/15">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{userStats.rank.emoji}</div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{userStats.rank.title}</p>
                  <p className="text-violet-300 text-sm font-medium">{userStats.xp} XP</p>
                </div>
              </div>
              {userStats.nextRank && (
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                    <span>{userStats.rank.emoji} {userStats.rank.title}</span>
                    <span>{userStats.nextRank.emoji} {userStats.nextRank.title}</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((userStats.xp - userStats.rank.minXP) / (userStats.nextRank.minXP - userStats.rank.minXP)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Noch {userStats.nextRank.minXP - userStats.xp} XP bis {userStats.nextRank.title}
                  </p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.04] text-center">
                <p className="text-2xl font-bold text-white">{userStats.stats.spotsCreated}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Spots</p>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.04] text-center">
                <p className="text-2xl font-bold text-white">{userStats.stats.spotsVisited}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Besucht</p>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.04] text-center">
                <p className="text-2xl font-bold text-white">{userStats.stats.photosUploaded}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Fotos</p>
              </div>
            </div>

            {/* Unlocked Achievements */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Freigeschaltet ({userStats.unlockedAchievements.length}/{ACHIEVEMENTS.length})
              </h3>
              <div className="space-y-2">
                {userStats.unlockedAchievements.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3.5 bg-amber-500/[0.06] rounded-2xl border border-amber-500/15">
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{a.name}</p>
                      <p className="text-gray-400 text-xs">{a.description}</p>
                    </div>
                    <span className="text-amber-400 text-xs font-medium">✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Achievements */}
            {userStats.lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-gray-500 font-semibold text-sm mb-3">Noch zu erreichen</h3>
                <div className="space-y-2">
                  {userStats.lockedAchievements.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3.5 bg-white/[0.02] rounded-2xl border border-white/[0.04] opacity-60">
                      <span className="text-2xl grayscale">{a.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-sm font-medium">{a.name}</p>
                        <p className="text-gray-600 text-xs">{a.description}</p>
                      </div>
                      <span className="text-gray-700 text-xs">🔒</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* Podium Top 3 */}
            {leaderboard.length >= 1 && (
              <div className="flex items-end justify-center gap-3 pt-4 pb-2">
                {/* 2nd place */}
                {leaderboard[1] && (
                  <div className="flex flex-col items-center w-24">
                    <div className="text-2xl mb-1">🥈</div>
                    {leaderboard[1].photo ? (
                      <img src={leaderboard[1].photo} alt="" className="w-12 h-12 rounded-full ring-2 ring-gray-400/30" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold">
                        {(leaderboard[1].name?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <p className="text-white text-xs font-medium mt-1.5 truncate w-full text-center">{leaderboard[1].name}</p>
                    <p className="text-gray-500 text-[10px]">{leaderboard[1].xp} XP</p>
                  </div>
                )}
                {/* 1st place */}
                <div className="flex flex-col items-center w-28 -mt-4">
                  <div className="text-3xl mb-1">🥇</div>
                  {leaderboard[0].photo ? (
                    <img src={leaderboard[0].photo} alt="" className="w-16 h-16 rounded-full ring-3 ring-amber-400/40" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
                      {(leaderboard[0].name?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <p className="text-white text-sm font-bold mt-1.5 truncate w-full text-center">{leaderboard[0].name}</p>
                  <p className="text-amber-400 text-xs font-medium">{leaderboard[0].xp} XP</p>
                </div>
                {/* 3rd place */}
                {leaderboard[2] && (
                  <div className="flex flex-col items-center w-24">
                    <div className="text-2xl mb-1">🥉</div>
                    {leaderboard[2].photo ? (
                      <img src={leaderboard[2].photo} alt="" className="w-12 h-12 rounded-full ring-2 ring-orange-400/30" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                        {(leaderboard[2].name?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <p className="text-white text-xs font-medium mt-1.5 truncate w-full text-center">{leaderboard[2].name}</p>
                    <p className="text-gray-500 text-[10px]">{leaderboard[2].xp} XP</p>
                  </div>
                )}
              </div>
            )}

            {/* Full List */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.04] overflow-hidden">
              {leaderboard.map((entry, index) => {
                const isMe = entry.uid === user?.uid
                return (
                  <div
                    key={entry.uid}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isMe ? 'bg-violet-500/[0.08]' : index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                    } ${index > 0 ? 'border-t border-white/[0.04]' : ''}`}
                  >
                    <span className={`w-6 text-center text-sm font-bold ${
                      index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    {entry.photo ? (
                      <img src={entry.photo} alt="" className="w-9 h-9 rounded-full ring-1 ring-white/[0.06]" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                        {(entry.name?.[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-medium truncate ${isMe ? 'text-violet-300' : 'text-white'}`}>
                          {entry.name}{isMe ? ' (Du)' : ''}
                        </p>
                        <span className="text-xs">{entry.rank.emoji}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{entry.rank.title} · {entry.spotsCreated} Spots</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isMe ? 'text-violet-300' : 'text-white'}`}>{entry.xp}</p>
                      <p className="text-[10px] text-gray-600">XP</p>
                    </div>
                  </div>
                )
              })}
              {leaderboard.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">Noch keine Daten</p>
              )}
            </div>

            {/* XP Legend */}
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
              <h3 className="text-white font-semibold text-sm mb-3">So verdienst du XP</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Spot erstellen</span><span className="text-violet-300 font-medium">+10 XP</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Foto hochladen</span><span className="text-violet-300 font-medium">+5 XP</span></div>
                <div className="flex justify-between"><span className="text-gray-400">"Ich war hier"</span><span className="text-violet-300 font-medium">+5 XP</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Kommentar</span><span className="text-violet-300 font-medium">+3 XP</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Reaktion</span><span className="text-violet-300 font-medium">+1 XP</span></div>
              </div>
            </div>

            {/* Rank Legend */}
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
              <h3 className="text-white font-semibold text-sm mb-3">Ränge</h3>
              <div className="space-y-2">
                {RANKS.map((r, i) => (
                  <div key={r.title} className={`flex items-center gap-2.5 text-sm ${
                    userStats?.rank?.title === r.title ? 'text-violet-300 font-medium' : 'text-gray-500'
                  }`}>
                    <span className="text-lg w-7 text-center">{r.emoji}</span>
                    <span className="flex-1">{r.title}</span>
                    <span className="text-xs">{r.minXP}+ XP</span>
                  </div>
                ))}
              </div>
            </div>
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

            {/* Category Management */}
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Kategorien ({categories.length})
                </h3>
                <button
                  onClick={() => setShowCatForm(!showCatForm)}
                  className="text-xs text-violet-400 font-semibold"
                >
                  {showCatForm ? 'Abbrechen' : '+ Neue'}
                </button>
              </div>

              {showCatForm && (
                <form onSubmit={handleAddCategory} className="mb-4 space-y-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <input
                    type="text"
                    value={newCatLabel}
                    onChange={e => setNewCatLabel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-sm"
                    placeholder="Name der Kategorie"
                    required
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-gray-500 mb-1 block">Emoji</label>
                      <input
                        type="text"
                        value={newCatEmoji}
                        onChange={e => setNewCatEmoji(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                        maxLength={4}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] text-gray-500 mb-1 block">Farbe</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newCatColor}
                          onChange={e => setNewCatColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs text-gray-500">{newCatColor}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-500 transition-all"
                  >
                    Kategorie hinzufügen
                  </button>
                </form>
              )}

              {catMsg && <p className="mb-2 text-sm text-emerald-400">{catMsg}</p>}

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: cat.color + '20' }}
                      >
                        {cat.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{cat.label}</p>
                        <p className="text-gray-600 text-[11px]">{allSpots.filter(s => s.category === cat.id).length} Spots</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Kategorie löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
