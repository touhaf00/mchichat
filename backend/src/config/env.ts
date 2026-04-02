import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL || "",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};