export default function ResultScreen({ result, extractedArtists, onReset }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Playlist Created!</h2>
      <p className="text-gray-600 mb-6">
        Found {extractedArtists.length} artists and added {result.tracks_added} tracks to your playlist.
      </p>
      {extractedArtists.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Artists found:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {extractedArtists.map((artist, i) => (
              <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">{artist}</span>
            ))}
          </div>
        </div>
      )}
      <a
        href={result.playlist_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-200 mb-4"
      >
        Open in Spotify
      </a>
      <button onClick={onReset} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Create another playlist</button>
    </div>
  );
}
