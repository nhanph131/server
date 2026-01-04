import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 1. Import toàn bộ hàm từ Controller bạn cung cấp
import { 
    checkUsername,
    getListeningHistory,
    register,
    login,
    me,
    getUserStats,
    getPublicUser,
    updateAvatar
} from "../controllers/userController.js";

// 2. Setup Middleware xác thực (Cần thiết vì controller dùng req.user)
// Nếu bạn chưa có file middleware/authMiddleware.js, hãy tạo nó hoặc dùng hàm giả bên dưới để không bị lỗi server
// import { verifyToken } from "../middleware/authMiddleware.js";

// --- Middleware giả lập (Dùng tạm nếu chưa có Auth thật để tránh crash server) ---
const verifyToken = (req, res, next) => {
    // Logic thực tế: verify token từ header -> gán vào req.user
    // Ví dụ: req.user = { id: "..." };
    next(); 
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// 3. Config Multer (Để upload Avatar)
// Controller logic xóa ảnh cũ trong folder "images", nên ta phải lưu mới vào đó
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Từ src/router lùi ra root -> vào folder images
    const dir = path.join(__dirname, "../../images"); 
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Đặt tên file unique để tránh trùng
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

/* ================= ĐỊNH NGHĨA ROUTE ================= */

// --- A. NHÓM PUBLIC (Không cần đăng nhập) ---

// 1. Đăng ký & Đăng nhập
router.post("/auth/register", register);
router.post("/auth/login", login);

// 2. Kiểm tra user tồn tại (Controller dùng req.query.username)
// Gọi: /api/users/check?username=abc
router.get("/users/check", checkUsername); 


// --- B. NHÓM PRIVATE (Cần đăng nhập - verifyToken) ---

// 3. Lấy thông tin chính mình
router.get("/auth/me", verifyToken, me);

// 4. Lấy lịch sử nghe nhạc
router.get("/users/history", verifyToken, getListeningHistory);

// 5. Lấy thống kê (số bài upload, playlist...)
router.get("/users/stats", verifyToken, getUserStats);


// --- C. NHÓM DYNAMIC (Có tham số :id - Phải đặt cuối cùng) ---

// 6. Upload Avatar
// Controller dùng req.user.id để check quyền sở hữu vs req.params.id
// Controller check req.file => Cần uploadAvatar.single("file")
router.post("/users/:id/avatar", verifyToken, uploadAvatar.single("file"), updateAvatar);

// 7. Lấy thông tin user công khai (Public Profile)
// Route này bắt mọi link dạng /users/xxx nên phải để dưới cùng
router.get("/users/:id", getPublicUser);

export default router;