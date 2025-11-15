import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ArtistReviewScreen({
  eventName: initialEventName,
  artists: initialArtists,
  onConfirm,
  onCancel,
}) {
  const [eventName, setEventName] = useState(initialEventName);
  const [artists, setArtists] = useState(initialArtists);

  const handleRemoveArtist = (index) => {
    setArtists(artists.filter((_, i) => i !== index));
  };

  const handleArtistChange = (index, newValue) => {
    const updatedArtists = [...artists];
    updatedArtists[index] = newValue;
    setArtists(updatedArtists);
  };

  const handleConfirm = () => {
    // Filter out empty artist names
    const validArtists = artists.filter((artist) => artist.trim() !== "");
    onConfirm(eventName, validArtists);
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 5,
        borderRadius: 4,
        backgroundColor: "#191414",
        color: "white",
        maxWidth: 700,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Typography variant="h5" fontWeight="bold" mb={1} textAlign="center">
        Review Extracted Artists
      </Typography>
      <Typography
        variant="body2"
        color="#b3b3b3"
        mb={4}
        textAlign="center"
      >
        Edit artist names or remove any mistakes before creating your playlist
      </Typography>

      {/* Event Name Field */}
      <Box mb={4}>
        <Typography variant="subtitle2" color="#1DB954" mb={1} fontWeight={600}>
          Event Name
        </Typography>
        <TextField
          fullWidth
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          variant="outlined"
          placeholder="Enter event name"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#1E293B",
              color: "white",
              fontSize: "1.1rem",
              fontWeight: 500,
              "& fieldset": {
                borderColor: "#374151",
              },
              "&:hover fieldset": {
                borderColor: "#1DB954",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1DB954",
              },
            },
            "& .MuiInputBase-input": {
              color: "white",
            },
          }}
        />
      </Box>

      <Divider sx={{ borderColor: "#374151", mb: 3 }} />

      {/* Artists List */}
      <Box mb={4}>
        <Typography variant="subtitle2" color="#1DB954" mb={2} fontWeight={600}>
          Artists ({artists.length})
        </Typography>

        <Stack spacing={2} sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
          {artists.map((artist, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TextField
                fullWidth
                value={artist}
                onChange={(e) => handleArtistChange(index, e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#1E293B",
                    color: "white",
                    "& fieldset": {
                      borderColor: "#374151",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1DB954",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1DB954",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                }}
              />
              <IconButton
                onClick={() => handleRemoveArtist(index)}
                sx={{
                  color: "#ef4444",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                  },
                }}
                aria-label="Remove artist"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>

        {artists.length === 0 && (
          <Typography variant="body2" color="#666" textAlign="center" py={4}>
            No artists remaining. Upload a new image to try again.
          </Typography>
        )}
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: "#374151",
            color: "#b3b3b3",
            px: 4,
            py: 1.5,
            "&:hover": {
              borderColor: "#b3b3b3",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={artists.length === 0 || !eventName.trim()}
          variant="contained"
          startIcon={<CheckCircleIcon />}
          sx={{
            backgroundColor: "#1DB954",
            color: "#191414",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            "&:hover": {
              backgroundColor: "#1ed760",
            },
            "&:disabled": {
              backgroundColor: "#374151",
              color: "#666",
            },
          }}
        >
          Create Playlist
        </Button>
      </Stack>
    </Paper>
  );
}
