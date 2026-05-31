import fs from "fs/promises";
import { cloudinary } from "../config/cloudinary";

export async function uploadToCloudinary(
    file: Express.Multer.File,
    folder: string
) {
    const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "auto",
    });

    await fs.unlink(file.path).catch(() => undefined);

    return {
        url: result.secure_url,
        size: file.size,
        name: file.originalname,
        type: file.mimetype,
    };
}