import express from "express";
import { login, register, checkUsername, me } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-username", checkUsername);
router.get("/me", verifyToken, me);

export default router;
