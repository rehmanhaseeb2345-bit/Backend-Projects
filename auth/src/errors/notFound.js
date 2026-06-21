// 404 handler for unmatched routes. Registered after all routes and just
// before the error handler in app.js.
export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};
