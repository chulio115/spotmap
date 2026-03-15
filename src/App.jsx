import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import MapPage from './pages/MapPage'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import SpotForm from './components/SpotForm'
import SpotDetail from './components/SpotDetail'
import PhotoGallery from './components/PhotoGallery'
import './index.css'

function App() {
  const [activeView, setActiveView] = useState('map')
  const [currentUser, setCurrentUser] = useState(() => {
    const mockUser = localStorage.getItem('spotmap_user')
    return mockUser ? JSON.parse(mockUser) : null
  })
  const [notificationCount, setNotificationCount] = useState(3) // Mock für Phase 1
  const [showSpotForm, setShowSpotForm] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  const [formPosition, setFormPosition] = useState(null)

  const handleLogin = (user) => {
    setCurrentUser(user)
    localStorage.setItem('spotmap_user', JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('spotmap_user')
  }

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot)
  }

  const handleMapClick = (latlng) => {
    if (!currentUser) {
      alert('Bitte melde dich an um Spots zu erstellen')
      return
    }
    setFormPosition(latlng)
    setShowSpotForm(true)
  }

  const handleSpotCreate = (newSpot) => {
    // Hier wird später die Supabase Logik implementiert
    console.log('Neuer Spot erstellt:', newSpot)
    setNotificationCount(prev => prev + 1)
  }

  const handlePhotoAdd = (spotId, file) => {
    // Hier wird später die Supabase Logik implementiert
    console.log('Foto hinzugefügt:', spotId, file.name)
  }

  const handleNotificationClick = () => {
    setNotificationCount(0)
    // Hier wird später die Notification-Logik implementiert
  }

  const isAdmin = currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL

  // Wenn nicht eingeloggt, zeige LoginPage
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="h-screen w-full bg-gray-900">
        <Header 
          activeView={activeView}
          onViewChange={setActiveView}
          notificationCount={notificationCount}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNotificationClick={handleNotificationClick}
        />
        
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route 
            path="/map" 
            element={
              <MapPage 
                onSpotClick={handleSpotClick}
                onMapClick={handleMapClick}
              />
            } 
          />
          <Route 
            path="/feed" 
            element={
              <FeedPage 
                onSpotClick={handleSpotClick}
              />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAdmin ? 
              <AdminPage currentUser={currentUser} /> : 
              <Navigate to="/map" replace />
            } 
          />
        </Routes>

        {/* Modals */}
        {showSpotForm && formPosition && (
          <SpotForm
            position={formPosition}
            onClose={() => setShowSpotForm(false)}
            onSubmit={handleSpotCreate}
          />
        )}

        {selectedSpot && (
          <SpotDetail
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
            onPhotoAdd={handlePhotoAdd}
          />
        )}

        {showPhotoGallery && (
          <PhotoGallery
            onClose={() => setShowPhotoGallery(false)}
            onPhotoAdd={handlePhotoAdd}
          />
        )}
      </div>
    </Router>
  )
}

export default App
