import e from "express";
const router = e.Router();
import { register } from "../controllers/register.js";

router.post("/register", register);

export default router;
