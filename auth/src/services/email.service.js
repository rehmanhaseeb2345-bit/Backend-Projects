import { Resend } from "resend";
import env from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(to, code) {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Email Verification",
    html: `<p>Your verification code is <strong>${code}</strong>.</p>
<p>It expires in 10 minutes. If you did not request this, ignore this email.</p>`,
  });

  if (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email", { cause: error });
  }
}
