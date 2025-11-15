import { Box, Button, Card, CardContent, Typography, Avatar } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

export default function LoginScreen({ onLogin, error }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #191414 0%, #0D1B2A 100%)", // dark navy + Spotify black
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
          backgroundColor: "#1E293B",
          color: "white",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <CardContent sx={{ p: 6 }}>
          <Avatar
            sx={{
              bgcolor: "#1DB954", // Spotify green
              width: 80,
              height: 80,
              mx: "auto",
              mb: 3,
              boxShadow: "0 0 20px rgba(29,185,84,0.5)",
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 40, color: "#fff" }} />
          </Avatar>

          <Typography variant="h4" fontWeight="bold" mb={2}>
            SoundCheck
          </Typography>

          <Typography variant="body1" color="gray" mb={4}>
            Upload a concert lineup poster and we'll create a Spotify playlist automatically.
          </Typography>

          {error && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(255, 76, 76, 0.1)",
                border: "1px solid rgba(255,76,76,0.3)",
                color: "#ff6b6b",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </Box>
          )}

          <Button
            fullWidth
            onClick={onLogin}
            sx={{
              backgroundColor: "#1DB954",
              color: "white",
              py: 1.5,
              borderRadius: "9999px",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 14px rgba(29,185,84,0.3)",
              "&:hover": {
                backgroundColor: "#1ed760",
                boxShadow: "0 6px 18px rgba(29,185,84,0.4)",
              },
            }}
          >
            Login with Spotify
          </Button>

          <Typography
            variant="caption"
            color="gray"
            sx={{ mt: 3, display: "block" }}
          >
            We'll only access your playlist permissions
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
