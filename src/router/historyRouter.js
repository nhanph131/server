import express from "express";
import { clearUserHistory, getListeningHistory } from "../controllers/historyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const historyRouter = express.Router();

historyRouter.get("/history", getListeningHistory);

// Clear authenticated user's history (soft delete)
historyRouter.delete("/history/clear", verifyToken, clearUserHistory);

export default historyRouter;