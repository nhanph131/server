// src/controllers/songController.js
import Song from "../model/song.js";     // Nhớ thêm .js nếu dùng ES Modules
import User from "../model/user.js";     // Import User model for population
import Comment from "../model/comment.js";

// ============================================================
// 🔽 PHẦN CODE CŨ (GIỮ NGUYÊN FORM)
// ============================================================

export const getSongs = async (req, res) => {
    try {
        const data = await Song.find().populate("uploader", "_id name roles role");
        // Return structure matching the user's image
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
        
        // (Optional) Nếu muốn tăng view mỗi khi gọi chi tiết bài hát thì uncomment dòng dưới:
        // await Song.findByIdAndUpdate(id, { $inc: { countPlay: 1 } });

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
// 🔽 PHẦN CODE MỚI THÊM VÀO (UPLOAD, SEARCH, HOME, UPDATE)
// ============================================================

// Helper: Hàm bỏ dấu tiếng Việt để tìm kiếm/lưu normalize
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

// 1. Lấy dữ liệu trang Home (Top bài hát mới nhất/hot nhất)
export const getHomeData = async (req, res) => {
    try {
        // Lấy 20 bài mới nhất
        const data = await Song.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("uploader", "_id name");

        // Trả về đúng format mà Frontend đang mong đợi (thường là mảng trực tiếp hoặc object data)
        // Nếu frontend dùng axios.get('/api/songs/home') mong đợi mảng:
        res.status(200).json(data); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Upload Audio (Xử lý nhiều file)
export const uploadSongs = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không có file nào được tải lên" });
        }

        const songs = [];
        // Giả lập ID user (hoặc lấy từ req.user._id nếu đã có middleware auth)
        const fakeUserId = "693d8f6d53bc79c243c10737"; 

        for (const f of req.files) {
            const baseName = f.originalname.replace(/\.[^/.]+$/, "");
            
            const newSong = await Song.create({
                title: baseName,                    // Tên bài hát lấy từ tên file
                title_normalized: normalizeText(baseName),
                description: "Unknown Artist",      // Mặc định
                category: "General",                // Mặc định
                imgUrl: "",                         // Chưa có ảnh
                trackUrl: f.filename,               // Lưu tên file nhạc vừa upload
                uploader: fakeUserId,
                countLike: 0,
                countPlay: 0
            });
            songs.push(newSong);
        }

        res.status(201).json({ 
            statusCode: 201,
            message: "Upload thành công", 
            songs: songs // Trả về danh sách để frontend hiển thị form edit
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Upload/Cập nhật Cover Image
export const updateCover = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Thiếu file ảnh" });
        
        // Đường dẫn lưu vào DB (ví dụ: /uploads/covers/filename.jpg)
        const imgPath = `/uploads/covers/${req.file.filename}`;

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

// 4. Cập nhật thông tin bài hát (Title, Artist, Genre)
export const updateSongInfo = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const updateData = { ...req.body };

        // Cập nhật thêm trường normalized để search không dấu
        if (title) updateData.title_normalized = normalizeText(title);
        if (description) updateData.description_normalized = normalizeText(description);

        const song = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        res.status(200).json({ 
            message: "Cập nhật thông tin thành công", 
            song: song 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Chức năng Search (Tìm kiếm)
export const searchSongs = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) return res.json({ songs: [] });

        const regex = new RegExp(q, "i"); 
        const keywordNormalized = normalizeText(q);
        const regexNorm = new RegExp(keywordNormalized, "i");

        // Tìm trong title, description (artist), category
        const songs = await Song.find({
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } }, 
                { category: { $regex: regex } },
                { title_normalized: { $regex: regexNorm } }
            ]
        });

        // Trả về object songs để khớp với frontend SearchPage
        res.json({ songs: songs }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};