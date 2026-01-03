import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getUserStats,
  getUserLikedSongs,
  getUserPlaylists,
  getUserHistory,
  getPublicUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/stats", verifyToken, getUserStats);
router.get("/likes", verifyToken, getUserLikedSongs);
router.get("/playlists", verifyToken, getUserPlaylists);
router.get("/history", verifyToken, getUserHistory);
router.get("/public/:id", verifyToken, getPublicUser);

export default router;