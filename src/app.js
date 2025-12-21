import express from "express";
import songRouter from "./router/songRouter";
import historyRouter from "./router/historyRouter";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import homeRouter from "./router/homeRouter";

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

export const viteNodeApp = app;