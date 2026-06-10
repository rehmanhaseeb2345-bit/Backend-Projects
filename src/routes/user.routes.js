import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getMe,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multure.middleware.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import {
  registerUserSchema,
  loginUserSchema,
  changeCurrentPasswordSchema,
  updateAccountDetailsSchema,
} from "../validators/user.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validateMiddleware(registerUserSchema),
  registerUser,
);

router.post("/login", validateMiddleware(loginUserSchema), loginUser);

router.post("/refresh-token", refreshAccessToken);

// Secured routes
router.post("/logout", verifyJWT, logoutUser);

router.post(
  "/change-password",
  verifyJWT,
  validateMiddleware(changeCurrentPasswordSchema),
  changeCurrentPassword,
);

router.get("/me", verifyJWT, getMe);

router.patch(
  "/update-account",
  verifyJWT,
  validateMiddleware(updateAccountDetailsSchema),
  updateAccountDetails,
);

router.patch(
  "/avatar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar,
);

router.patch(
  "/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage,
);

router.get("/channel/:username", verifyJWT, getUserChannelProfile);

export default router;
