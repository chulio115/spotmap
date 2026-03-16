import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import { MapPin, Navigation, SlidersHorizontal, X } from 'lucide-react'
import SpotMarker from './SpotMarker'
import { CATEGORIES } from '../constants/categories'

function MapClickHandler({ isPinMode, onMapClick, onPinDone }) {
  useMapEvents({
    click(e) {
      if (isPinMode) {
        onMapClick(e.latlng)
        onPinDone()
      }
    }
  })
  return null
}

function LocationButton() {
  const map = useMap()
  const [isLocating, setIsLocating] = useState(false)

  const handleLocate = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo([position.coords.latitude, position.coords.longitude], 14, {
            duration: 1.5
          })
          setIsLocating(false)
        },
        () => {
          alert('Standort konnte nicht ermittelt werden')
          setIsLocating(false)
        }
      )
    } else {
      alert('Geolocation wird nicht unterstützt')
      setIsLocating(false)
    }
  }

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className="absolute bottom-28 left-4 z-[1000] w-11 h-11 bg-gray-900/90 backdrop-blur-md border border-gray-700/60 rounded-xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50"
      title="Mein Standort"
    >
      <Navigation className={`w-5 h-5 text-cyan-400 ${isLocating ? 'animate-pulse' : ''}`} />
    </button>
  )
}

export default function Map({ spots = [], onSpotClick, onMapClick }) {
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORIES.map(cat => cat.id)
  )
  const [activeSpotId, setActiveSpotId] = useState(null)
  const [isPinMode, setIsPinMode] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const activeFilterCount = selectedCategories.length === CATEGORIES.length
    ? 0
    : CATEGORIES.length - selectedCategories.length

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

  const filteredSpots = spots.filter(spot =>
    selectedCategories.includes(spot.category)
  )

  return (
    <div className="h-full w-full relative">
      {/* Pin Mode Toast */}
      {isPinMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-cyan-500/30 shadow-lg">
          <p className="text-sm text-white font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Tippe auf die Karte
            <button onClick={() => setIsPinMode(false)} className="ml-2 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </p>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[52.52, 13.405]}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler
          isPinMode={isPinMode}
          onMapClick={onMapClick}
          onPinDone={() => setIsPinMode(false)}
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

      {/* Bottom Action Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] flex items-end justify-between pointer-events-none">
        {/* Filter Button */}
        <button
          onClick={() => setShowFilter(true)}
          className="pointer-events-auto w-11 h-11 bg-gray-900/90 backdrop-blur-md border border-gray-700/60 rounded-xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center relative"
          title="Filter"
        >
          <SlidersHorizontal className="w-5 h-5 text-white" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-cyan-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* FAB - Spot erstellen */}
        <button
          onClick={() => setIsPinMode(!isPinMode)}
          className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center ${
            isPinMode
              ? 'bg-red-500 hover:bg-red-600 scale-110'
              : 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:scale-110'
          }`}
          title={isPinMode ? 'Abbrechen' : 'Spot hinzufügen'}
        >
          {isPinMode ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MapPin className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Filter Bottom Sheet */}
      {showFilter && (
        <>
          <div className="absolute inset-0 z-[1001] bg-black/40" onClick={() => setShowFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[1002] bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 rounded-t-2xl max-h-[60vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Kategorien filtern</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCategoryToggle('all')}
                  className="text-xs text-cyan-400 font-medium"
                >
                  {selectedCategories.length === CATEGORIES.length ? 'Keine' : 'Alle'}
                </button>
                <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => {
                const isActive = selectedCategories.includes(category.id)
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isActive
                        ? 'border-white/20 bg-white/5'
                        : 'border-gray-800 bg-transparent opacity-40'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: isActive ? category.color + '30' : 'transparent' }}
                    >
                      {category.emoji}
                    </span>
                    <span className="text-sm text-white font-medium truncate">{category.label.split('/')[0].trim()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
