import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { createPlaylist, getPlaylistTracks } from "../controllers/libraryController";

const router = express.Router();

// Create a playlist
router.post("/library/playlists", verifyToken, createPlaylist);

// Get tracks of a playlist
router.get("/library/playlists/:id/tracks", verifyToken, getPlaylistTracks);

export default router;
