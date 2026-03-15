import { useState } from 'react'
import { getCategoryById } from '../constants/categories'
import PhotoGallery from './PhotoGallery'

export default function SpotDetail({ spot, onClose, onPhotoAdd }) {
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  const category = getCategoryById(spot.category)
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAddPhoto = (file) => {
    // Hier wird später der Foto-Upload implementiert
    console.log('Foto würde hinzugefügt:', file.name)
    onPhotoAdd && onPhotoAdd(spot.id, file)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
      <div className="bg-gray-800 w-full max-w-2xl rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: category.color }}
            >
              {category.emoji}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{spot.title}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{category.label}</span>
                <span>•</span>
                <span>{formatDate(spot.created_at)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          {spot.description && (
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Beschreibung</h3>
              <p className="text-gray-300 leading-relaxed">{spot.description}</p>
            </div>
          )}

          {/* Location */}
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Standort</h3>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}</span>
              </div>
              <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
                In Karten-App öffnen →
              </button>
            </div>
          </div>

          {/* Created By */}
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Erstellt von</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{spot.created_by}</p>
                <p className="text-gray-400 text-sm">{formatDate(spot.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">Fotos</h3>
              <button
                onClick={() => setShowPhotoGallery(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Foto hinzufügen
              </button>
            </div>
            
            {/* Mock Photos */}
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <button
                onClick={() => setShowPhotoGallery(true)}
                className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-600"
              >
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-4.732 2.684m4.732-2.684a3 3 0 00-4.732-2.684m0 0a3 3 0 10-4.732 2.684" />
              </svg>
              Teilen
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Löschen
            </button>
          </div>
        </div>
      </div>

      {/* PhotoGallery Modal */}
      {showPhotoGallery && (
        <PhotoGallery
          spotId={spot.id}
          onClose={() => setShowPhotoGallery(false)}
          onPhotoAdd={handleAddPhoto}
        />
      )}
    </div>
  )
}
