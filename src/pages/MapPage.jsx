import Map from '../components/Map'

export default function MapPage({ spots, loading, onSpotClick, onMapClick, navigateToSpot, onNavigateDone }) {
  return (
    <div
      className="w-full fixed left-0 right-0 bottom-0"
      style={{ zIndex: 1, isolation: 'isolate', top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
    >
      {loading && spots.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-400 text-sm animate-pulse">Spots werden geladen...</div>
        </div>
      ) : (
        <Map spots={spots} onSpotClick={onSpotClick} onMapClick={onMapClick} navigateToSpot={navigateToSpot} onNavigateDone={onNavigateDone} />
      )}
    </div>
  )
}
