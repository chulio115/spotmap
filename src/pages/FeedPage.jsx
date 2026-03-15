import { getCategoryById } from '../constants/categories'

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
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Lost Place Fabrik',
    description: 'Verlassene Industrieanlage',
    category: 'lostplace',
    lat: 52.4900,
    lng: 13.4500,
    created_by: 'demo@user.de',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]

export default function FeedPage({ onSpotClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'gerade eben'
    if (diffHours < 24) return `vor ${diffHours}h`
    if (diffDays < 7) return `vor ${diffDays}d`
    return date.toLocaleDateString('de-DE')
  }

  return (
    <div className="pt-16 pb-4 min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Neue Spots</h1>
        
        <div className="space-y-4">
          {mockSpots.map(spot => {
            const category = getCategoryById(spot.category)
            return (
              <div
                key={spot.id}
                onClick={() => onSpotClick(spot)}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.emoji}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{spot.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{spot.description}</p>
                    
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <span>{spot.created_by}</span>
                      <span>•</span>
                      <span>{formatDate(spot.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
