// Note: the env var is expressed in MINUTES; OTP_TTL_MS is the derived value in ms.
export const OTP_TTL_MS = Number(process.env.OTP_TTL_MINUTES ?? 10) * 60 * 1000;

export const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);

export const OTP_RESEND_COOLDOWN_MS =
  Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60) * 1000;

export const BCRYPT_ROUNDS = 12;
