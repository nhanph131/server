import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
        required: true
    },
    listenedAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("History", HistorySchema);