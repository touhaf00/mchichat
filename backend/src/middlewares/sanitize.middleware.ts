import type { NextFunction, Request, Response } from "express";
import { sanitizeObject } from "../utils/sanitize";

export function sanitizeRequestBody(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
    }

    next();
}