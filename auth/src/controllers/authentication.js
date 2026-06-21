import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import env from "../config/env.js";
import User from "../models/user.model.js";
import SessionModel from "../models/session.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  signAccessToken,
  issueRefreshSession,
  compareToken,
  refreshCookieOptions,
} from "../services/token.service.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "Username or email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  await issueRefreshSession(newUser, req, res);
  const accessToken = signAccessToken(newUser._id);

  return res.status(201).json({
    message: "User registered successfully",
    token: accessToken,
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // password has `select: false` in the schema, so it must be opted back in.
  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  await issueRefreshSession(user, req, res);
  const accessToken = signAccessToken(user._id);

  return res.status(200).json({
    message: "Login successful",
    token: accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ user });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (error) {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const session = await SessionModel.findOne({
    _id: decoded.sid,
    user: decoded.id,
    revoked: false,
  });

  if (!session || !(await compareToken(token, session.tokenHash))) {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  // Rotate: invalidate the used session and issue a fresh one.
  session.revoked = true;
  await session.save();

  await issueRefreshSession(user, req, res);
  const accessToken = signAccessToken(user._id);

  return res.status(200).json({ token: accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  res.clearCookie("refreshToken", refreshCookieOptions);

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
      await SessionModel.updateOne(
        { _id: decoded.sid, user: decoded.id },
        { revoked: true },
      );
    } catch (error) {
      // Invalid/expired token — cookie is already cleared, so logout still succeeds.
    }
  }

  return res.status(200).json({ message: "Logged out" });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  res.clearCookie("refreshToken", refreshCookieOptions);

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
      await SessionModel.updateMany({ user: decoded.id }, { revoked: true });
    } catch (error) {
      // Invalid/expired token — cookie is already cleared, so logout still succeeds.
    }
  }

  return res.status(200).json({ message: "Logged out from all sessions" });
});
