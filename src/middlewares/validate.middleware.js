import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { cleanupRequestFiles } from "../utils/fileCleanup.js";

const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (err) {
    await cleanupRequestFiles(req);
    if (err instanceof z.ZodError) {
      const errorMessages = err.issues.map((e) => e.message).join(", ");
      next(new ApiError(400, `Validation Failed: ${errorMessages}`));
    } else {
      next(err);
    }
  }
};

export const validateMiddleware = validate;
