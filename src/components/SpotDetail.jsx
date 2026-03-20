import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useCategoriesContext } from '../lib/CategoriesContext'
import { useComments } from '../hooks/useComments'
import { REACTIONS } from '../constants/gamification'
import {
  X, MapPin, ExternalLink, Share2, Trash2,
  ChevronLeft, ChevronRight, Camera,
  MessageCircle, Send, CheckCircle2, Edit3, Loader2, Users
} from 'lucide-react'

function compressImageToBase64(file, maxWidth = 800, quality = 0.6) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    }, 15000)

    try {
      const reader = new FileReader()
      reader.onerror = () => { clearTimeout(timeout); resolve(null) }
      reader.onload = (e) => {
        const img = new window.Image()
        img.onerror = () => { clearTimeout(timeout); resolve(e.target.result) }
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            let { width, height } = img
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
            canvas.width = width
            canvas.height = height
            canvas.getContext('2d').drawImage(img, 0, 0, width, height)
            const dataUrl = canvas.toDataURL('image/jpeg', quality)
            clearTimeout(timeout)
            resolve(dataUrl)
          } catch { clearTimeout(timeout); resolve(e.target.result) }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch { clearTimeout(timeout); resolve(null) }
  })
}

export default function SpotDetail({
  spot, currentUser, onClose, onDelete,
  onUpdateSpot, onAddVisitor, onRemoveVisitor, onToggleReaction, onAddPhotos
}) {
  const { categories, getCategoryById } = useCategoriesContext()
  const category = getCategoryById(spot.category)
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = spot.photos || []
  const visitors = spot.visitors || []
  const { comments, addComment, deleteComment } = useComments(spot.id)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(spot.title)
  const [editDesc, setEditDesc] = useState(spot.description || '')
  const [editCategory, setEditCategory] = useState(spot.category)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Comment state
  const [commentText, setCommentText] = useState('')
  const [isSendingComment, setIsSendingComment] = useState(false)

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const photoInputRef = useRef(null)

  // Swipe-to-close state
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const sheetRef = useRef(null)

  // Hardware back button support
  useEffect(() => {
    const handleBack = (e) => {
      e.preventDefault()
      onClose()
    }
    window.history.pushState({ spotDetail: true }, '')
    window.addEventListener('popstate', handleBack)
    return () => window.removeEventListener('popstate', handleBack)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleTouchStart = useCallback((e) => {
    // Only start drag from the drag handle or top area
    const target = e.target
    const sheet = sheetRef.current
    if (!sheet) return
    const scrollableContent = sheet.querySelector('[data-scroll-content]')
    if (scrollableContent && scrollableContent.scrollTop > 0) return
    dragStartY.current = e.touches[0].clientY
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    const dy = e.touches[0].clientY - dragStartY.current
    if (dy > 0) {
      setDragY(dy)
    }
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    if (dragY > 120) {
      onClose()
    } else {
      setDragY(0)
    }
    setIsDragging(false)
  }, [isDragging, dragY, onClose])

  const isCreator = currentUser?.uid === spot.createdBy
  const isAdmin = currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL
  const canDelete = isCreator || isAdmin
  const canEdit = isCreator || isAdmin
  const hasVisited = visitors.some(v => v.uid === currentUser?.uid)

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
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const handleShare = async () => {
    const text = `${spot.title} — ${category?.label || ''}\nhttps://www.google.com/maps?q=${spot.lat},${spot.lng}`
    if (navigator.share) {
      try { await navigator.share({ title: spot.title, text }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Link kopiert!')
    }
  }

  const handleVisitToggle = async () => {
    if (hasVisited) {
      await onRemoveVisitor(spot.id, currentUser.uid)
    } else {
      await onAddVisitor(spot.id, currentUser)
    }
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return
    setIsSavingEdit(true)
    try {
      await onUpdateSpot(spot.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory
      })
      setIsEditing(false)
    } catch (err) {
      alert('Fehler: ' + err.message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleSendComment = async () => {
    if (!commentText.trim()) return
    setIsSendingComment(true)
    try {
      await addComment(commentText, currentUser)
      setCommentText('')
    } catch (err) {
      alert('Fehler: ' + err.message)
    } finally {
      setIsSendingComment(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setIsUploadingPhoto(true)
    try {
      const dataUrls = []
      for (const file of files) {
        const dataUrl = await compressImageToBase64(file)
        if (dataUrl) dataUrls.push(dataUrl)
      }
      if (dataUrls.length > 0) {
        await onAddPhotos(spot.id, dataUrls, currentUser)
      }
    } catch (err) {
      alert('Fehler beim Upload: ' + err.message)
    } finally {
      setIsUploadingPhoto(false)
      e.target.value = ''
    }
  }

  if (!category) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" style={{ opacity: Math.max(0, 1 - dragY / 300) }} />
      <div
        ref={sheetRef}
        className={`relative w-full max-w-lg bg-gray-950 rounded-t-[24px] md:rounded-[24px] overflow-hidden border border-white/[0.06] shadow-2xl ${dragY === 0 ? 'animate-slide-up' : ''}`}
        style={{
          maxHeight: 'min(92vh, 92dvh)',
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1.5 rounded-full bg-gray-600" />
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="relative w-full bg-gray-900" style={{ maxHeight: '35vh' }}>
            <img src={photos[photoIndex]} alt={spot.title} className="w-full h-full object-cover" style={{ maxHeight: '35vh' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/30" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPhotoIndex(i => (i + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button key={i} onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === photoIndex ? 'bg-white scale-125' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
            <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm active:scale-90 transition-transform">
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] text-white/80">
                {photoIndex + 1}/{photos.length}
              </span>
              {(spot.photoMeta?.[photoIndex]) && (
                <span className="bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] text-white/80">
                  📷 {spot.photoMeta[photoIndex].uploadedByName}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch" data-scroll-content style={{ maxHeight: photos.length > 0 ? 'calc(92vh - 35vh - 44px)' : 'calc(92vh - 44px)' }}>
          {/* Title + Category */}
          <div className="px-5 pt-4 pb-2">
            {!isEditing ? (
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: category.color + '20' }}>
                  {category.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white leading-tight">{spot.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{category.label}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {canEdit && (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-gray-600 hover:text-violet-400 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {photos.length === 0 && (
                    <button onClick={onClose} className="p-2.5 text-gray-500 hover:text-white transition-colors active:scale-90">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-3">
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  placeholder="Spot-Name..." />
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  placeholder="Beschreibung..." />
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => setEditCategory(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        editCategory === c.id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/[0.04]'
                      }`}>
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 text-sm text-gray-400 rounded-xl border border-white/[0.06]">Abbrechen</button>
                  <button onClick={handleSaveEdit} disabled={isSavingEdit || !editTitle.trim()}
                    className="flex-1 py-2.5 text-sm text-white bg-violet-600 rounded-xl font-medium disabled:opacity-40">
                    {isSavingEdit ? 'Speichern...' : 'Speichern'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Description */}
            {!isEditing && spot.description && (
              <p className="text-gray-300 text-[15px] leading-relaxed">{spot.description}</p>
            )}

            {/* Emoji Reactions */}
            {!isEditing && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {REACTIONS.map(emoji => {
                  const reactions = spot.reactions || {}
                  const users = reactions[emoji] || []
                  const hasReacted = users.includes(currentUser?.uid)
                  const count = users.length
                  return (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction?.(spot.id, emoji, currentUser?.uid)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all active:scale-90 ${
                        hasReacted
                          ? 'bg-violet-500/15 border border-violet-500/25'
                          : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="text-base">{emoji}</span>
                      {count > 0 && (
                        <span className={`text-xs font-medium ${hasReacted ? 'text-violet-300' : 'text-gray-500'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Creator Card */}
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
              {spot.createdByPhoto ? (
                <img src={spot.createdByPhoto} alt="" className="w-9 h-9 rounded-full ring-2 ring-white/[0.06]" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                  {(spot.createdByName?.[0] || spot.createdByEmail?.[0] || '?').toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{spot.createdByName || spot.createdByEmail?.split('@')[0] || 'Unbekannt'}</p>
                <p className="text-[11px] text-gray-600">Erstellt {formatDate(spot.createdAt)}</p>
              </div>
              {isCreator && <span className="text-[10px] text-violet-400 font-medium bg-violet-500/10 px-2 py-0.5 rounded-full">Ersteller</span>}
            </div>

            {/* Visitors / "Ich war hier" */}
            <div className="p-3.5 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400 font-medium">
                    {visitors.length === 0 ? 'Noch keine Besucher' : `${visitors.length} Besucher`}
                  </span>
                </div>
                <button
                  onClick={handleVisitToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                    hasVisited
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {hasVisited ? 'War hier' : 'Ich war hier'}
                </button>
              </div>
              {visitors.length > 0 && (
                <div className="flex items-center -space-x-2">
                  {visitors.slice(0, 8).map((v, i) => (
                    v.photo ? (
                      <img key={i} src={v.photo} alt={v.name} title={v.name || v.email}
                        className="w-7 h-7 rounded-full ring-2 ring-gray-950 object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div key={i} title={v.name || v.email}
                        className="w-7 h-7 rounded-full ring-2 ring-gray-950 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {(v.name?.[0] || v.email?.[0] || '?').toUpperCase()}
                      </div>
                    )
                  ))}
                  {visitors.length > 8 && (
                    <div className="w-7 h-7 rounded-full ring-2 ring-gray-950 bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                      +{visitors.length - 8}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add Photo */}
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.03] rounded-2xl border border-dashed border-white/[0.08] text-gray-500 hover:text-white hover:bg-white/[0.05] hover:border-violet-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isUploadingPhoto ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Wird hochgeladen...</span></>
              ) : (
                <><Camera className="w-4 h-4" /><span className="text-sm font-medium">Foto hinzufügen</span></>
              )}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />

            {/* Location */}
            <button onClick={() => window.open(`https://www.google.com/maps?q=${spot.lat},${spot.lng}`, '_blank')}
              className="w-full flex items-center gap-3 p-3.5 bg-white/[0.02] rounded-2xl border border-white/[0.04] hover:bg-white/[0.04] transition-all text-left">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">In Google Maps öffnen</p>
                <p className="text-xs text-gray-600 mt-0.5">{spot.lat?.toFixed(5)}, {spot.lng?.toFixed(5)}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </button>

            {/* Comments Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400 font-medium">
                  {comments.length === 0 ? 'Kommentare' : `${comments.length} Kommentar${comments.length === 1 ? '' : 'e'}`}
                </span>
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 mb-3">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full flex-shrink-0 ring-1 ring-white/[0.06]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
                    {(currentUser?.displayName?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <div className="flex-1 flex gap-1.5">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                    className="flex-1 px-3.5 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                    placeholder="Kommentar schreiben..."
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!commentText.trim() || isSendingComment}
                    className="px-3 py-2 bg-violet-600 text-white rounded-xl disabled:opacity-30 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {comments.length > 0 && (
                <div className="space-y-2.5">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-2.5 group">
                      {comment.authorPhoto ? (
                        <img src={comment.authorPhoto} alt="" className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 ring-1 ring-white/[0.06]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {(comment.authorName?.[0] || '?').toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-white">{comment.authorName || comment.authorEmail?.split('@')[0]}</span>
                          <span className="text-[10px] text-gray-600">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-0.5 leading-relaxed">{comment.text}</p>
                      </div>
                      {(comment.authorUid === currentUser?.uid || isAdmin) && (
                        <button onClick={() => deleteComment(comment.id)}
                          className="p-1 text-gray-700 hover:text-red-400 transition-colors opacity-40 hover:opacity-100 flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/[0.04]" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}>
              <button onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/[0.04] text-white text-sm rounded-2xl hover:bg-white/[0.06] transition-colors font-medium border border-white/[0.04] active:scale-[0.97]">
                <Share2 className="w-4 h-4" /> Teilen
              </button>
              {canDelete && (
                <button onClick={() => onDelete(spot.id)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 text-red-400 text-sm rounded-2xl hover:bg-red-500/10 transition-colors font-medium border border-red-500/15 active:scale-[0.97]">
                  <Trash2 className="w-4 h-4" /> Löschen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
