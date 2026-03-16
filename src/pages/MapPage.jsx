import Map from '../components/Map'

export default function MapPage({ spots, loading, onSpotClick, onMapClick }) {
  return (
    <div className="w-full" style={{ height: 'calc(100vh - 3.5rem)', marginTop: '3.5rem' }}>
      {loading && spots.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-400 text-sm animate-pulse">Spots werden geladen...</div>
        </div>
      ) : (
        <Map spots={spots} onSpotClick={onSpotClick} onMapClick={onMapClick} />
      )}
    </div>
  )
}
