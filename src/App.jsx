import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { CategoriesProvider } from './lib/CategoriesContext'
import { useSpots } from './hooks/useSpots'
import Header from './components/Header'
import MapPage from './pages/MapPage'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import SpotForm from './components/SpotForm'
import SpotDetail from './components/SpotDetail'
import './index.css'

function AppContent() {
  const { user, logout } = useAuth()
  const { spots, loading, createSpot, deleteSpot, updateSpot, addVisitor, removeVisitor, toggleReaction, addPhotosToSpot } = useSpots()
  const location = useLocation()
  const [activeView, setActiveView] = useState('map')
  const [showSpotForm, setShowSpotForm] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [formPosition, setFormPosition] = useState(null)
  const [navigateToSpot, setNavigateToSpot] = useState(null)

  const isLoginPage = location.pathname === '/login'

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot)
  }

  // Keep selectedSpot in sync with spots state (for live updates)
  const liveSpot = selectedSpot ? spots.find(s => s.id === selectedSpot.id) || selectedSpot : null

  const handleMapClick = (latlng) => {
    if (!user) return
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
        <Route path="/register" element={user ? <Navigate to="/map" replace /> : <RegisterPage />} />
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
                navigateToSpot={navigateToSpot}
                onNavigateDone={() => setNavigateToSpot(null)}
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
                onSpotNavigate={(spot) => setNavigateToSpot(spot)}
                onToggleReaction={toggleReaction}
                currentUser={user}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            user ? (
              <SettingsPage
                spots={spots}
                onDeleteSpot={deleteSpot}
                onSpotNavigate={(spot) => setNavigateToSpot(spot)}
              />
            ) : (
              <Navigate to="/login" replace />
            )
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
      {liveSpot && (
        <SpotDetail
          spot={liveSpot}
          currentUser={user}
          onClose={() => setSelectedSpot(null)}
          onDelete={handleSpotDelete}
          onUpdateSpot={updateSpot}
          onAddVisitor={addVisitor}
          onRemoveVisitor={removeVisitor}
          onToggleReaction={toggleReaction}
          onAddPhotos={addPhotosToSpot}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <CategoriesProvider>
        <AppContent />
      </CategoriesProvider>
    </Router>
  )
}

export default App
