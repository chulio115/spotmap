import { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { CATEGORIES } from '../constants/categories'

export default function SpotForm({ position, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'misc',
    description: '',
    lat: position.lat,
    lng: position.lng
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Bitte gib einen Titel ein')
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Fehler beim Erstellen des Spots:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 md:items-center" onClick={onClose}>
      <div className="bg-gray-950 w-full max-w-md rounded-t-3xl md:rounded-3xl max-h-[88vh] overflow-y-auto border border-white/[0.06] shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold text-white">Neuer Spot</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coordinates Pill */}
        <div className="px-5 pb-4">
          <div className="inline-flex items-center gap-1.5 bg-white/[0.04] rounded-full px-3 py-1.5 text-xs text-gray-400">
            <MapPin className="w-3 h-3 text-violet-400" />
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30 transition-all text-[15px]"
              placeholder="Name des Spots..."
              required
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(category => {
              const isActive = formData.category === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left active:scale-[0.97] ${
                    isActive
                      ? 'border-violet-500/30 bg-violet-500/10'
                      : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: isActive ? category.color + '25' : 'transparent' }}
                  >
                    {category.emoji}
                  </span>
                  <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {category.label.split('/')[0].split('Geheimtipp')[0].trim()}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Description */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/30 transition-all text-sm resize-none"
            placeholder="Was macht diesen Spot besonders? (optional)"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim()}
            className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-violet-500/20"
          >
            {isSubmitting ? 'Wird erstellt...' : 'Spot erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
