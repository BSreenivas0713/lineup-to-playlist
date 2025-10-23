import { AppBar, Toolbar, Typography, Avatar, Button, Box, Paper } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";

export default function Header({ user, onLogout }) {
  return (
    <Paper
      elevation={0} // Spotify uses almost no shadow
      sx={{
        mb: 4,
        overflow: "hidden",
        backgroundColor: "#191414", // Spotify black
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#191414", // solid Spotify black
          color: "white",
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
          }}
        >
          {/* Left side - Logo + Text */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(29,185,84,0.2)", // subtle Spotify green
                width: 48,
                height: 48,
              }}
            >
              <MusicNoteRoundedIcon fontSize="medium" sx={{ color: "#1DB954" }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Concert Playlist Creator
              </Typography>
              <Typography variant="body2" sx={{ color: "#b3b3b3" }}>
                {user?.display_name
                  ? `Hey ${user.display_name}!`
                  : "Logged in to Spotify"}
              </Typography>
            </Box>
          </Box>

          {/* Right side - Logout button */}
          <Button
            variant="contained"
            onClick={onLogout}
            startIcon={<LogoutRoundedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "9999px",
              px: 3,
              py: 1,
              backgroundColor: "#1DB954",
              color: "#191414",
              "&:hover": {
                backgroundColor: "#1ed760",
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Paper>
  );
}
