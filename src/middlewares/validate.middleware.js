import { ApiError } from "../utils/ApiError.js";

const validate = (schema) => async (req, res, next) => {
  try {
    // Parse the request body against the provided Zod schema
    const parseBody = await schema.parseAsync(req.body);

    // Replace req.body with the sanitized/parsed data from Zod
    req.body = parseBody;
    next();
  } catch (err) {
    // If Zod fails, extract the error messages
    const errorMessages = err.errors.map((e) => e.message).join(", ");

    // Pass the error to your global error handler
    next(new ApiError(400, `Validation Failed: ${errorMessages}`));
  }
};

export const validateMiddleware = validate;
