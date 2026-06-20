import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import SessionModel from "../models/session.model.js";
import {
  signAccessToken,
  issueRefreshSession,
  tokenMatchesHash,
  refreshCookieOptions,
} from "../utils/auth.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Must validate the raw password here: the schema's minlength only ever
    // sees the bcrypt hash (always 60 chars), so it can't enforce length.
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

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
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ message });
    }

    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  try {
    const session = await SessionModel.findOne({
      _id: decoded.sid,
      user: decoded.id,
      revoked: false,
    });

    if (!session || !tokenMatchesHash(token, session.tokenHash)) {
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
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  // Logout is idempotent: always clear the cookie.
  res.clearCookie("refreshToken", refreshCookieOptions);

  if (!token) {
    return res.status(200).json({ message: "Logged out" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    // Revoke the session so this refresh token can never be used again.
    await SessionModel.updateOne(
      { _id: decoded.sid, user: decoded.id },
      { revoked: true },
    );
  } catch (error) {
    // Token already invalid/expired — nothing to revoke; cookie is cleared.
  }

  return res.status(200).json({ message: "Logged out" });
};
