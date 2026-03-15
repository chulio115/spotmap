import { useState, useRef } from 'react'

export default function PhotoGallery({ onClose, onPhotoAdd }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Mock Fotos für Demo
  const mockPhotos = [
    {
      id: '1',
      url: 'https://via.placeholder.com/400x300/1a1a2e/ffffff?text=Foto+1',
      uploaded_by: 'user1@example.com',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2', 
      url: 'https://via.placeholder.com/400x300/1a1a2e/ffffff?text=Foto+2',
      uploaded_by: 'user2@example.com',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ]

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Prüfe ob es ein Bild ist
      if (!file.type.startsWith('image/')) {
        alert('Bitte wähle eine Bilddatei aus')
        return
      }

      // Prüfe Dateigröße (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Das Bild darf maximal 10MB groß sein')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    try {
      // Hier wird später der Supabase Upload implementiert
      console.log('Foto würde hochgeladen:', selectedFile.name)
      
      // Mock Upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onPhotoAdd(selectedFile)
      setSelectedFile(null)
      setPreviewUrl('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      alert('Foto erfolgreich hochgeladen!')
    } catch (error) {
      console.error('Fehler beim Upload:', error)
      alert('Foto konnte nicht hochgeladen werden')
    } finally {
      setIsUploading(false)
    }
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Fotogalerie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Upload Section */}
          <div className="lg:w-1/3 p-4 border-b lg:border-b-0 lg:border-r border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Neues Foto hinzufügen</h3>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!previewUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
              >
                <div className="flex flex-col items-center space-y-3">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-400 text-center">
                    Klicken um Foto auszuwählen<br />
                    <span className="text-xs">Max. 10MB, JPG/PNG</span>
                  </span>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Vorschau"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
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
                
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Wird hochgeladen...' : 'Foto hochladen'}
                </button>
              </div>
            )}

            <div className="mt-6 text-sm text-gray-400">
              <p className="mb-2">📸 Tipps:</p>
              <ul className="space-y-1 text-xs">
                <li>• Gutes Licht nutzen</li>
                <li>• Wichtige Details zeigen</li>
                <li>• Portrait und Landschaft möglich</li>
                <li>• Andere User können ebenfalls Fotos hinzufügen</li>
              </ul>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="lg:w-2/3 p-4 overflow-y-auto">
            <h3 className="text-lg font-medium text-white mb-4">
              Alle Fotos ({mockPhotos.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockPhotos.map(photo => (
                <div key={photo.id} className="bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt="Spot Foto"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-gray-300">{photo.uploaded_by}</span>
                      </div>
                      <span className="text-gray-500">{formatDate(photo.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {mockPhotos.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400">Noch keine Fotos vorhanden</p>
                <p className="text-gray-500 text-sm mt-2">Sei der Erste und lade ein Foto hoch!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
