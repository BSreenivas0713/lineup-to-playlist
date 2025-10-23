import { Box, Typography, CircularProgress, Paper } from "@mui/material";

export default function ProcessingScreen({ uploading, processing }) {
  return (
    <Paper
      elevation={6}
      sx={{
        p: 6,
        borderRadius: 4,
        backgroundColor: "#191414", // Spotify black
        color: "white",
        textAlign: "center",
        maxWidth: 500,
        mx: "auto",
      }}
    >
      <CircularProgress
        size={60}
        thickness={5}
        sx={{ color: "#1DB954", mb: 3 }}
      />

      {uploading && (
        <Typography variant="h6" fontWeight="medium">
          Uploading image...
        </Typography>
      )}

      {processing && (
        <>
          <Typography variant="h6" fontWeight="medium" mb={1}>
            Processing your lineup...
          </Typography>
          <Typography variant="body2" color="#b3b3b3">
            Using AI to extract artist names...
          </Typography>
        </>
      )}
    </Paper>
  );
}
