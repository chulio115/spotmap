import { useNavigate, useLocation } from 'react-router-dom'

export default function Header({ onViewChange, currentUser, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL

  const handleNavClick = (view) => {
    onViewChange(view)
    navigate(`/${view}`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 z-50">
      <div className="flex items-center justify-between h-14 px-3 sm:px-4">
        {/* Logo */}
        <button 
          onClick={() => handleNavClick('map')}
          className="text-base sm:text-lg font-bold text-white hover:text-gray-300 transition-colors flex-shrink-0"
        >
          🗺️ SpotMap
        </button>

        {/* Navigation */}
        <nav className="flex gap-1">
          <button
            onClick={() => handleNavClick('map')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/map'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Karte
          </button>
          <button
            onClick={() => handleNavClick('feed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/feed'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Feed
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Admin Panel Button */}
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              className={`p-2 rounded-lg transition-colors ${
                location.pathname === '/admin'
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-gray-500 hover:text-white'
              }`}
              title="Admin Panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
