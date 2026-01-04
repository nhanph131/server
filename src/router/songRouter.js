import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { 
    getSongs, 
    getSongById, 
    getCommentsBySongId, 
    addSong,
    getHomeData,
    uploadSongs,
    updateCover,
    updateSongInfo,
    getSongsByUploader,
    deleteSong,   // ✅ import controller delete
} from "../controllers/songController.js";

const songRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ------------------- Multer Config -------------------
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../filemp3"); 
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const uploadAudio = multer({ storage: audioStorage });

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/covers");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const uploadImage = multer({ storage: imageStorage });

// ------------------- Routes -------------------

// GET
songRouter.get("/songs", getSongs);
songRouter.get("/song/:id", getSongById);
songRouter.get("/song/:id/comments", getCommentsBySongId);
songRouter.get("/songs/home", getHomeData);

// Upload Audio
songRouter.post("/upload", uploadAudio.array("files", 10), uploadSongs);

// Upload / Update Cover Image
songRouter.post("/songs/:id/cover", uploadImage.single("cover"), updateCover);

// Update Song Info (title, description, category, optional cover)
const updateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir;
    if (file.fieldname === "cover") dir = path.join(__dirname, "../../uploads/covers");
    else if (file.fieldname === "track") dir = path.join(__dirname, "../../filemp3");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const uploadUpdate = multer({ storage: updateStorage });

songRouter.put(
  "/songs/:id",
  uploadUpdate.fields([
    { name: "cover", maxCount: 1 },
    { name: "track", maxCount: 1 },
  ]),
  updateSongInfo
);

// Add new song
songRouter.post("/songs", addSong);

// Delete song
songRouter.delete("/songs/:id", deleteSong);

// Profile – Songs by uploader
songRouter.get("/users/:id/songs", getSongsByUploader);

export default songRouter;
