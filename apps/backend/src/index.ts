import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db/client";
import recommendationsRouter from "./routes/recommendations";
import { recommendationRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

export const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Routes
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ 
            status: "ok", 
            message: "AI Restaurant Recommendation Service Backend running",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("[health]: Database connection failed", error);
        res.status(503).json({ 
            status: "error", 
            message: "AI Restaurant Recommendation Service Backend partially unavailable",
            database: "disconnected",
            timestamp: new Date().toISOString()
        });
    }
});

// API Routes with Rate Limiting
app.use("/api", recommendationRateLimiter, recommendationsRouter);

// Error Handling (Must be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}
