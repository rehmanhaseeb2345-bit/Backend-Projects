// Wraps an async route handler so any thrown error / rejected promise is
// forwarded to the central error handler instead of being repeated in a
// try/catch inside every controller.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
