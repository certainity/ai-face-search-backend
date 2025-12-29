import { useState } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

function Search() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const [error, setError] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setMatches([])
      setError(null)
    }
  }

  const handleSearch = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    setMatches([])

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post(`${API_URL}/search/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.error) {
        setError(response.data.error)
      } else {
        setMatches(response.data.matches || [])
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search by Face</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload an image to find similar faces
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Search"
              className="max-w-md rounded-lg shadow-sm"
            />
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={!selectedFile || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top {matches.length} Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <img
                    src={match.image_url}
                    alt={`Match ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                  <p className="text-sm text-gray-600">
                    Distance: {match.distance.toFixed(4)}
                  </p>
                  {match.name && (
                    <p className="text-sm font-medium text-gray-900">
                      {match.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && matches.length === 0 && selectedFile && !error && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">No matches found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
