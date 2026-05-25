import { z } from "zod";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

const cleanupRequestFiles = (req) => {
  if (!req.files) return Promise.resolve();
  return Promise.all(
    Object.values(req.files)
      .flat()
      .map((file) => fs.promises.unlink(file.path).catch(() => {})),
  );
};

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
