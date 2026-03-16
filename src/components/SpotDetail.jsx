import { useState } from 'react'
import { getCategoryById } from '../constants/categories'
import { X, MapPin, ExternalLink, Share2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function SpotDetail({ spot, currentUser, onClose, onDelete }) {
  const category = getCategoryById(spot.category)
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = spot.photos || []

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
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-gray-950 rounded-t-[28px] md:rounded-[28px] max-h-[90vh] overflow-hidden border border-white/[0.06] shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="relative w-full aspect-video bg-gray-900">
            <img
              src={photos[photoIndex]}
              alt={spot.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i - 1 + photos.length) % photos.length) }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(i => (i + 1) % photos.length) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
            {/* Close on photo */}
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Header */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: category.color + '20' }}
              >
                {category.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white leading-tight">{spot.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{category.label}</p>
              </div>
              {photos.length === 0 && (
                <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Description */}
            {spot.description && (
              <p className="text-gray-300 text-[15px] leading-relaxed">{spot.description}</p>
            )}

            {/* Location Card */}
            <button
              onClick={handleOpenInMaps}
              className="w-full flex items-center gap-3 p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.04] hover:bg-white/[0.05] transition-all text-left"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">In Google Maps öffnen</p>
                <p className="text-xs text-gray-600 mt-0.5">{spot.lat?.toFixed(5)}, {spot.lng?.toFixed(5)}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </button>

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium text-gray-400">{spot.createdByName || spot.createdByEmail || 'Unbekannt'}</span>
              <span>·</span>
              <span>{formatDate(spot.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.04] text-white text-sm rounded-2xl hover:bg-white/[0.06] transition-colors font-medium border border-white/[0.04]"
              >
                <Share2 className="w-4 h-4" />
                Teilen
              </button>
              {canDelete && (
                <button
                  onClick={() => onDelete(spot.id)}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-red-400 text-sm rounded-2xl hover:bg-red-500/10 transition-colors font-medium border border-red-500/15"
                >
                  <Trash2 className="w-4 h-4" />
                  Löschen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
