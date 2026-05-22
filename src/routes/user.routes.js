import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multure.middleware.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import { registerUserSchema } from "../validators/user.validator.js";

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

export default router;
