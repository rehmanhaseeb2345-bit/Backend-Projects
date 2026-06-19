import e from "express";
const router = e.Router();
import {
  register,
  getUser,
  refreshToken,
} from "../controllers/Authorisation.js";
import { requireAuth } from "../middleware/auth.js";

router.post("/register", register);
router.get("/me", requireAuth, getUser);
router.post("/refresh-token", refreshToken);

export default router;
