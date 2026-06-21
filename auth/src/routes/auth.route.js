import e from "express";
import {
  register,
  login,
  getUser,
  refreshToken,
  logout,
  logoutAll,
} from "../controllers/authentication.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";

const router = e.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, getUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);

export default router;
