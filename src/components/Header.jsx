import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'

export default function Header({ onViewChange, currentUser, notifications = [], onSpotClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  const handleNavClick = (view) => {
    onViewChange(view)
    navigate(`/${view}`)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    if (showNotifs) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showNotifs])

  const photoURL = currentUser?.photoURL
  const notifCount = Math.min(notifications.length, 99)

  const navItems = [
    { id: 'map', label: 'Karte', paths: ['/map', '/'] },
    { id: 'feed', label: 'Feed', paths: ['/feed'] },
    { id: 'leaderboard', label: '🏆', paths: ['/leaderboard'] },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.04]"
      style={{ zIndex: 9000, paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between h-14 px-3 sm:px-4">
        {/* Logo */}
        <button 
          onClick={() => handleNavClick('map')}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/20">
            <span className="text-sm">📍</span>
          </div>
          <span className="text-base font-bold text-white tracking-tight hidden sm:inline">SpotMap</span>
        </button>

        {/* Navigation - Pill Style */}
        <nav className="flex bg-white/[0.04] rounded-xl p-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                item.paths.some(p => location.pathname === p)
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <Bell className="w-[18px] h-[18px] text-gray-400" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-violet-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1">
                  {notifCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] bg-gray-900 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-white text-sm font-semibold">Aktivität</p>
                  <p className="text-gray-500 text-[11px]">{notifications.length} Benachrichtigungen</p>
                </div>
                <div className="overflow-y-auto max-h-[calc(70vh-52px)]">
                  {notifications.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-8">Keine Aktivität</p>
                  ) : (
                    notifications.slice(0, 30).map(n => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setShowNotifs(false)
                          onSpotClick?.({ id: n.spotId })
                        }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.03] last:border-0"
                      >
                        {n.fromPhoto ? (
                          <img src={n.fromPhoto} alt="" className="w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-white/[0.06]" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
                            {(n.fromName?.[0] || '?').toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 leading-snug">
                            <span className="font-medium text-white">{n.fromName}</span>
                            {n.type === 'reaction' && <> hat {n.emoji} auf </>}
                            {n.type === 'visit' && <> hat </>}
                            {n.type === 'photo' && <> hat ein Foto zu </>}
                            <span className="text-violet-300">{n.spotTitle}</span>
                            {n.type === 'reaction' && <> reagiert</>}
                            {n.type === 'visit' && <> besucht</>}
                            {n.type === 'photo' && <> hinzugefügt</>}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings / Profile */}
          <button
            onClick={() => navigate('/settings')}
            className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-all flex-shrink-0 ${
              location.pathname === '/settings'
                ? 'ring-2 ring-violet-500'
                : 'ring-2 ring-white/[0.06] hover:ring-violet-500/40'
            }`}
          >
            {photoURL ? (
              <img src={photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Settings className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
