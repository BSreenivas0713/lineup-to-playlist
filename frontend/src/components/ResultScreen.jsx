import { Box, Typography, Paper, Chip, Button, Avatar, Stack } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function ResultScreen({ result, extractedArtists, onReset }) {
  return (
    <Paper
      elevation={6}
      sx={{
        p: 6,
        borderRadius: 4,
        backgroundColor: "#191414", // Spotify black
        color: "white",
        textAlign: "center",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      {/* Success Icon */}
      <Avatar
        sx={{
          bgcolor: "#1DB954",
          width: 64,
          height: 64,
          mx: "auto",
          mb: 3,
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 36, color: "#191414" }} />
      </Avatar>

      {/* Heading */}
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Playlist Created!
      </Typography>
      <Typography variant="h6" color="#1DB954" mb={2} fontWeight={600}>
        {result.playlist_name}
      </Typography>
      <Typography variant="body1" color="#b3b3b3" mb={3}>
        Found {extractedArtists.length} artists and added {result.tracks_added} tracks to your playlist.
      </Typography>

      {/* Artists List */}
      {extractedArtists.length > 0 && (
        <Box mb={3}>
          <Typography variant="caption" color="#666" mb={1} display="block">
            Artists found:
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            {extractedArtists.map((artist, i) => (
              <Chip
                key={i}
                label={artist}
                sx={{
                  bgcolor: "#1DB954",
                  color: "#191414",
                  fontWeight: 500,
                  mb: 1,
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Open Playlist Button */}
      <Button
        href={result.playlist_url}
        target="_blank"
        rel="noopener noreferrer"
        fullWidth
        variant="contained"
        sx={{
          backgroundColor: "#1DB954",
          color: "#191414",
          fontWeight: 600,
          py: 1.5,
          mb: 2,
          "&:hover": { backgroundColor: "#1ed760" },
        }}
      >
        Open in Spotify
      </Button>

      {/* Reset Button */}
      <Button
        onClick={onReset}
        variant="text"
        sx={{
          color: "#b3b3b3",
          fontSize: "0.875rem",
          "&:hover": { color: "white" },
        }}
      >
        Create another playlist
      </Button>
    </Paper>
  );
}
