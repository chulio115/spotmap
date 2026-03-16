import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { useSpots } from './hooks/useSpots'
import Header from './components/Header'
import MapPage from './pages/MapPage'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import SpotForm from './components/SpotForm'
import SpotDetail from './components/SpotDetail'
import './index.css'

function AppContent() {
  const { user, logout, isAdmin } = useAuth()
  const { spots, loading, createSpot, deleteSpot } = useSpots()
  const location = useLocation()
  const [activeView, setActiveView] = useState('map')
  const [showSpotForm, setShowSpotForm] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [formPosition, setFormPosition] = useState(null)

  const isLoginPage = location.pathname === '/login'

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot)
  }

  const handleMapClick = (latlng) => {
    console.log('🗺️ Map clicked:', latlng)
    if (!user) {
      console.log('❌ No user, ignoring click')
      return
    }
    console.log('✅ Opening SpotForm')
    setFormPosition(latlng)
    setShowSpotForm(true)
  }

  const handleSpotCreate = async (spotData) => {
    if (!user) return
    try {
      await createSpot(spotData, user)
      setShowSpotForm(false)
      setFormPosition(null)
    } catch (err) {
      alert('Spot konnte nicht erstellt werden: ' + err.message)
    }
  }

  const handleSpotDelete = async (spotId) => {
    if (!window.confirm('Spot wirklich löschen?')) return
    try {
      await deleteSpot(spotId)
      setSelectedSpot(null)
    } catch (err) {
      alert('Spot konnte nicht gelöscht werden: ' + err.message)
    }
  }

  return (
    <div className="h-screen w-full bg-gray-900">
      {!isLoginPage && user && (
        <Header
          activeView={activeView}
          onViewChange={setActiveView}
          notificationCount={0}
          currentUser={user}
          onLogout={logout}
          onNotificationClick={() => {}}
        />
      )}

      <Routes>
        <Route path="/login" element={user ? <Navigate to="/map" replace /> : <LoginPage />} />
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route
          path="/map"
          element={
            user ? (
              <MapPage
                spots={spots}
                loading={loading}
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
                spots={spots}
                loading={loading}
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
            user && isAdmin ? <AdminPage /> : <Navigate to="/login" replace />
          }
        />
      </Routes>

      {/* SpotForm Modal */}
      {showSpotForm && formPosition && (
        <SpotForm
          position={formPosition}
          onClose={() => { setShowSpotForm(false); setFormPosition(null) }}
          onSubmit={handleSpotCreate}
        />
      )}

      {/* SpotDetail Modal */}
      {selectedSpot && (
        <SpotDetail
          spot={selectedSpot}
          currentUser={user}
          onClose={() => setSelectedSpot(null)}
          onDelete={handleSpotDelete}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
