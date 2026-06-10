import multer from "multer";
import path from "path";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});

const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const allowedVideoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
];

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "videoFile") {
    if (!allowedVideoMimeTypes.includes(file.mimetype)) {
      return cb(
        new ApiError(
          400,
          "Invalid file type. Only MP4, WebM, OGG, MOV, and MKV videos are allowed.",
        ),
        false,
      );
    }
    return cb(null, true);
  }

  if (!allowedImageMimeTypes.includes(file.mimetype)) {
    return cb(
      new ApiError(
        400,
        "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
      ),
      false,
    );
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit (covers video uploads)
  fileFilter,
});
