import comment from "../model/comment.js";

export const getCommentsBySongId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await comment.find({ track: id }).sort({ createdAt: -1 }).limit(10).populate("user", "_id name imgUrl");
        
        res.status(200).json({
            statusCode: 200,
            message: "Get Comments Success",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};

export const createComment = async (req, res) => {
    try {
        const {userId, trackId, content, moment } = req.body;

        if (!content || !trackId) {
            return res.status(400).json({
                statusCode: 400,
                message: "Content and track ID are required",
                data: null
            });
        }

        const newComment = new comment({
            content,
            moment: moment || 0,
            user: userId,
            track: trackId
        });

        await newComment.save();
        
        // Populate user info for immediate display on frontend
        await newComment.populate("user", "_id name imgUrl");

        res.status(201).json({
            statusCode: 201,
            message: "Comment created successfully",
            data: newComment
        });

    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};
