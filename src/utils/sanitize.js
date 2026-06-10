import sanitizeHtml from "sanitize-html";
import { z } from "zod";

// Strips all HTML tags/attributes from user-supplied text, leaving plain
// text only. Used to prevent stored-XSS via comments, tweets, titles, etc.
export const sanitizeText = (value) =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

// A trimmed, HTML-stripped string with length bounds enforced *after*
// sanitization (so e.g. "<b></b>" can't sneak past a min-length check as
// non-empty and then become empty once sanitized).
export const sanitizedString = ({
  requiredError,
  min,
  minError,
  max,
  maxError,
} = {}) =>
  z
    .string({ required_error: requiredError })
    .trim()
    .transform(sanitizeText)
    .pipe(z.string().min(min, minError).max(max, maxError));
