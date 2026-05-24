import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(process.cwd(), "uploads", "profiles");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadPath);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        callback(null, filename);
    },
});

export const uploadProfileMedia = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 20,
    },
    fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            callback(new Error("Seules les images sont autorisées"));
            return;
        }

        callback(null, true);
    },
});