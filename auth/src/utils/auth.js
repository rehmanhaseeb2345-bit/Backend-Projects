import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import SessionModel from "../models/session.model.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_TOKEN_TTL_MS,
};

// SHA-256 is the right tool for hashing a high-entropy token: it handles the
// full token length (bcrypt silently truncates at 72 bytes) and is fast.
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Constant-time comparison of two hex digests of equal length.
export const tokenMatchesHash = (token, hash) => {
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

// Creates a refresh-token session, stores only its hash, and sets the raw
// token as an httpOnly cookie. Returns the session id for callers that need it.
export const issueRefreshSession = async (user, req, res) => {
  const sessionId = new mongoose.Types.ObjectId();

  const refreshToken = jwt.sign(
    { id: user._id, sid: sessionId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  await SessionModel.create({
    _id: sessionId,
    user: user._id,
    tokenHash: hashToken(refreshToken),
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return sessionId;
};
