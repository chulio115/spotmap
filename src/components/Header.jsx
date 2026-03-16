import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, Shield } from 'lucide-react'

export default function Header({ onViewChange, currentUser, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL
  const [showMenu, setShowMenu] = useState(false)

  const handleNavClick = (view) => {
    onViewChange(view)
    navigate(`/${view}`)
  }

  const initial = currentUser?.displayName?.[0] || currentUser?.email?.[0] || '?'
  const photoURL = currentUser?.photoURL

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.04] z-50">
      <div className="flex items-center justify-between h-14 px-3 sm:px-4">
        {/* Logo */}
        <button 
          onClick={() => handleNavClick('map')}
          className="text-base font-bold text-white hover:text-gray-300 transition-colors flex-shrink-0 flex items-center gap-1.5"
        >
          <span className="text-lg">🗺️</span>
          <span className="hidden sm:inline">SpotMap</span>
        </button>

        {/* Navigation - Pill Style */}
        <nav className="flex bg-white/[0.04] rounded-xl p-0.5">
          <button
            onClick={() => handleNavClick('map')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/map' || location.pathname === '/'
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Karte
          </button>
          <button
            onClick={() => handleNavClick('feed')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/feed'
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Feed
          </button>
        </nav>

        {/* User Avatar / Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white/[0.06] hover:ring-violet-500/30 transition-all"
          >
            {photoURL ? (
              <img src={photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                {initial}
              </div>
            )}
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-2 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden min-w-[200px]">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/[0.04]">
                  <p className="text-sm font-medium text-white truncate">{currentUser?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => { navigate('/admin'); setShowMenu(false) }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/[0.04] transition-colors flex items-center gap-2.5"
                  >
                    <Shield className="w-4 h-4 text-violet-400" />
                    Admin Panel
                  </button>
                )}

                <button
                  onClick={() => { onLogout(); setShowMenu(false) }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/[0.06] transition-colors flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
