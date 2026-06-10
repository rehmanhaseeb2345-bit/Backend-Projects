import { z } from "zod";
import { sanitizedString } from "../utils/sanitize.js";

export const publishVideoSchema = z.object({
  title: sanitizedString({
    requiredError: "Title is required",
    min: 3,
    minError: "Title must be at least 3 characters",
    max: 100,
    maxError: "Title cannot exceed 100 characters",
  }),

  description: sanitizedString({
    requiredError: "Description is required",
    min: 1,
    minError: "Description is required",
    max: 5000,
    maxError: "Description cannot exceed 5000 characters",
  }),
});

export const updateVideoSchema = z.object({
  title: sanitizedString({
    min: 3,
    minError: "Title must be at least 3 characters",
    max: 100,
    maxError: "Title cannot exceed 100 characters",
  }).optional(),

  description: sanitizedString({
    min: 1,
    minError: "Description is required",
    max: 5000,
    maxError: "Description cannot exceed 5000 characters",
  }).optional(),
});
