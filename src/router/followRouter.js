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
router.get("/followers",verifyToken, getFollowers);
router.get("/following",verifyToken, getFollowing);
router.get("/status", verifyToken, checkFollowStatus);

export default router;
