import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
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
  const { user, logout, isAdmin } = useAuth()
  const [activeView, setActiveView] = useState('map')
  const [notificationCount, setNotificationCount] = useState(3)
  const [showSpotForm, setShowSpotForm] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  const [formPosition, setFormPosition] = useState(null)

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot)
  }

  const handleMapClick = (latlng) => {
    if (!user) {
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

  // Wenn nicht eingeloggt, redirect zu /login via Router

  return (
    <Router>
      <div className="h-screen w-full bg-gray-900">
        <Header 
          activeView={activeView}
          onViewChange={setActiveView}
          notificationCount={notificationCount}
          currentUser={user}
          onLogout={logout}
          onNotificationClick={handleNotificationClick}
        />
        
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route 
            path="/map" 
            element={
              user ? (
                <MapPage 
                  onSpotClick={handleSpotClick}
                  onMapClick={handleMapClick}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/feed" 
            element={
              user ? (
                <FeedPage 
                  onSpotClick={handleSpotClick}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              user && isAdmin ? (
                <AdminPage />
              ) : (
                <Navigate to="/login" replace />
              )
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
