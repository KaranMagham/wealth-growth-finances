import nodemailer from "nodemailer";

interface PasswordResetEmailOptions {
  user: {
    email: string;
    name?: string | null;
  };
  url: string;
}

export async function sendPasswordResetEmail({ user, url }: PasswordResetEmailOptions) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM || smtpUser || "no-reply@wealth-growth-finance.com";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error("[auth] SMTP email credentials are not configured; password reset email was not sent.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const displayName = user.name?.trim() || user.email.split("@")[0];

  await transporter.sendMail({
    from: fromAddress,
    to: user.email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color: #0f766e;">Password reset request</h2>
        <p>Hello ${displayName},</p>
        <p>We received a request to reset your password for Wealth Growth Finance.</p>
        <p>
          <a href="${url}" style="display: inline-block; padding: 10px 16px; background-color: #10b981; color: white; text-decoration: none; border-radius: 999px;">
            Reset your password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Thanks,<br />Wealth Growth Finance</p>
      </div>
    `,
    text: `Hello ${displayName},\n\nWe received a request to reset your password for Wealth Growth Finance.\nUse this link to continue: ${url}\n\nIf you didn't request this, you can safely ignore this email.\n\nThanks,\nWealth Growth Finance`,
  });
}
