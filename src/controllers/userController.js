import User from "../model/user.js";
import jwt from "jsonwebtoken";
import Song from "../model/song.js";
import Favorite from "../model/favorite.js";
import Playlist from "../model/playlist.js";
import History from "../model/history.js";
import fs from "fs";
import path from "path";

/* ================= CHECK USERNAME ================= */

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }

    const user = await User.findOne({ username, isDeleted: false });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= REGISTER ================= */

export const register = async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        message: "username, password, name are required"
      });
    }

    const existing = await User.findOne({ username, isDeleted: false });
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const user = await User.create({
      username,
      password,
      name
    });

    res.status(201).json({
      message: "Register success",
      user
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required"
      });
    }

    const user = await User.findOne({ username, isDeleted: false });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET not configured" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      secret,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login success",
      user,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CURRENT USER ================= */

export const me = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= USER STATS ================= */

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [uploadedCount, favoriteCount, playlistCount, user] =
      await Promise.all([
        Song.countDocuments({ uploader: userId, isDeleted: false }),
        Favorite.countDocuments({ user: userId, isDeleted: false }),
        Playlist.countDocuments({ user: userId, isDeleted: false }),
        User.findById(userId).select("createdAt")
      ]);

    const createdAt = user?.createdAt
      ? new Date(user.createdAt).getTime()
      : Date.now();

    const daysSinceCreated = Math.floor(
      (Date.now() - createdAt) / 86400000
    );

    res.json({
      uploadedCount,
      favoriteCount,
      playlistCount,
      daysSinceCreated,
      followedCount: 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= PUBLIC USER ================= */

export const getPublicUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "User id is required" });
    }

    const user = await User.findById(id).select(
      "_id username name imgUrl role createdAt"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE AVATAR ================= */

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    const targetId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (userId.toString() !== targetId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // delete old avatar
    if (user.imgUrl && user.imgUrl !== "default_avatar.png") {
      try {
        const oldPath = path.join("uploads/avatars", user.imgUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (e) {
        console.warn("Delete old avatar failed:", e.message);
      }
    }

    user.imgUrl = req.file.filename;
    await user.save();

    res.json({
      message: "Avatar updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        imgUrl: user.imgUrl
      }
    });
  } catch (err) {
    console.error("updateAvatar error:", err);
    res.status(500).json({ message: err.message });
  }
};
