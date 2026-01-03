import Playlist from "../model/playlist";
import Song from "../model/song";

export const createPlaylist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
      });
    }

    const { title, description, imgUrl, isPublic } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({
        statusCode: 400,
        message: "title is required",
        data: null
      });
    }

    const payload = {
      title: title.trim(),
      user: userId,
      isPublic: typeof isPublic === "boolean" ? isPublic : true,
    };

    if (typeof description === "string" && description.trim()) {
      payload.description = description.trim();
    }

    if (typeof imgUrl === "string" && imgUrl.trim()) {
      payload.imgUrl = imgUrl.trim();
    }

    const playlist = await Playlist.create(payload);

    return res.status(201).json({
      statusCode: 201,
      message: "Playlist created",
      data: playlist,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

export const getPlaylistTracks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        statusCode: 400,
        message: "playlist id is required",
        data: null
      });
    }

    const playlist = await Playlist.findById(id)
      .populate({ path: "tracks.track", model: Song });

    if (!playlist || playlist.isDeleted) {
      return res.status(404).json({
        statusCode: 404,
        message: "Playlist not found",
        data: null
      });
    }

    // Access control: owner can always view; public playlists visible to anyone authenticated
    if (!playlist.isPublic && String(playlist.user) !== String(userId)) {
      return res.status(403).json({
        statusCode: 403,
        message: "Forbidden",
        data: null
      });
    }

    const songs = (playlist.tracks || [])
      .map(t => t?.track)
      .filter(Boolean)
      .map(s => ({
        id: s._id,
        title: s.title,
        imgUrl: s.imgUrl,
      }));

    return res.status(200).json({
      statusCode: 200,
      message: "Get playlist tracks success",
      data: {
        playlist: { id: playlist._id, title: playlist.title },
        songs,
      }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};
