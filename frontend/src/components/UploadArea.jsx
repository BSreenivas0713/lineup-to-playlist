import { useRef, useState } from "react";
import { Box, Typography, Paper, Avatar, Button } from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

export default function UploadArea({ onFileUpload, uploading, processing }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 6,
        borderRadius: 4,
        backgroundColor: "#191414", // Spotify black
        color: "white",
        textAlign: "center",
        cursor: "pointer",
        border: dragOver ? "2px dashed #1DB954" : "2px dashed #333",
        transition: "all 0.3s ease",
        "&:hover": {
          border: "2px dashed #1DB954",
          backgroundColor: "#1a1a1a",
        },
      }}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <Avatar
        sx={{
          bgcolor: "#1DB954",
          width: 60,
          height: 60,
          mx: "auto",
          mb: 2,
        }}
      >
        <UploadFileRoundedIcon sx={{ fontSize: 36, color: "#191414" }} />
      </Avatar>

      <Typography variant="h5" fontWeight="bold" mb={1}>
        Upload Concert Lineup
      </Typography>
      <Typography variant="body2" color="#b3b3b3" mb={3}>
        Upload a screenshot or photo of a concert lineup poster.
      </Typography>
      <Typography variant="body1" color="#1DB954" fontWeight="medium">
        Click to upload or drag & drop
      </Typography>
      <Typography variant="caption" color="#666" display="block">
        PNG, JPG up to 10MB
      </Typography>

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileUpload}
        disabled={uploading || processing}
        style={{ display: "none" }}
      />
    </Paper>
  );
}
