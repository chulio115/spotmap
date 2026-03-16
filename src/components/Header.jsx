import { useNavigate, useLocation } from 'react-router-dom'
import { Settings, LogOut } from 'lucide-react'

export default function Header({ onViewChange, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (view) => {
    onViewChange(view)
    navigate(`/${view}`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.04] z-50">
      <div className="flex items-center justify-between h-14 px-3 sm:px-4">
        {/* Logo + Settings */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleNavClick('map')}
            className="text-base font-bold text-white hover:text-gray-300 transition-colors flex-shrink-0 flex items-center gap-1.5"
          >
            <span className="text-lg">🗺️</span>
            <span className="hidden sm:inline">SpotMap</span>
          </button>
          
          <button
            onClick={() => navigate('/admin')}
            className="p-1.5 text-gray-500 hover:text-violet-400 transition-colors"
            title="Einstellungen"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

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

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
          title="Abmelden"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
