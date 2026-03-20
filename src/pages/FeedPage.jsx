import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategoriesContext } from '../lib/CategoriesContext'
import { REACTIONS } from '../constants/gamification'
import { MapPin, Navigation, MessageCircle, Users } from 'lucide-react'

export default function FeedPage({ spots = [], loading, onSpotClick, onSpotNavigate, onToggleReaction, currentUser }) {
  const { getCategoryById } = useCategoriesContext()
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('newest')

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

  const getReactionCount = (spot) => {
    const reactions = spot.reactions || {}
    return Object.values(reactions).reduce((sum, users) =>
      sum + (Array.isArray(users) ? users.length : 0), 0
    )
  }

  const sortedSpots = [...spots].sort((a, b) => {
    if (sortBy === 'popular') {
      return getReactionCount(b) - getReactionCount(a)
    }
    if (sortBy === 'visited') {
      return (b.visitors?.length || 0) - (a.visitors?.length || 0)
    }
    // newest (default)
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
    return dateB - dateA
  })

  const handleNavigateToSpot = (e, spot) => {
    e.stopPropagation()
    onSpotNavigate?.(spot)
    navigate('/map')
  }

  const handleReaction = (e, spotId, emoji) => {
    e.stopPropagation()
    onToggleReaction?.(spotId, emoji, currentUser?.uid)
  }

  return (
    <div className="pb-6 min-h-screen bg-gradient-to-b from-gray-950 to-gray-900" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="pt-5 pb-3">
          <h1 className="text-xl font-bold text-white">Entdecke Spots</h1>
          <p className="text-sm text-gray-500 mt-0.5">{spots.length} Spots von deinem Circle</p>
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 mb-4">
          {[
            { id: 'newest', label: 'Neueste' },
            { id: 'popular', label: 'Beliebt' },
            { id: 'visited', label: 'Meistbesucht' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                sortBy === tab.id
                  ? 'bg-white/[0.08] text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
          <div className="space-y-3">
            {sortedSpots.map(spot => {
              const category = getCategoryById(spot.category)
              if (!category) return null
              const photos = spot.photos || []
              const reactions = spot.reactions || {}
              const totalReactions = getReactionCount(spot)
              const visitors = spot.visitors || []

              return (
                <div
                  key={spot.id}
                  className="w-full text-left bg-white/[0.03] backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/[0.05] transition-all border border-white/[0.04] group"
                >
                  {/* Photo Preview */}
                  {photos.length > 0 && (
                    <button onClick={() => onSpotClick(spot)} className="w-full aspect-[2.5/1] overflow-hidden relative">
                      <img src={photos[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {photos.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white/80">
                          +{photos.length - 1} Fotos
                        </span>
                      )}
                    </button>
                  )}
                  <div className="p-4">
                    <button onClick={() => onSpotClick(spot)} className="w-full text-left">
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
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: category.color + '15', color: category.color }}
                            >
                              {category.label}
                            </span>
                            <span className="text-[11px] text-gray-600">{spot.createdByName || spot.createdByEmail?.split('@')[0] || ''}</span>
                            {photos.length > 0 && (
                              <span className="text-[11px] text-gray-600">📷 {photos.length}</span>
                            )}
                            {visitors.length > 0 && (
                              <span className="text-[11px] text-gray-600 flex items-center gap-0.5">
                                <Users className="w-3 h-3" /> {visitors.length}
                              </span>
                            )}
                            {(spot.commentCount || 0) > 0 && (
                              <span className="text-[11px] text-gray-600 flex items-center gap-0.5">
                                <MessageCircle className="w-3 h-3" /> {spot.commentCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Reactions + Actions Row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1">
                        {REACTIONS.map(emoji => {
                          const users = reactions[emoji] || []
                          const hasReacted = users.includes(currentUser?.uid)
                          const count = users.length
                          return (
                            <button
                              key={emoji}
                              onClick={(e) => handleReaction(e, spot.id, emoji)}
                              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-full text-xs transition-all active:scale-90 ${
                                hasReacted
                                  ? 'bg-violet-500/15 border border-violet-500/25'
                                  : 'hover:bg-white/[0.06]'
                              }`}
                            >
                              <span className="text-sm">{emoji}</span>
                              {count > 0 && (
                                <span className={`text-[10px] font-medium ${hasReacted ? 'text-violet-300' : 'text-gray-600'}`}>
                                  {count}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={(e) => handleNavigateToSpot(e, spot)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all active:scale-95"
                      >
                        <Navigation className="w-3 h-3" />
                        Zum Spot
                      </button>
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
