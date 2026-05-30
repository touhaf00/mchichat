import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "./config/env";
import { router } from "./routes";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
    })
);

app.use(
    "/uploads",
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    }),
    express.static(path.join(process.cwd(), "uploads"), {
        setHeaders: (res, filePath) => {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            res.setHeader("Access-Control-Allow-Origin", env.CORS_ORIGIN);
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", router);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };