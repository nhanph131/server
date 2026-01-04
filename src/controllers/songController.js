// src/controllers/songController.js
import Song from "../model/song.js";
import User from "../model/user.js"; 
import Comment from "../model/comment.js";
import fs from "fs";
import path from "path";

// ============================================================
// 🔽 PHẦN CODE CŨ (GET DATA)
// ============================================================

export const getSongs = async (req, res) => {
    try {
        const data = await Song.find().populate("uploader", "_id name roles role");
        res.status(200).json({
            statusCode: 200,
            message: "Get All Track",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Song.findById(id).populate("uploader", "_id name roles role");

        if (!data) {
            return res.status(404).json({
                statusCode: 404,
                message: "Song not found",
                data: null
            });
        }
        res.status(200).json({
            statusCode: 200,
            message: "Get Song Detail Success",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCommentsBySongId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Comment.find({ track: id }).populate("user", "_id name imgUrl");
        res.status(200).json({
            statusCode: 200,
            message: "Get Comments Success",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHomeData = async (req, res) => {
    try {
        // Lấy 50 bài mới nhất và populate uploader để hiển thị tên ca sĩ
        const songs = await Song.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("uploader", "_id name");
            
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addSong = async (req, res) => {
    try {
        const data = await Song.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 🔽 PHẦN CODE MỚI (UPLOAD, UPDATE, SEARCH)
// ============================================================

// Helper: Hàm bỏ dấu tiếng Việt
function normalizeText(str) {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

// 2. Upload Audio (Xử lý nhiều file)
export const uploadSongs = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0)
            return res.status(400).json({ message: "Không có file nào được tải lên" });

        const songs = [];
        // TODO: Sau này có Auth thì thay bằng req.user._id
        const fakeUserId = "693d8f6d53bc79c243c10737"; 

        for (const f of req.files) {
            const baseName = f.originalname.replace(/\.[^/.]+$/, "");
            
            // --- QUAN TRỌNG: Thêm tiền tố /filemp3/ vào DB để Frontend play được ---
            const trackPath = `/filemp3/${f.filename}`;

            const newSong = await Song.create({
                title: baseName,
                title_normalized: normalizeText(baseName),
                description: "Unknown Artist",
                category: "General",
                imgUrl: "", 
                trackUrl: trackPath, // Lưu đường dẫn đầy đủ (/filemp3/...)
                uploader: fakeUserId,
                countLike: 0,
                countPlay: 0
            });
            songs.push(newSong);
        }

        res.status(201).json({ 
            statusCode: 201,
            message: "Upload thành công", 
            songs: songs 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Cover
export const updateCover = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Thiếu file ảnh" });
        
        // --- QUAN TRỌNG: Lưu vào folder images để Frontend hiển thị được ---
        const imgPath = `/images/${req.file.filename}`;

        const song = await Song.findByIdAndUpdate(
            req.params.id,
            { imgUrl: imgPath },
            { new: true }
        );

        res.status(200).json({ 
            message: "Cập nhật ảnh bìa thành công", 
            song: song 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Update Song Info (Chỉ update text, không xử lý file ở đây)
export const updateSongInfo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const updateData = { ...req.body };

        if (title) updateData.title_normalized = normalizeText(title);
        if (description) updateData.description_normalized = normalizeText(description);

        const song = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json({ message: "Cập nhật thông tin thành công", song });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Search Songs
export const searchSongs = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) return res.json({ songs: [] });

        const regex = new RegExp(q, "i"); 
        const regexNorm = new RegExp(normalizeText(q), "i");

        const songs = await Song.find({
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } }, 
                { category: { $regex: regex } },
                { title_normalized: { $regex: regexNorm } }
            ]
        });

        res.json({ songs: songs }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Get Songs by Uploader
export const getSongsByUploader = async (req, res) => {
    try {
        const { id } = req.params;
        const songs = await Song.find({ uploader: id, isDeleted: false }).sort({ createdAt: -1 });
        res.json({ songs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. DELETE SONG (XÓA THẬT, xóa file track + cover)
export const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) return res.status(404).json({ message: "Song not found" });

        // Xử lý đường dẫn để xóa file vật lý
        // Vì trong DB lưu dạng "/filemp3/abc.mp3", ta cần bỏ dấu "/" đầu tiên đi để path.join hoạt động đúng từ root
        if (song.trackUrl) {
            const relativePath = song.trackUrl.startsWith('/') ? song.trackUrl.substring(1) : song.trackUrl;
            const trackPath = path.join(process.cwd(), relativePath);
            if (fs.existsSync(trackPath)) fs.unlinkSync(trackPath);
        }

        if (song.imgUrl) {
            const relativePath = song.imgUrl.startsWith('/') ? song.imgUrl.substring(1) : song.imgUrl;
            const coverPath = path.join(process.cwd(), relativePath);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }

        // Xóa DB
        await Song.findByIdAndDelete(id);

        res.status(200).json({ statusCode: 200, message: "Song deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};