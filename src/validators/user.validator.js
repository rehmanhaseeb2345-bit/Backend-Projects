import { z } from "zod";

export const registerUserSchema = z.object({
  fullname: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name cannot exceed 50 characters"),

  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address format"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password cannot exceed 64 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain at least one number and one special character (!@#$%^&*)",
    ),
});

export const loginUserSchema = z
  .object({
    username: z.string().trim().toLowerCase().optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address format")
      .optional(),

    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password cannot be empty"),
  })
  .refine((data) => data.username || data.email, {
    message: "Please provide either a valid username or email address",
    path: ["email"],
  });

export const changeCurrentPasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: "Old password is required" })
      .min(1, "Old password cannot be empty"),

    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
        "Password must contain at least one number and one special character (!@#$%^&*)",
      ),

    confirmPassword: z.string({
      required_error: "Confirm password is required",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateAccountDetailsSchema = z.object({
  fullname: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name cannot exceed 50 characters"),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address format"),
});
