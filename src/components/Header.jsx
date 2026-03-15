import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'

export default function Header({ activeView, onViewChange, notificationCount, currentUser, onLogout, onNotificationClick }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (view) => {
    onViewChange(view)
    navigate(`/${view}`)
  }

  const handleProfileClick = () => {
    if (currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL) {
      navigate('/admin')
    } else {
      onLogout()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center">
          <button 
            onClick={() => handleNavClick('map')}
            className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
          >
            🗺️ SpotMap
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-6">
          <button
            onClick={() => handleNavClick('map')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'map' || location.pathname === '/map'
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Karte
          </button>
          <button
            onClick={() => handleNavClick('feed')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'feed' || location.pathname === '/feed'
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Feed
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <NotificationBell 
            count={notificationCount}
            onClick={onNotificationClick}
          />

          {/* Profile/Logout */}
          <button 
            onClick={handleProfileClick}
            className="p-2 text-gray-300 hover:text-white transition-colors"
            title={currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL ? 'Admin Panel' : 'Logout'}
          >
            {currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
