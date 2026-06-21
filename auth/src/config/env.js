import dotenv from "dotenv";
import ms from "ms";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

// Single source of truth: derive the refresh lifetime in ms (for the cookie
// maxAge and the session expiresAt) from the same string the JWT is signed with.
const refreshTtlMs = ms(REFRESH_TOKEN_TTL);
if (typeof refreshTtlMs !== "number") {
  console.error(`Invalid REFRESH_TOKEN_TTL value: "${REFRESH_TOKEN_TTL}"`);
  process.exit(1);
}

const env = Object.freeze({
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  REFRESH_TOKEN_TTL_MS: refreshTtlMs,
  isProduction: process.env.NODE_ENV === "production",
});

export default env;
