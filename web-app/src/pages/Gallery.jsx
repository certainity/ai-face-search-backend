import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config'

function Gallery() {
  const [faces, setFaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingFace, setEditingFace] = useState(null)
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchFaces()
  }, [])

  const fetchFaces = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces/`)
      setFaces(response.data.faces || [])
      setError(null)
    } catch (err) {
      setError('Failed to load faces')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async (faceUrl) => {
    try {
      await axios.post(`${API_URL}/faces/update_name/`, {
        face_url: faceUrl,
        name: newName,
      })
      setEditingFace(null)
      setNewName('')
      fetchFaces()
    } catch (err) {
      alert('Failed to update name')
    }
  }

  const handleViewPerson = (faceId) => {
    navigate(`/person/${faceId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading faces...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Face Gallery</h1>

      {faces.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-600">No faces found. Upload some images first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {faces.map((face) => (
            <div
              key={face.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <div
                className="cursor-pointer"
                onClick={() => handleViewPerson(face.id)}
              >
                <img
                  src={face.face_url}
                  alt={face.name || 'Unknown'}
                  className="w-full h-32 object-cover"
                />
              </div>

              <div className="p-2">
                {editingFace === face.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-2 py-1 text-sm border rounded"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateName(face.face_url)}
                        className="flex-1 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingFace(null)
                          setNewName('')
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {face.name || 'Unknown'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingFace(face.id)
                        setNewName(face.name || '')
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit name
                    </button>
                  </div>
                )}

                {face.tags && face.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {face.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery
