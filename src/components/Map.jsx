import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import SpotMarker from './SpotMarker'
import { CATEGORIES } from '../constants/categories'

// Mock data für Phase 1
const mockSpots = [
  {
    id: '1',
    title: 'Berliner Mauer Ost',
    description: 'Historische Stätte mit Graffiti',
    category: 'art',
    lat: 52.5163,
    lng: 13.3777,
    created_by: 'demo@user.de',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Secret Rooftop Party',
    description: 'Tolle Aussicht über die Stadt',
    category: 'party',
    lat: 52.5200,
    lng: 13.4050,
    created_by: 'demo@user.de',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Lost Place Fabrik',
    description: 'Verlassene Industrieanlage',
    category: 'lostplace',
    lat: 52.4900,
    lng: 13.4500,
    created_by: 'demo@user.de',
    created_at: new Date().toISOString()
  }
]

// Geolocation Helper Component
function LocationButton() {
  const map = useMap()
  const [isLocating, setIsLocating] = useState(false)

  const handleLocate = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo([position.coords.latitude, position.coords.longitude], 13, {
            duration: 1.5
          })
          setIsLocating(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Standort konnte nicht ermittelt werden')
          setIsLocating(false)
        }
      )
    } else {
      alert('Geolocation wird von deinem Browser nicht unterstützt')
      setIsLocating(false)
    }
  }

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className="absolute bottom-24 left-4 z-[1000] w-12 h-12 bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg hover:bg-gray-700/90 transition-all duration-200 flex items-center justify-center group disabled:opacity-50"
      title="Mein Standort"
    >
      <Navigation className={`w-5 h-5 text-cyan-400 ${isLocating ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
    </button>
  )
}

export default function Map({ onSpotClick, onMapClick }) {
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORIES.map(cat => cat.id)
  )
  const [activeSpotId, setActiveSpotId] = useState(null)
  const [isPinMode, setIsPinMode] = useState(false)

  const handleCategoryToggle = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategories(CATEGORIES.map(cat => cat.id))
    } else {
      setSelectedCategories(prev => 
        prev.includes(categoryId)
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId]
      )
    }
  }

  const handleSpotClick = (spot) => {
    setActiveSpotId(spot.id)
    onSpotClick(spot)
  }

  const handleFabClick = () => {
    setIsPinMode(true)
  }

  const handleMapClickInternal = (e) => {
    if (!e.originalEvent.target.closest('.leaflet-marker-icon') && !e.originalEvent.target.closest('.leaflet-control')) {
      if (isPinMode) {
        onMapClick(e.latlng)
        setIsPinMode(false)
      }
    }
  }

  const filteredSpots = mockSpots.filter(spot => 
    selectedCategories.includes(spot.category)
  )

  return (
    <div className="h-full w-full relative">
      {/* Pin Mode Toast */}
      {isPinMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-gray-800/95 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-500/30 shadow-lg animate-fade-in">
          <p className="text-sm text-white font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Tippe auf die Karte um einen Spot zu setzen
          </p>
        </div>
      )}

      {/* Modern Chip Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {/* All Chip */}
        <button
          onClick={() => handleCategoryToggle('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
            selectedCategories.length === CATEGORIES.length
              ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg'
              : 'bg-gray-800/90 backdrop-blur-md text-gray-300 border border-gray-700 hover:bg-gray-700/90'
          }`}
        >
          Alle
        </button>
        
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryToggle(category.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              selectedCategories.includes(category.id)
                ? 'text-white shadow-lg'
                : 'bg-gray-800/90 backdrop-blur-md text-gray-400 border border-gray-700 hover:bg-gray-700/90'
            }`}
            style={{
              background: selectedCategories.includes(category.id)
                ? `linear-gradient(135deg, ${category.color}ee, ${category.color})`
                : undefined,
              borderColor: selectedCategories.includes(category.id)
                ? `${category.color}40`
                : undefined
            }}
          >
            <span>{category.emoji}</span>
            <span className="hidden sm:inline">{category.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      
      {/* Map */}
      <MapContainer
        center={[51.1657, 10.4515]}
        zoom={6}
        className="h-full w-full"
        onClick={handleMapClickInternal}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <LocationButton />
        
        {filteredSpots.map(spot => (
          <SpotMarker
            key={spot.id}
            spot={spot}
            onClick={handleSpotClick}
            isActive={spot.id === activeSpotId}
          />
        ))}
      </MapContainer>

      {/* FAB - Floating Action Button */}
      <button
        onClick={handleFabClick}
        className={`absolute bottom-24 right-4 z-[1000] w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group ${
          isPinMode ? 'scale-110 animate-glow-pulse' : 'hover:scale-110'
        }`}
        title="Spot hinzufügen"
      >
        <MapPin className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )
}
