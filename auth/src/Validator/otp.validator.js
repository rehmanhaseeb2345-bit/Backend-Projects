import { z } from "zod";

export const verifyOtpSchema = z.object({
  body: z.object({
    code: z.string().regex(/^\d{6}$/, "Code must be 6 digits."),
  }),
});
