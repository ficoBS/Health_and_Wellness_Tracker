import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js"
import logRoutes from './routes/logs.js'


dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

const port = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/logs', logRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})