import express from "express";
import songRouter from "./router/songRouter";
import historyRouter from "./router/historyRouter";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import homeRouter from "./router/homeRouter";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// middleware
app.use(express.json());

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// Router
app.use("/api", songRouter);
app.use('/api', homeRouter);
app.use('/api', historyRouter);

// file mp3
app.use('/track', express.static(path.join(__dirname, '../filemp3')));

export const viteNodeApp = app;