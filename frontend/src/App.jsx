import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import UploadArea from "./components/UploadArea";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultScreen from "./components/ResultScreen";
import {
  Box,
  CircularProgress,
  Alert,
  Fade,
  Typography,
  Card,
} from "@mui/material";

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
      const response = await axios.get(`${API_URL}/auth/login`, {}, { withCredentials: true });
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError("Failed to initiate login");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      setResult(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProcessing(false);
    setError(null);
    setResult(null);
    setExtractedArtists([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate delay
      setUploading(false);
      setProcessing(true);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setExtractedArtists(response.data.artists_found);
        setResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process image");
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setExtractedArtists([]);
    setError(null);
  };

  // Loading screen
  if (loading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #191414 0%, #0D1B2A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={70} sx={{ color: "#1DB954" }} />
      </Box>
    );

  // Login screen
  if (!isAuthenticated)
    return <LoginScreen onLogin={handleLogin} error={error} />;

  // Main app screen
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #191414 0%, #0D1B2A 100%)",
        p: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900, pt: 6 }}>
        <Header user={user} onLogout={handleLogout} />

        {!result && !uploading && !processing && (
          <Fade in>
            <Card
              sx={{
                mt: 4,
                p: 4,
                borderRadius: 4,
                backgroundColor: "#1E293B",
                color: "white",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <UploadArea
                onFileUpload={handleFileUpload}
                uploading={uploading}
                processing={processing}
              />
            </Card>
          </Fade>
        )}

        {(uploading || processing) && (
          <Box
            sx={{
              mt: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#1DB954",
            }}
          >
            <CircularProgress size={70} thickness={4} sx={{ color: "#1DB954" }} />
            <Typography variant="h6" mt={3}>
              {uploading
                ? "Uploading your lineup..."
                : "Processing your image..."}
            </Typography>
          </Box>
        )}

        {result && (
          <Fade in>
            <Box mt={4}>
              <ResultScreen
                result={result}
                extractedArtists={extractedArtists}
                onReset={handleReset}
              />
            </Box>
          </Fade>
        )}

        {error && !uploading && !processing && (
          <Alert
            severity="error"
            variant="filled"
            sx={{
              mt: 4,
              borderRadius: 3,
              backgroundColor: "#9B2226",
              color: "white",
              fontWeight: 500,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              ⚠️ Error
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );
}

export default App;
