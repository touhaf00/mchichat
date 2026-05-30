import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadPath = path.join(process.cwd(), "uploads", "profiles");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadPath);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

        callback(null, filename);
    },
});

export const uploadProfileMedia = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2,
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedImageTypes.includes(file.mimetype)) {
            callback(new Error("Seules les images JPG, PNG et WEBP sont autorisées"));
            return;
        }

        callback(null, true);
    },
});