import { z } from "zod";
import { sanitizedString } from "../utils/sanitize.js";

export const createTweetSchema = z.object({
  content: sanitizedString({
    requiredError: "Content is required",
    min: 1,
    minError: "Content cannot be empty",
    max: 280,
    maxError: "Content cannot exceed 280 characters",
  }),
});

export const updateTweetSchema = z.object({
  content: sanitizedString({
    requiredError: "Content is required",
    min: 1,
    minError: "Content cannot be empty",
    max: 280,
    maxError: "Content cannot exceed 280 characters",
  }),
});
