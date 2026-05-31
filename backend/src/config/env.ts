import dotenv from "dotenv";


dotenv.config();

function getEnv(name: string, fallback?: string): string {
    const value = process.env[name] || fallback;

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const env = {
    PORT: getEnv("PORT", "5000"),
    NODE_ENV: getEnv("NODE_ENV", "development"),
    DATABASE_URL: getEnv("DATABASE_URL"),
    JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
    JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "1d"),
    CORS_ORIGIN: getEnv("CORS_ORIGIN"),
    GIPHY_API_KEY: getEnv("GIPHY_API_KEY"),
    NEWSDATA_API_KEY: getEnv("NEWSDATA_API_KEY"),
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
};
