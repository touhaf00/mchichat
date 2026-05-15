import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "posts");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDir);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
        callback(null, uniqueName);
    },
});

export const uploadPostMedia = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");

        if (!isImage && !isVideo) {
            return callback(new Error("Seules les images et vidéos sont autorisées"));
        }

        callback(null, true);
    },
});