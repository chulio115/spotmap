import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import { MapPin, Navigation, SlidersHorizontal, X, Layers, Plus } from 'lucide-react'
import SpotMarker from './SpotMarker'
import { CATEGORIES } from '../constants/categories'

const MAP_STYLES = [
  {
    id: 'clean',
    label: 'Clean',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  },
  {
    id: 'light',
    label: 'Hell',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  },
  {
    id: 'dark',
    label: 'Dunkel',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  },
  {
    id: 'satellite',
    label: 'Satellit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  {
    id: 'osm',
    label: 'Straße',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
]

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

function TileSwapper({ style }) {
  const map = useMap()
  // Force re-render when style changes
  void map
  return (
    <TileLayer
      key={style.id}
      attribution={style.attribution}
      url={style.url}
    />
  )
}

function MapRef({ onMap }) {
  const map = useMap()
  onMap(map)
  return null
}

export default function Map({ spots = [], onSpotClick, onMapClick }) {
  const [selectedCategories, setSelectedCategories] = useState(
    CATEGORIES.map(cat => cat.id)
  )
  const [activeSpotId, setActiveSpotId] = useState(null)
  const [isPinMode, setIsPinMode] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showStyles, setShowStyles] = useState(false)
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0])
  const [mapInstance, setMapInstance] = useState(null)
  const [isLocating, setIsLocating] = useState(false)

  const handleLocate = () => {
    if (!mapInstance) return
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapInstance.flyTo([position.coords.latitude, position.coords.longitude], 15, { duration: 1.5 })
          setIsLocating(false)
        },
        () => {
          alert('Standort konnte nicht ermittelt werden')
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      alert('Geolocation wird nicht unterstützt')
      setIsLocating(false)
    }
  }

  const isDark = mapStyle.id === 'dark'

  const activeFilterCount = selectedCategories.length === CATEGORIES.length
    ? 0
    : CATEGORIES.length - selectedCategories.length

  const handleCategoryToggle = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategories(
        selectedCategories.length === CATEGORIES.length ? [] : CATEGORIES.map(cat => cat.id)
      )
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

  const btnClass = isDark
    ? 'bg-gray-900/80 border-gray-700/40 hover:bg-gray-800 text-white'
    : 'bg-white/90 border-gray-200/60 hover:bg-white text-gray-800'

  return (
    <div className="h-full w-full relative">
      {/* Pin Mode Toast */}
      {isPinMode && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[1000] backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border ${
          isDark ? 'bg-gray-900/95 border-violet-500/30' : 'bg-white/95 border-violet-300/50'
        }`}>
          <p className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <MapPin className="w-4 h-4 text-violet-500" />
            Tippe auf die Karte
            <button onClick={() => setIsPinMode(false)} className="ml-2 text-gray-400 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </p>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[53.357, 10.211]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileSwapper style={mapStyle} />
        <MapClickHandler
          isPinMode={isPinMode}
          onMapClick={onMapClick}
          onPinDone={() => setIsPinMode(false)}
        />
        <MapRef onMap={setMapInstance} />

        {filteredSpots.map(spot => (
          <SpotMarker
            key={spot.id}
            spot={spot}
            onClick={handleSpotClick}
            isActive={spot.id === activeSpotId}
          />
        ))}
      </MapContainer>

      {/* Top-Right Controls: Map Style Switcher */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => { setShowStyles(!showStyles); setShowFilter(false) }}
          className={`w-11 h-11 backdrop-blur-md border rounded-2xl shadow-lg transition-all flex items-center justify-center ${btnClass}`}
          title="Kartenstil"
        >
          <Layers className="w-5 h-5" />
        </button>

        {showStyles && (
          <div className={`absolute right-0 mt-2 backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden min-w-[140px] ${
            isDark ? 'bg-gray-900/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'
          }`}>
            {MAP_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => { setMapStyle(style); setShowStyles(false) }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center gap-2 ${
                  mapStyle.id === style.id
                    ? isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-50 text-violet-700'
                    : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {mapStyle.id === style.id && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />}
                {style.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] flex items-end justify-between pointer-events-none">
        {/* Left Controls */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Filter Button */}
          <button
            onClick={() => { setShowFilter(true); setShowStyles(false) }}
            className={`w-11 h-11 backdrop-blur-md border rounded-2xl shadow-lg transition-all flex items-center justify-center relative ${btnClass}`}
            title="Filter"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Location Button */}
          <button
            onClick={handleLocate}
            disabled={isLocating}
            className={`w-11 h-11 backdrop-blur-md border rounded-2xl shadow-lg transition-all flex items-center justify-center disabled:opacity-50 ${btnClass}`}
            title="Mein Standort"
          >
            <Navigation className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'} ${isLocating ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* FAB - Spot erstellen */}
        <button
          onClick={() => setIsPinMode(!isPinMode)}
          className={`pointer-events-auto w-14 h-14 rounded-full shadow-xl transition-all flex items-center justify-center ${
            isPinMode
              ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/30'
              : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:scale-110 shadow-violet-500/30'
          }`}
          title={isPinMode ? 'Abbrechen' : 'Spot hinzufügen'}
        >
          {isPinMode ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-7 h-7 text-white" />
          )}
        </button>
      </div>

      {/* Filter Bottom Sheet */}
      {showFilter && (
        <>
          <div className="absolute inset-0 z-[1001] bg-black/30" onClick={() => setShowFilter(false)} />
          <div className={`absolute bottom-0 left-0 right-0 z-[1002] backdrop-blur-xl border-t rounded-t-3xl max-h-[55vh] overflow-y-auto animate-slide-up ${
            isDark ? 'bg-gray-900/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'
          }`}>
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kategorien</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCategoryToggle('all')}
                  className="text-xs text-violet-500 font-semibold"
                >
                  {selectedCategories.length === CATEGORIES.length ? 'Keine' : 'Alle'}
                </button>
                <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-4 pb-6 grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => {
                const isActive = selectedCategories.includes(category.id)
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left active:scale-[0.97] ${
                      isActive
                        ? isDark ? 'border-white/15 bg-white/5' : 'border-gray-200 bg-gray-50'
                        : isDark ? 'border-gray-800/50 bg-transparent opacity-35' : 'border-gray-100 bg-transparent opacity-35'
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: isActive ? category.color + '20' : 'transparent' }}
                    >
                      {category.emoji}
                    </span>
                    <span className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {category.label.split('/')[0].split('Geheimtipp')[0].trim()}
                    </span>
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
