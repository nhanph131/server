import express from "express";
import { 
    followUser, 
    getFollowers, 
    getFollowing, 
    checkFollowStatus 
} from "../controllers/followController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/", verifyToken, followUser);
router.get("/followers/:userId", verifyToken, getFollowers);
router.get("/following/:userId", verifyToken, getFollowing);
router.get("/status/:userId", verifyToken, checkFollowStatus);

export default router;