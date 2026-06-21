import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import env from "../config/env.js";
import SessionModel from "../models/session.model.js";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict",
  maxAge: env.REFRESH_TOKEN_TTL_MS,
};

export const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });

// NOTE: bcrypt silently truncates input at 72 bytes, and a refresh JWT is
// longer than that. We always look a session up by its unique `sid` first and
// only then compare, so the truncation risk is scoped to a single session
// rather than allowing cross-session collisions.
export const hashToken = (token) => bcrypt.hash(token, 10);

export const compareToken = (token, hash) => bcrypt.compare(token, hash);

// Creates a refresh-token session, stores only its (bcrypt) hash, and sets the
// raw token as an httpOnly cookie. Returns the session id for callers that need it.
export const issueRefreshSession = async (user, req, res) => {
  const sessionId = new mongoose.Types.ObjectId();

  const refreshToken = jwt.sign(
    { id: user._id, sid: sessionId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_TTL },
  );

  await SessionModel.create({
    _id: sessionId,
    user: user._id,
    tokenHash: await hashToken(refreshToken),
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_MS),
  });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return sessionId;
};
