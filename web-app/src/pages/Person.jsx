import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config'

function Person() {
  const { faceId } = useParams()
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchPersonImages()
  }, [faceId])

  const fetchPersonImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/face_by_id/${faceId}`)
      setImages(response.data.images || [])
      setError(null)
    } catch (err) {
      setError('Failed to load person images')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading images...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <button
          onClick={() => navigate('/gallery')}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Gallery
        </button>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <button
        onClick={() => navigate('/gallery')}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <span className="mr-1">←</span> Back to Gallery
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Person's Photos
      </h1>

      {images.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-600">No images found for this person</p>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">{images.length} photo(s) found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(img.image_url)}
              >
                <img
                  src={img.image_url}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-64 object-cover"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-screen object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Person
