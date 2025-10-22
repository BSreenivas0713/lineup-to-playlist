import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://127.0.0.1:5000/api'

// Configure axios to send cookies
axios.defaults.withCredentials = true

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [extractedArtists, setExtractedArtists] = useState([])

  // Check auth status on mount and after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authSuccess = params.get('auth') === 'success'
    const authError = params.get('error')

    if (authSuccess) {
      window.history.replaceState({}, '', '/')
      checkAuthStatus()
    } else if (authError) {
      setError('Authentication failed. Please try again.')
      window.history.replaceState({}, '', '/')
      setLoading(false)
    } else {
      checkAuthStatus()
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/status`, { withCredentials: true })
      console.log(response)
      setIsAuthenticated(response.data.authenticated)
      setUser(response.data.user)
    } catch (err) {
      console.error('Auth check failed:', err)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/login`, {}, { withCredentials: true })
      window.location.href = response.data.auth_url
    } catch (err) {
      setError('Failed to initiate login')
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
      setIsAuthenticated(false)
      setUser(null)
      setResult(null)
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setProcessing(false)
    setError(null)
    setResult(null)
    setExtractedArtists([])

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 800))
      setUploading(false)
      setProcessing(true)

      const response = await axios.post(`${API_URL}/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setExtractedArtists(response.data.artists_found)
        setResult(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process image')
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎵</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Concert Lineup to Playlist
          </h1>
          
          <p className="text-gray-600 mb-8">
            Upload a screenshot of any concert lineup and we'll create a Spotify playlist with the top tracks from each artist.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-full transition-colors duration-200"
          >
            Login with Spotify
          </button>

          <p className="text-xs text-gray-500 mt-4">
            We'll only access your playlist permissions
          </p>
        </div>
      </div>
    )
  }

  // Main App (After Login)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Concert Playlist Creator</h1>
                <p className="text-sm text-gray-500">
                  {user?.display_name ? `Hey ${user.display_name}!` : 'Logged in to Spotify'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Upload Area */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Upload Concert Lineup
            </h2>
            <p className="text-gray-600 mb-6">
              Upload a screenshot or photo of a concert lineup poster, and we'll extract the artists and create a playlist for you.
            </p>

            <label className="block cursor-pointer">
              <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 hover:bg-green-50 transition-colors bg-gray-50">
                <div className="text-5xl mb-4">📤</div>
                <p className="text-gray-700 font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG up to 10MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || processing}
                />
              </div>
            </label>
          </div>
        )}

        {/* Processing States */}
        {(uploading || processing) && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              
              {uploading && (
                <p className="text-gray-700 font-medium">Uploading image...</p>
              )}
              
              {processing && (
                <>
                  <p className="text-gray-700 font-medium mb-4">Processing your lineup...</p>
                  <p className="text-sm text-gray-500">Using AI to extract artist names...</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Playlist Created!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Found {extractedArtists.length} artists and added {result.tracks_added} tracks to your playlist.
              </p>

              {extractedArtists.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">Artists found:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {extractedArtists.map((artist, i) => (
                      <span
                        key={i}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={result.playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 mb-4"
              >
                Open in Spotify
              </a>

              <button
                onClick={() => {
                  setResult(null)
                  setExtractedArtists([])
                  setError(null)
                }}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Create another playlist
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !uploading && !processing && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App