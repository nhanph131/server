// Viet cac phuong thuc get, post, put, delete
import Song from "../model/song";
import User from "../model/user"; // Import User model for population
import Comment from "../model/comment";
import Favorite from "../model/favorite";

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
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};
// export const getProductById = (req, res) => {
//     res.send("Hello World!");
// };

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
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};

export const addSong = async (req, res) => {
    try {
        const data = await Song.create(req.body);
        res.status(201).json({
            statusCode: 201,
            message: "Add Song Success",
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
// like song
export const likeSong = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
    });
    if (!id) return res.status(400).json({
        statusCode: 400,
        message: "song id is required",
        data: null
    });

    const song = await Song.findById(id);
    if (!song || song.isDeleted) return res.status(404).json({
        statusCode: 404,
        message: "Song not found",
        data: null
    });

    let favorite = await Favorite.findOne({ user: userId, track: id });
    if (favorite && !favorite.isDeleted) {
      return res.status(200).json({
        statusCode: 200,
        message: "Already liked",
        data: { liked: true }
      });
    }

    if (favorite && favorite.isDeleted) {
      favorite.isDeleted = false;
      favorite.likedAt = new Date();
      await favorite.save();
    } else {
      favorite = await Favorite.create({ user: userId, track: id });
    }

    await Song.updateOne({ _id: id }, { $inc: { countLike: 1 } });

    return res.status(200).json({
        statusCode: 200,
        message: "Liked",
        data: { liked: true }
    });
  } catch (err) {
    return res.status(500).json({
        statusCode: 500,
        message: err.message,
        data: null
    });
  }
};
// unlike song
export const unlikeSong = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
    });
    if (!id) return res.status(400).json({
        statusCode: 400,
        message: "song id is required",
        data: null
    });

    const favorite = await Favorite.findOne({ user: userId, track: id });
    if (!favorite) {
      return res.status(404).json({
        statusCode: 404,
        message: "Favorite not found",
        data: null
      });
    }

    if (favorite.isDeleted) {
      return res.status(200).json({
        statusCode: 200,
        message: "Already unliked",
        data: { liked: false }
      });
    }

    favorite.isDeleted = true;
    await favorite.save();

    await Song.updateOne({ _id: id }, { $inc: { countLike: -1 } });

    return res.status(200).json({
        statusCode: 200,
        message: "Unliked",
        data: { liked: false }
    });
  } catch (err) {
    return res.status(500).json({
        statusCode: 500,
        message: err.message,
        data: null
    });
  }
};
