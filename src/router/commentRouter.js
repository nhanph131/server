// Viet cac cau lenh get, post, put, delete
import express from "express";
import { getCommentsBySongId, createComment } from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const commentRouter = express.Router();

commentRouter.get("/comments/:id", getCommentsBySongId);
commentRouter.post("/comments", verifyToken, createComment);

export default commentRouter;