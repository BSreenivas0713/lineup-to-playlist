export default function Header({ user, onLogout }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
          🎵
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Concert Playlist Creator</h1>
          <p className="text-sm text-gray-500">
            {user?.display_name ? `Hey ${user.display_name}!` : "Logged in to Spotify"}
          </p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
