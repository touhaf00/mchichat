import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const env = {
    PORT: getEnv("PORT"),
    NODE_ENV: getEnv("NODE_ENV"),
    DATABASE_URL: getEnv("DATABASE_URL"),
    JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN"),
    CORS_ORIGIN: getEnv("CORS_ORIGIN"),
    GIPHY_API_KEY: getEnv("GIPHY_API_KEY"),
};