import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = path.join(process.cwd(), "uploads", "posts");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedPostTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
];

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDir);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

        callback(null, uniqueName);
    },
});

export const uploadPostMedia = multer({
    storage,
    limits: {
        fileSize: 25 * 1024 * 1024,
        files: 1,
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedPostTypes.includes(file.mimetype)) {
            callback(new Error("Seules les images et vidéos autorisées sont acceptées"));
            return;
        }

        callback(null, true);
    },
});