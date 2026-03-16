import { getCategoryById } from '../constants/categories'

export default function SpotDetail({ spot, currentUser, onClose, onDelete }) {
  const category = getCategoryById(spot.category)

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canDelete = currentUser && (
    currentUser.uid === spot.createdBy ||
    currentUser.email === import.meta.env.VITE_ADMIN_EMAIL
  )

  const handleOpenInMaps = () => {
    window.open(`https://www.google.com/maps?q=${spot.lat},${spot.lng}`, '_blank')
  }

  const handleShare = async () => {
    const text = `${spot.title} — ${category?.label || ''}\nhttps://www.google.com/maps?q=${spot.lat},${spot.lng}`
    if (navigator.share) {
      try {
        await navigator.share({ title: spot.title, text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Link kopiert!')
    }
  }

  if (!category) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 md:items-center" onClick={onClose}>
      <div className="bg-gray-900 w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto border border-gray-700/50" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: category.color + '25' }}
            >
              {category.emoji}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{spot.title}</h2>
              <p className="text-xs text-gray-500">{category.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          {spot.description && (
            <p className="text-gray-300 text-sm leading-relaxed">{spot.description}</p>
          )}

          {/* Location */}
          <div className="bg-gray-800/60 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{spot.lat?.toFixed(5)}, {spot.lng?.toFixed(5)}</span>
            </div>
            <button onClick={handleOpenInMaps} className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs font-medium">
              In Google Maps öffnen →
            </button>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Von {spot.createdByEmail || 'Unbekannt'}</span>
            <span>·</span>
            <span>{formatDate(spot.createdAt)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Teilen
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(spot.id)}
                className="px-4 py-2.5 text-red-400 text-sm rounded-xl hover:bg-red-500/10 transition-colors font-medium border border-red-500/20"
              >
                Löschen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
