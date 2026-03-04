import { getMailer } from "../config/mailer.js";

export async function sendVerificationEmail({ to, code }) {
  const appName = process.env.APP_NAME || "CareFind"; // ✅ add this
  const mailer = getMailer();

  const subject = `${appName} verification code`;
  const text = `Your ${appName} verification code is: ${code}\n\nThis code expires in ${10} minutes.\nIf you didn’t request this, ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h3>${appName} Email Verification</h3>
      <p>Your verification code is:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">
        ${code}
      </div>
      <p>This code expires in <b>${process.env.OTP_EXP_MIN || 10} minutes</b>.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  await mailer.sendMail({
    from: `${appName} <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

export async function sendPasswordResetEmail({ to, code }) {
  const appName = process.env.APP_NAME || "CareFind";
  const mailer = getMailer();

  const subject = `${appName} password reset code`;
  const text = `Your ${appName} password reset code is: ${code}\n\nThis code expires in 10 minutes.\nIf you didn’t request this, ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5">
      <h3>${appName} Password Reset</h3>
      <p>Your password reset code is:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">
        ${code}
      </div>
      <p>This code expires in <b>${10} minutes</b>.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
  `;

  await mailer.sendMail({
    from: `${appName} <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
