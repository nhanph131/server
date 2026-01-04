// src/router/songRouter.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Import Controller
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
    deleteSong, 
} from "../controllers/songController.js";

const songRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================
// 1. CONFIG MULTER (Nơi lưu file)
// ============================================================

// A. Lưu nhạc -> vào folder 'filemp3'
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Từ router lùi 2 cấp (src -> server) rồi vào filemp3
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

// B. Lưu ảnh -> vào folder 'images' (Khớp với app.js)
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../images"); 
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const uploadImage = multer({ storage: imageStorage });

// ============================================================
// 2. ROUTES (API)
// ============================================================

// --- GET Routes ---
songRouter.get("/songs", getSongs);
songRouter.get("/song/:id", getSongById);
songRouter.get("/song/:id/comments", getCommentsBySongId);
songRouter.get("/songs/home", getHomeData); 
songRouter.get("/users/:id/songs", getSongsByUploader); // Lấy nhạc của user

// --- UPLOAD Routes ---
// Upload nhiều file nhạc
songRouter.post("/upload", uploadAudio.array("files", 10), uploadSongs);

// Upload ảnh bìa (Cover) cho 1 bài hát
songRouter.post("/songs/:id/cover", uploadImage.single("cover"), updateCover);

// --- CRUD Routes ---
// Thêm bài hát (JSON only, nếu dùng form data thì dùng route upload trên)
songRouter.post("/songs", addSong); 

// Cập nhật thông tin bài hát (Title, Artist...)
songRouter.put("/songs/:id", updateSongInfo);

// Xóa bài hát (Xóa cả file vật lý và DB)
songRouter.delete("/songs/:id", deleteSong);

export default songRouter;