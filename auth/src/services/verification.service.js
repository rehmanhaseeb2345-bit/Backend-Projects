import crypto from "node:crypto";
import bcrypt from "bcrypt";

import User from "../models/user.model.js";
import Verification from "../models/verification.model.js";
import { sendVerificationEmail } from "./email.service.js";
import {
  OTP_TTL_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  BCRYPT_ROUNDS,
} from "../config/otp.js";

// Small helper so the central errorHandler can map these to their HTTP status.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Six-digit code, 100000–999999 inclusive.
function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

// Generates a fresh OTP for the user, stores only its hash (one active code
// per user via upsert), and emails the plaintext code.
export async function requestEmailVerification(user) {
  if (user.isEmailVerified) {
    throw httpError(400, "Email is already verified");
  }

  const existing = await Verification.findOne({ userId: user._id });
  if (
    existing &&
    Date.now() - existing.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
  ) {
    throw httpError(429, "Please wait before requesting another code.");
  }

  const code = generateOTP();
  const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);

  await Verification.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      codeHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      lastSentAt: new Date(),
    },
    { upsert: true, new: true },
  );

  await sendVerificationEmail(user.email, code);
}

export async function verifyEmailCode(userId, submittedCode) {
  const record = await Verification.findOne({ userId });

  // No code, or it has expired.
  if (!record || record.expiresAt < new Date()) {
    throw httpError(
      400,
      "Code expired or not found. Please request a new one.",
    );
  }

  // Too many wrong tries: burn the code, force a fresh request.
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await Verification.deleteOne({ _id: record._id });
    throw httpError(
      429,
      "Too many incorrect attempts. Please request a new code.",
    );
  }

  const matches = await bcrypt.compare(submittedCode, record.codeHash);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    throw httpError(400, "Incorrect code.");
  }

  // Success: flip the flag and delete the code so it can't be reused.
  await User.updateOne({ _id: userId }, { isEmailVerified: true });
  await Verification.deleteOne({ _id: record._id });
}
