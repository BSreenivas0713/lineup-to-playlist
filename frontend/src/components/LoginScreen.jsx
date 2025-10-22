export default function LoginScreen({ onLogin, error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-5xl">
          🎵
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Concert Lineup to Playlist</h1>
        <p className="text-gray-600 mb-8">
          Upload a screenshot of any concert lineup and we'll create a Spotify playlist.
        </p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        <button
          onClick={onLogin}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-full shadow-lg transition-all duration-200"
        >
          Login with Spotify
        </button>
        <p className="text-xs text-gray-500 mt-4">We'll only access your playlist permissions</p>
      </div>
    </div>
  );
}
