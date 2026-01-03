// Viet cac cau lenh get, post, put, delete
import express from "express";
import { getSongs, getSongById, likeSong, unlikeSong } from "../controllers/songController.js";
import { getHomeData } from "../controllers/homeController.js"; 
import { verifyToken } from "../middleware/authMiddleware.js";
const songRouter = express.Router();

songRouter.get("/songs", getSongs);
songRouter.get("/song/:id", getSongById);
songRouter.get("/songs/home", getHomeData); 
songRouter.post("/song/:id/like", verifyToken, likeSong);
songRouter.delete("/song/:id/like", verifyToken, unlikeSong);
// songRouter.get("/song/:slug", (req, res) => {
//     console.log("slug", req.params.slug);
    
// });
// songRouter.post("/song/", (req, res) => {
//     console.log("body", req.body);
    
// });
// songRouter.put("/song", (req, res) => {
//     res.send("Hello World!");
// });
// songRouter.delete("/song", (req, res) => {
//     res.send("Hello World!");
// });

export default songRouter;