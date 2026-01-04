// src/model/song.js
import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Tên bài hát
    description: { type: String, default: "" }, // Tên ca sĩ (Dương Domic)
    category: { type: String, default: "" }, // Thể loại (RAP)
    imgUrl: { type: String, default: "" }, // Ảnh bìa (mtvcm.png)
    trackUrl: { type: String, required: true }, // File nhạc (Mat-Ket-Noi.mp3)
    countLike: { type: Number, default: 0 },
    countPlay: { type: Number, default: 0 },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Nếu có user
    isDeleted: { type: Boolean, default: false },
    
    // Các trường tìm kiếm không dấu (để search tốt hơn)
    title_normalized: { type: String },
    description_normalized: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Song || mongoose.model("Song", songSchema);
