import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== 'production';

export const recommendationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 100 : 10, // Higher limit for development
    message: {
        error: "Too many requests. Please wait before trying again."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
