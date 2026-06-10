import { Router } from "express";
import {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multure.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import {
  publishVideoSchema,
  updateVideoSchema,
} from "../validators/video.validator.js";

const router = Router();

router.get("/", getAllVideos);

router.post(
  "/",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validateMiddleware(publishVideoSchema),
  publishAVideo,
);

router.get("/:videoId", verifyJWT, getVideoById);

router.patch(
  "/:videoId",
  verifyJWT,
  upload.single("thumbnail"),
  validateMiddleware(updateVideoSchema),
  updateVideo,
);

router.delete("/:videoId", verifyJWT, deleteVideo);

router.patch("/:videoId/toggle-publish", verifyJWT, togglePublishStatus);

export default router;
