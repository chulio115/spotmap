import { getCategoryById } from '../constants/categories'
import { MapPin } from 'lucide-react'

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
    <div className="pt-14 pb-6 min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="pt-5 pb-4">
          <h1 className="text-xl font-bold text-white">Entdecke Spots</h1>
          <p className="text-sm text-gray-500 mt-0.5">{spots.length} Spots von deinem Circle</p>
        </div>

        {loading && spots.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/[0.03] rounded-2xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-800/60 rounded-lg w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : spots.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 bg-violet-500/10 rounded-3xl flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-violet-400" />
            </div>
            <p className="text-gray-300 font-medium">Noch keine Spots</p>
            <p className="text-gray-600 text-sm mt-1">Markiere den ersten Spot auf der Karte!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {spots.map(spot => {
              const category = getCategoryById(spot.category)
              if (!category) return null
              return (
                <button
                  key={spot.id}
                  onClick={() => onSpotClick(spot)}
                  className="w-full text-left bg-white/[0.03] backdrop-blur-sm rounded-2xl p-4 hover:bg-white/[0.06] transition-all border border-white/[0.04] active:scale-[0.98] group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: category.color + '18' }}
                    >
                      {category.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-white font-medium truncate text-[15px]">{spot.title}</h3>
                        <span className="text-[11px] text-gray-600 flex-shrink-0">{formatDate(spot.createdAt)}</span>
                      </div>
                      {spot.description && (
                        <p className="text-gray-500 text-sm mt-0.5 line-clamp-2 leading-relaxed">{spot.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: category.color + '15', color: category.color }}
                        >
                          {category.label.split('/')[0].split('Geheimtipp')[0].trim()}
                        </span>
                        <span className="text-[11px] text-gray-600">{spot.createdByEmail?.split('@')[0] || ''}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
