import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin, Camera, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useCategoriesContext } from '../lib/CategoriesContext'

function compressImageToBase64(file, maxWidth = 800, quality = 0.6) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      // Fallback: read file as-is
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
          } catch {
            clearTimeout(timeout)
            resolve(e.target.result)
          }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    } catch {
      clearTimeout(timeout)
      resolve(null)
    }
  })
}

export default function SpotForm({ position, onClose, onSubmit }) {
  const { categories } = useCategoriesContext()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    lat: position.lat,
    lng: position.lng
  })
  const [photos, setPhotos] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const preview = URL.createObjectURL(file)
      setPhotos(prev => [...prev, { file, preview }])
    })
    e.target.value = ''
  }

  const removePhoto = (index) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    if (!formData.category) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      let photoDataUrls = []
      if (photos.length > 0) {
        for (const photo of photos) {
          const dataUrl = await compressImageToBase64(photo.file)
          if (dataUrl) photoDataUrls.push(dataUrl)
        }
      }
      await onSubmit({ ...formData, photos: photoDataUrls })
    } catch (error) {
      console.error('Fehler beim Erstellen des Spots:', error)
      setSubmitError(error.message || 'Spot konnte nicht erstellt werden')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === formData.category)
  const canProceed = step === 1 ? formData.category !== '' : formData.title.trim() !== ''

  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 z-[8500] flex items-end justify-center md:items-center"
      style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md bg-gray-950 rounded-t-[28px] md:rounded-[28px] overflow-hidden border border-white/[0.06] shadow-2xl animate-slide-up"
        style={{ maxHeight: 'calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-white">Neuer Spot</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-violet-400" />
                <span className="text-[11px] text-gray-500">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-1.5 px-5 pb-4">
          {[1, 2].map(s => (
            <div key={s} className={`h-1 rounded-full flex-1 transition-all ${s <= step ? 'bg-violet-500' : 'bg-white/[0.06]'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(92vh-140px)]">
          {/* Step 1: Category */}
          {step === 1 && (
            <div className="px-5 pb-6 space-y-4">
              <p className="text-sm text-gray-400">Was für ein Spot ist das?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map(category => {
                  const isActive = formData.category === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left active:scale-[0.97] ${
                        isActive
                          ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                          : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: category.color + (isActive ? '25' : '10') }}
                      >
                        {category.emoji}
                      </span>
                      <span className={`text-sm font-medium leading-tight ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {category.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Details + Photos */}
          {step === 2 && (
            <div className="px-5 pb-6 space-y-5">
              {/* Selected Category Badge */}
              {selectedCategory && (
                <div className="inline-flex items-center gap-2 bg-white/[0.04] rounded-full px-3 py-1.5">
                  <span className="text-base">{selectedCategory.emoji}</span>
                  <span className="text-xs text-gray-400 font-medium">{selectedCategory.label}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-[15px]"
                  placeholder="Wie heißt der Spot?"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Beschreibung <span className="text-gray-600">(optional)</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-sm resize-none"
                  placeholder="Was macht diesen Spot besonders?"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Fotos <span className="text-gray-600">(optional)</span></label>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden ring-1 ring-white/[0.06]">
                        <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all active:scale-[0.97]"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-medium">Kamera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all active:scale-[0.97]"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Galerie</span>
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Bottom Action */}
          <div className="sticky bottom-0 px-5 pb-6 pt-3 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent">
            {step === 1 ? (
              <button
                type="button"
                disabled={!canProceed}
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-violet-500/20"
              >
                Weiter
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {photos.length > 0 ? 'Fotos werden hochgeladen...' : 'Wird erstellt...'}
                    </>
                  ) : (
                    'Spot erstellen'
                  )}
                </button>
                {submitError && (
                  <p className="text-red-400 text-xs text-center mt-2">{submitError}</p>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
