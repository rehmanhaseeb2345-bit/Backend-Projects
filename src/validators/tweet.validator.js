import { z } from "zod";

export const createTweetSchema = z.object({
  content: z
    .string({ required_error: "Content is required" })
    .trim()
    .min(1, "Content cannot be empty")
    .max(280, "Content cannot exceed 280 characters"),
});

export const updateTweetSchema = z.object({
  content: z
    .string({ required_error: "Content is required" })
    .trim()
    .min(1, "Content cannot be empty")
    .max(280, "Content cannot exceed 280 characters"),
});
