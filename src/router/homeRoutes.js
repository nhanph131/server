import express from "express";
import { getHomeData } from "../controllers/homeController";
import { getListeningHistory } from "../controllers/userController";
const homeRouter = express.Router();

homeRouter.get('/home', getHomeData);
homeRouter.get('/history', getListeningHistory);

export default homeRouter;
