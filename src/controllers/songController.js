// src/controllers/songController.js
import Song from "../model/song.js";     
import User from "../model/user.js";     
import Comment from "../model/comment.js";
import fs from "fs";
import path from "path";

// ============================================================
// 🔽 PHẦN CODE CŨ (GIỮ NGUYÊN FORM)
// ============================================================

export const getSongs = async (req, res) => {
    try {
        const data = await Song.find().populate("uploader", "_id name roles role");
        res.status(201).json({
            statusCode: 201,
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

export const addSong = async (req, res) => {
    try {
        const data = await Song.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 🔽 PHẦN CODE MỚI (UPLOAD, SEARCH, HOME, UPDATE, DELETE)
// ============================================================

// Helper: normalize text
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

// 1. Home Data
export const getHomeData = async (req, res) => {
    try {
        const data = await Song.find().sort({ createdAt: -1 }).limit(20)
            .populate("uploader", "_id name");
        res.status(200).json(data); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Upload Audio
export const uploadSongs = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0)
            return res.status(400).json({ message: "Không có file nào được tải lên" });

        const songs = [];
        const fakeUserId = "693d8f6d53bc79c243c10737"; 

        for (const f of req.files) {
            const baseName = f.originalname.replace(/\.[^/.]+$/, "");
            const newSong = await Song.create({
                title: baseName,
                title_normalized: normalizeText(baseName),
                description: "Unknown Artist",
                category: "General",
                imgUrl: "",
                trackUrl: f.filename,
                uploader: fakeUserId,
                countLike: 0,
                countPlay: 0
            });
            songs.push(newSong);
        }

        res.status(201).json({ statusCode: 201, message: "Upload thành công", songs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Cover
export const updateCover = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Thiếu file ảnh" });
        const imgPath = `/uploads/covers/${req.file.filename}`;
        const song = await Song.findByIdAndUpdate(req.params.id, { imgUrl: imgPath }, { new: true });
        res.status(200).json({ message: "Cập nhật ảnh bìa thành công", song });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Update Song Info
export const updateSongInfo = async (req, res) => {
    try {
        const { title, description, category } = req.body || {};
        const updateData = { ...req.body };

        if (req.files?.cover?.[0])
            updateData.imgUrl = `/uploads/covers/${req.files.cover[0].filename}`;

        if (req.files?.track?.[0])
            updateData.trackUrl = req.files.track[0].filename;

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

        res.json({ songs }); 
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

        // Xóa file track
        if (song.trackUrl) {
            const trackPath = path.join(process.cwd(), "filemp3", song.trackUrl);
            if (fs.existsSync(trackPath)) fs.unlinkSync(trackPath);
        }

        // Xóa cover
        if (song.imgUrl) {
            const coverPath = path.join(process.cwd(), song.imgUrl);
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
