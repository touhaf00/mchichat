import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { router } from "./routes";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { sanitizeRequestBody } from "./middlewares/sanitize.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) =>
    origin.trim()
);

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Origine non autorisée"));
        },
        credentials: true,
    })
);

app.use((req, res, next) => {
    const blockedPaths = [
        ".git",
        ".env",
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "prisma",
        "src",
        "node_modules",
    ];

    const url = req.originalUrl.toLowerCase();

    if (blockedPaths.some((blockedPath) => url.includes(blockedPath))) {
        return res.status(404).json({
            message: "Route not found",
        });
    }

    next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeRequestBody);

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
        setHeaders: (res, filePath) => {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            res.setHeader("Accept-Ranges", "bytes");

            if (filePath.endsWith(".webm")) {
                res.setHeader("Content-Type", "audio/webm");
            }

            if (filePath.endsWith(".m4a") || filePath.endsWith(".mp4")) {
                res.setHeader("Content-Type", "audio/mp4");
            }

            if (filePath.endsWith(".ogg")) {
                res.setHeader("Content-Type", "audio/ogg");
            }

            if (filePath.endsWith(".mp3")) {
                res.setHeader("Content-Type", "audio/mpeg");
            }

            if (filePath.endsWith(".wav")) {
                res.setHeader("Content-Type", "audio/wav");
            }
        },
    })
);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCssUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css",
        customJs: [
            "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js",
        ],
    })
);

app.use("/api/v1", router);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };