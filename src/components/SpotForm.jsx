import { useState, useRef } from 'react'
import { CATEGORIES } from '../constants/categories'

export default function SpotForm({ position, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'misc',
    description: '',
    lat: position.lat,
    lng: position.lng
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Bitte gib einen Titel ein')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Hier wird später die Supabase-Logik implementiert
      const newSpot = {
        ...formData,
        id: Date.now().toString(), // Mock ID
        created_by: 'demo@user.de', // Mock User
        created_at: new Date().toISOString()
      }

      if (selectedFile) {
        // Hier wird später der Foto-Upload implementiert
        console.log('Foto würde hochgeladen:', selectedFile.name)
      }

      onSubmit(newSpot)
      onClose()
    } catch (error) {
      console.error('Fehler beim Erstellen des Spots:', error)
      alert('Spot konnte nicht erstellt werden')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
      <div className="bg-gray-800 w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Neuer Spot</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Location Preview */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Koordinaten: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titel <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Secret Rooftop Bar"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kategorie
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.category === category.id
                      ? 'border-blue-500 bg-gray-700'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{category.emoji}</span>
                    <span className="text-sm text-white">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Beschreibung
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Was macht diesen Spot besonders?"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Foto (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-400">Foto hochladen</span>
                </div>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Vorschau"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl('')
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Wird erstellt...' : 'Spot erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
