import Map from '../components/Map'

export default function MapPage({ onSpotClick }) {
  return (
    <div className="h-screen w-full pt-16">
      <Map onSpotClick={onSpotClick} />
    </div>
  )
}
