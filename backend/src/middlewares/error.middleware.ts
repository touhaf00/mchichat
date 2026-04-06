import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error(err);
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Données invalides",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    if (err instanceof Error) {
        return res.status(400).json({
            message: err.message,
        });
    }

    res.status(500).json({
        message: "Internal server error",
    });
}