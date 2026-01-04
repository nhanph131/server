import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Routers
import songRouter from "./router/songRouter.js";
import historyRouter from "./router/historyRouter.js";
import homeRouter from "./router/homeRouter.js";
import searchRouter from "./router/searchRouter.js";
import userRouter from "./router/userRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Router
app.use("/api", songRouter);
app.use("/api", homeRouter);
app.use("/api", historyRouter);
app.use("/api", searchRouter);
app.use("/api", userRouter);
app.use("/api/users", userRouter);

// Static
app.use("/track", express.static(path.join(__dirname, "../filemp3")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/uploads", express.static("uploads"));


export const viteNodeApp = app;
