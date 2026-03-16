import { getCategoryById } from '../constants/categories'

export default function FeedPage({ spots = [], loading, onSpotClick }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
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
        <h1 className="text-2xl font-bold text-white mt-4 mb-6">Neue Spots</h1>

        {loading && spots.length === 0 ? (
          <div className="text-center py-12 text-gray-400 animate-pulse">Spots werden geladen...</div>
        ) : spots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Noch keine Spots vorhanden</p>
            <p className="text-gray-600 text-sm mt-2">Erstelle den ersten Spot auf der Karte!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {spots.map(spot => {
              const category = getCategoryById(spot.category)
              if (!category) return null
              return (
                <div
                  key={spot.id}
                  onClick={() => onSpotClick(spot)}
                  className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 cursor-pointer hover:bg-gray-700/80 transition-all border border-gray-700/30 active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: category.color + '25' }}
                    >
                      {category.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{spot.title}</h3>
                      {spot.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{spot.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{spot.createdByEmail || 'Unbekannt'}</span>
                        <span>·</span>
                        <span>{formatDate(spot.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
