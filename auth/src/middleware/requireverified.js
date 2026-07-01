export function requireVerified(req, res, next) {
  if (!req.user?.isEmailVerified) {
    return res
      .status(403)
      .json({ error: "Please verify your email to continue." });
  }
  next();
}
