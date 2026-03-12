import { getMailer } from "../config/mailer.js";

function buildOtpEmail({ appName, heading, eyebrow, intro, code, expiryMinutes }) {
  return `
    <div style="margin:0; padding:32px 16px; background-color:#f3f6fb; font-family:Arial, Helvetica, sans-serif; color:#10233f;">
      <div style="max-width:640px; margin:0 auto;">
        <div style="margin-bottom:16px; text-align:center;">
          <div style="display:inline-block; padding:10px 18px; border-radius:999px; background:linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%); color:#ffffff; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">
            ${appName}
          </div>
        </div>

        <div style="background-color:#ffffff; border:1px solid #d9e2f2; border-radius:24px; overflow:hidden; box-shadow:0 18px 50px rgba(15, 23, 42, 0.08);">
          <div style="padding:40px 36px 20px; background:linear-gradient(180deg, #eef6ff 0%, #ffffff 100%);">
            <div style="font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#2563eb; margin-bottom:14px;">
              ${eyebrow}
            </div>
            <h1 style="margin:0 0 12px; font-size:30px; line-height:1.2; color:#0f172a;">
              ${heading}
            </h1>
            <p style="margin:0; font-size:16px; line-height:1.7; color:#475569;">
              ${intro}
            </p>
          </div>

          <div style="padding:12px 36px 36px;">
            <div style="padding:28px; border-radius:20px; background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); text-align:center;">
              <div style="margin-bottom:10px; font-size:12px; line-height:1; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.72);">
                One-time code
              </div>
              <div style="font-size:34px; line-height:1; font-weight:700; letter-spacing:0.3em; color:#ffffff; text-indent:0.3em;">
                ${code}
              </div>
            </div>

            <div style="margin-top:24px; padding:20px 22px; border:1px solid #dbeafe; border-radius:18px; background-color:#f8fbff;">
              <p style="margin:0 0 10px; font-size:14px; line-height:1.6; color:#334155;">
                This code expires in <strong>${expiryMinutes} minutes</strong>.
              </p>
              <p style="margin:0; font-size:14px; line-height:1.6; color:#64748b;">
                If you did not request this email, you can safely ignore it.
              </p>
            </div>

            <p style="margin:24px 0 0; font-size:13px; line-height:1.7; color:#64748b; text-align:center;">
              For security, never share this code with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function sendVerificationEmail({ to, code }) {
  const appName = process.env.APP_NAME || "CareFind";
  const expiryMinutes = process.env.OTP_EXP_MIN || 10;
  const mailer = getMailer();

  const subject = `${appName} verification code`;
  const text = `Verify your ${appName} email address\n\nYour verification code is: ${code}\nThis code expires in ${expiryMinutes} minutes.\nIf you didn't request this, ignore this email.`;

  const html = buildOtpEmail({
    appName,
    heading: "Confirm your email address",
    eyebrow: "Email verification",
    intro:
      "Use the code below to verify your account and continue setting up your CareFind access.",
    code,
    expiryMinutes,
  });

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
  const expiryMinutes = process.env.OTP_EXP_MIN || 10;
  const mailer = getMailer();

  const subject = `${appName} password reset code`;
  const text = `Reset your ${appName} password\n\nYour password reset code is: ${code}\nThis code expires in ${expiryMinutes} minutes.\nIf you didn't request this, ignore this email.`;

  const html = buildOtpEmail({
    appName,
    heading: "Reset your password",
    eyebrow: "Password recovery",
    intro:
      "Enter this code in the app to confirm your identity and choose a new password.",
    code,
    expiryMinutes,
  });

  await mailer.sendMail({
    from: `${appName} <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
