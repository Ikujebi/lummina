// mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g., smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                     // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,     // your SMTP username
    pass: process.env.SMTP_PASS      // your SMTP password
  }
});

/**
 * Send an email.
 * @param to Recipient email
 * @param subject Email subject
 * @param text Plain text content
 * @param html Optional HTML content
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Email sending failed");
  }
}