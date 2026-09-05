import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: `applications/coach/${req.user.id}`,
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
        resource_type: "auto"
    })
});

const coachUpload = multer({
    storage,
    limits: {
        files: 10,
        fileSize: 10 * 1024 * 1024 // 10 MB per file
    }
});

export default coachUpload;