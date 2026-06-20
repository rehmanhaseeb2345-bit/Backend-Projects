import e from "express";
const router = e.Router();
import {
  register,
  getUser,
  refreshToken,
  logout,
} from "../controllers/authentication.js";
import { requireAuth } from "../middleware/auth.js";

router.post("/register", register);
router.get("/me", requireAuth, getUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
