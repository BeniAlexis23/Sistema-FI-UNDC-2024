import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';

import authRoutes from "./routes/auth.routes.js";
import noticesRoutes from "./routes/notices.routes.js";
import rcfsRoutes from "./routes/rcfs.routes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:4000', credentials: true })); //Local: 'http://localhost:5173'
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Rutas del API
app.use("/api", authRoutes);
app.use("/api", noticesRoutes);
app.use("/api", rcfsRoutes);

export default app;