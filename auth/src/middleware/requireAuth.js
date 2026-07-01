import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";
import { asyncHandler } from "./asyncHandler.js";

// Verifies the Bearer access token, loads the user, and attaches it to the
// request as `req.user` (and `req.userId`) for downstream handlers/middleware.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ message: "User no longer exists" });
  }

  req.user = user;
  req.userId = user.id;
  next();
});
