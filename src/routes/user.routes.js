import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multure.middleware.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validators/user.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  validateMiddleware(registerUserSchema),
  registerUser,
);

router.post("/login", validateMiddleware(loginUserSchema), loginUser);

// Secured Routes

router.post("/logout", verifyJWT, logoutUser);

export default router;
