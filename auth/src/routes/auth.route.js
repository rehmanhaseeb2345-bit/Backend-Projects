import e from "express";
const router = e.Router();
import {
  register,
  getUser,
  refreshToken,
} from "../controllers/Authorisation.js";

router.post("/register", register);
router.get("/me", getUser);
router.post("/refresh-token", refreshToken);

export default router;
