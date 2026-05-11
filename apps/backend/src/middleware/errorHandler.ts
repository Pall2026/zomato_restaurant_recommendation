import { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const status = err.status || 500;
    const message = err.message || "An unexpected error occurred";

    console.error(`[error]: ${req.method} ${req.path}`, {
        status,
        message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });

    res.status(status).json({
        success: false,
        error: message,
        code: status
    });
}
