// src/router/searchRouter.js
import express from "express";
import { searchSongs } from "../controllers/songController.js";

const searchRouter = express.Router();

// Định nghĩa route: /search
// Khi ghép vào app.js sẽ thành: /api/search
searchRouter.get("/search", searchSongs);

export default searchRouter;