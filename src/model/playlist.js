const PlaylistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imgUrl: {
        type: String,
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tracks: [
        {
            track: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Song"
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Playlist", PlaylistSchema);