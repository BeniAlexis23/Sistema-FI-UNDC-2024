import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';

import path from 'path';

import authRoutes from "./routes/auth.routes.js";
import noticesRoutes from "./routes/notices.routes.js";
import rcfsRoutes from "./routes/rcfs.routes.js";
import decretosRoutes from "./routes/decretos.routes.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true })); //Produccion: 'https://fi.undc.edu.pe'
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos estáticos

// Rutas del API
app.use("/api", authRoutes);
app.use("/api", noticesRoutes);
app.use("/api", rcfsRoutes);
app.use("/api", decretosRoutes);

app.use(express.static('dist'));

export default app;