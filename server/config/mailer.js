import nodemailer from "nodemailer";

let transporter = null;

export function getMailer() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASS || "").replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error(
      "Email credentials missing. Check GMAIL_USER and GMAIL_APP_PASS",
    );
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}
