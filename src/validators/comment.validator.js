import { z } from "zod";
import { sanitizedString } from "../utils/sanitize.js";

export const addCommentSchema = z.object({
  content: sanitizedString({
    requiredError: "Content is required",
    min: 1,
    minError: "Content cannot be empty",
    max: 1000,
    maxError: "Content cannot exceed 1000 characters",
  }),
});

export const updateCommentSchema = z.object({
  content: sanitizedString({
    requiredError: "Content is required",
    min: 1,
    minError: "Content cannot be empty",
    max: 1000,
    maxError: "Content cannot exceed 1000 characters",
  }),
});
