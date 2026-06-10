import { z } from "zod";
import { sanitizedString } from "../utils/sanitize.js";

export const createPlaylistSchema = z.object({
  name: sanitizedString({
    requiredError: "Name is required",
    min: 1,
    minError: "Name cannot be empty",
    max: 100,
    maxError: "Name cannot exceed 100 characters",
  }),

  description: sanitizedString({
    min: 0,
    minError: "",
    max: 500,
    maxError: "Description cannot exceed 500 characters",
  }).optional(),
});

export const updatePlaylistSchema = z.object({
  name: sanitizedString({
    min: 1,
    minError: "Name cannot be empty",
    max: 100,
    maxError: "Name cannot exceed 100 characters",
  }).optional(),

  description: sanitizedString({
    min: 0,
    minError: "",
    max: 500,
    maxError: "Description cannot exceed 500 characters",
  }).optional(),
});
