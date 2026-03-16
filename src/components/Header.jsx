import { useNavigate, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'

export default function Header({ onViewChange, currentUser }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (view) => {
    onViewChange(view)
    navigate(`/${view}`)
  }

  const photoURL = currentUser?.photoURL

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.04] z-50">
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

        {/* Settings / Profile */}
        <button
          onClick={() => navigate('/settings')}
          className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-all ${
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
    </header>
  )
}
