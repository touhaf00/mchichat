import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(process.cwd(), "uploads/profiles");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadPath);
    },

    filename: (_req, file, callback) => {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        const extension = path.extname(file.originalname);

        callback(null, `${uniqueSuffix}${extension}`);
    },
});

function fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
) {
    if (file.mimetype.startsWith("image/")) {
        callback(null, true);
    } else {
        callback(new Error("Seules les images sont autorisées"));
    }
}

export const uploadProfileImage = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter,
});