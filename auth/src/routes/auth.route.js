import e from "express";
import {
  register,
  login,
  getUser,
  refreshToken,
  logout,
  logoutAll,
  requestEmailOtp,
  verifyEmailOtp,
} from "../controllers/authentication.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  validate,
  validateRegister,
  validateLogin,
} from "../middleware/validate.js";
import { otpRequestLimiter } from "../middleware/rateLimiter.js";
import { verifyOtpSchema } from "../Validator/otp.validator.js";

const router = e.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, getUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);

router.post("/request-otp", requireAuth, otpRequestLimiter, requestEmailOtp);
router.post("/verify-otp", requireAuth, validate(verifyOtpSchema), verifyEmailOtp);

export default router;
