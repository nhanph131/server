import express from "express";
import { getHistory } from "../controllers/historyController";

const historyRouter = express.Router();

historyRouter.get("/history", getHistory);

export default historyRouter;
