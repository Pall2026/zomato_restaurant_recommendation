import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
    throw new Error("DATABASE_URL is not set in environment variables");
}

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost/test';

export const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false, // Required for Neon
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
    console.log("[database]: New client connected to the pool");
});

pool.on("error", (err) => {
    console.error("[database]: Unexpected error on idle client", err);
});

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("[database]: Executed query", { text, duration: `${duration}ms`, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error("[database]: Query error", { text, error });
        throw error;
    }
};
