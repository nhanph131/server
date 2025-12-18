import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    moment: {
        type: Number, // Giây thứ bao nhiêu trong bài hát
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song", // Hoặc "Track" tùy tên bạn đặt
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Comment", CommentSchema);