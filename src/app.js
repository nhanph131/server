import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectDB } from "./config/db.js"; // ✅ Thêm lại kết nối DB

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
app.use(express.urlencoded({ extended: true }));

// Kết nối Database
connectDB(process.env.MONGO_URI);

// --- Router ---
app.use("/api", songRouter);
app.use("/api", homeRouter);
app.use("/api", historyRouter);
app.use("/api", searchRouter);
app.use("/api", userRouter);
// app.use("/api/users", userRouter); // ⚠️ Dòng này thường thừa nếu userRouter đã định nghĩa route (ví dụ /register, /login). Nếu cần thiết thì mở lại.

// --- Static files (Cấu hình chuẩn theo Controller mới) ---

// 1. Nhạc: Truy cập http://localhost:8080/filemp3/tenbaihat.mp3
app.use('/filemp3', express.static(path.join(__dirname, '../filemp3')));

// 2. Ảnh: Truy cập http://localhost:8080/images/tenanh.jpg
// (Thay thế cho folder uploads cũ để đồng bộ)
app.use('/images', express.static(path.join(__dirname, '../images')));

export const viteNodeApp = app;