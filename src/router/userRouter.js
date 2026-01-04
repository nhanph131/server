import express from "express";
import User from "../model/user.js";
import { uploadAvatar } from "../middleware/uploadAvatar.js";
import {
  login,
  register,
  checkUsername,
  me,
  getUserStats,
  getPublicUser,
  updateAvatar,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= AUTH ================= */

// login
router.post("/login", login);

// register
router.post("/register", register);

// check username
router.get("/check-username", checkUsername);

// current user
router.get("/me", verifyToken, me);

// user stats
router.get("/stats", verifyToken, getUserStats);

// public user profile  
router.get("/:id", getPublicUser);

// update avatar 
router.put(
  "/:id/avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  updateAvatar
);

/* ============== ADMIN / CRUD ============== */

// 1. GET ALL USERS (Để hiển thị lên bảng Admin)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select('-password'); // Không trả về mật khẩu
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. UPDATE USER (Để sửa quyền Admin/User)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { name, role }, 
      { new: true } // Trả về data mới sau khi update
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE USER (Xóa mềm hoặc xóa cứng)
router.delete('/users/:id', async (req, res) => {
  try {
    // Xóa mềm (Soft Delete) - Khuyên dùng
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
    
    // Hoặc Xóa cứng (Hard Delete): await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;