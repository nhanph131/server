// src/router/songRouter.js
import express from "express";
import { 
    getSongs, 
    getSongById, 
    addSong,
    likeSong, 
    unlikeSong,
    uploadSongs,
    updateCover,
    updateSongInfo
} from "../controllers/songController.js";
import { getHomeData } from "../controllers/homeController.js"; 
import { verifyToken } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Song from "../model/song.js"; // Import model Song for line 89

const songRouter = express.Router();

// ... (Giữ nguyên phần cấu hình Multer Audio & Image y hệt cũ) ...
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config lưu file MP3
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../filemp3"); 
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});
const uploadAudio = multer({ storage: audioStorage });

// Config lưu ảnh Cover
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/covers");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});
const uploadImage = multer({ storage: imageStorage });

// --- ROUTES ---
songRouter.get("/songs", getSongs);
songRouter.get("/song/:id", getSongById);
songRouter.get("/songs/home", getHomeData); 
songRouter.post("/song/:id/like", verifyToken, likeSong);
songRouter.delete("/song/:id/like", verifyToken, unlikeSong);
// songRouter.get("/song/:slug", (req, res) => {
//     console.log("slug", req.params.slug);
    
// });
// songRouter.post("/song/", (req, res) => {
//     console.log("body", req.body);
    
// });
// songRouter.put("/song", (req, res) => {
//     res.send("Hello World!");
// });
// songRouter.delete("/song", (req, res) => {
//     res.send("Hello World!");
// });

// ❌ ĐÃ XÓA ROUTE SEARCH Ở ĐÂY ĐỂ CHUYỂN SANG searchRouter

songRouter.post("/upload", uploadAudio.array("files", 10), uploadSongs);
songRouter.post("/songs/:id/cover", uploadImage.single("cover"), updateCover);
songRouter.put("/songs/:id", updateSongInfo);
songRouter.post("/songs", addSong); 
songRouter.post('/songs', async (req, res) => {
  try {
    const newSong = new Song(req.body);
    // Lưu ý: req.body cần chứa: title, description, imgUrl, trackUrl...
    // và uploader (ID của admin đang đăng nhập)
    await newSong.save();
    res.status(201).json(newSong);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. UPDATE SONG (Sửa thông tin bài hát)
songRouter.put('/songs/:id', async (req, res) => {
  try {
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedSong);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE SONG (Xóa bài hát)
songRouter.delete('/songs/:id', async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: "Song deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default songRouter;