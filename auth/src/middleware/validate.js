// Generic zod validator. Pass a schema shaped like
// z.object({ body: ..., params: ..., query: ... }) and it validates the
// matching parts of the request, returning 400 with joined messages on failure.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ message });
  }

  next();
};

// Lightweight body validation. Keeps the presence/length checks out of the
// controllers so they only deal with business logic.

export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body ?? {};

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // The schema's minlength only ever sees the bcrypt hash (always 60 chars),
  // so the raw-password length must be enforced here.
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { username, email, password } = req.body ?? {};

  if ((!username && !email) || !password) {
    return res
      .status(400)
      .json({ message: "Username or email and password are required" });
  }

  next();
};
