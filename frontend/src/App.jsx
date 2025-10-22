import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import UploadArea from "./components/UploadArea";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultScreen from "./components/ResultScreen";

axios.defaults.withCredentials = true;
const API_URL = "http://127.0.0.1:5000/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [extractedArtists, setExtractedArtists] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get("auth") === "success";
    const authError = params.get("error");

    if (authSuccess) {
      window.history.replaceState({}, "", "/");
      checkAuthStatus();
    } else if (authError) {
      setError("Authentication failed. Please try again.");
      window.history.replaceState({}, "", "/");
      setLoading(false);
    } else {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/status`, { withCredentials: true });
      setIsAuthenticated(res.data.authenticated);
      setUser(res.data.user);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

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

  const handleReset = () => {
    setResult(null);
    setExtractedArtists([]);
    setError(null);
  };
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-white">Loading...</div>;
  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Header user={user} onLogout={handleLogout} />
        {!result && !uploading && !processing && <UploadArea onFileUpload={handleFileUpload} uploading={uploading} processing={processing} />}
        {(uploading || processing) && <ProcessingScreen uploading={uploading} processing={processing} />}
        {result && <ResultScreen result={result} extractedArtists={extractedArtists} onReset={handleReset} />}
        {error && !uploading && !processing && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mt-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
