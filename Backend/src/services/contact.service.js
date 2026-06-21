import nodemailer from "nodemailer";

import { supabase } from "../config/supabase.js";

let transporter;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`${name} is required to send contact emails.`);
  }

  return value.trim();
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = getRequiredEnv("SMTP_HOST");
  const port = Number.parseInt(getRequiredEnv("SMTP_PORT"), 10);
  const user = getRequiredEnv("SMTP_USER");
  const pass = getRequiredEnv("SMTP_PASS");
  const secure = process.env.SMTP_SECURE === "true";

  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT must be a valid number.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

async function getBusinessEmail() {
  const { data: settings, error } = await supabase
    .from("settings")
    .select("email")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const businessEmail = settings?.email?.trim();

  if (!businessEmail) {
    throw new Error("Business email is not configured in settings.");
  }

  return businessEmail;
}

export async function sendContactEmail({ email, message, name }) {
  const businessEmail = await getBusinessEmail();
  const mailer = getTransporter();

  const submittedAt = new Date();
  const submittedAtLabel = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(submittedAt);

  const fromAddress = process.env.SMTP_FROM_EMAIL?.trim() || getRequiredEnv("SMTP_USER");
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "Meika Doll Shop Website";
  const replyTo = email;

  const subject = "New Contact Form Submission - Meika Doll Shop";

  const text = [
    "You received a new message from the Meika Doll Shop contact form.",
    "",
    `Customer Name: ${name}`,
    `Customer Email: ${email}`,
    `Submission Time: ${submittedAtLabel}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #2f241f; line-height: 1.7;">
      <h2 style="margin-bottom: 16px;">New Contact Form Submission - Meika Doll Shop</h2>
      <p><strong>Customer Name:</strong> ${name}</p>
      <p><strong>Customer Email:</strong> ${email}</p>
      <p><strong>Submission Time:</strong> ${submittedAtLabel}</p>
      <div style="margin-top: 20px;">
        <p style="margin-bottom: 8px;"><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; padding: 16px; border-radius: 12px; background: #fff7f1; border: 1px solid #eadfd6;">
          ${message}
        </div>
      </div>
    </div>
  `;

  const info = await mailer.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: businessEmail,
    replyTo,
    subject,
    text,
    html,
  });

  return {
    businessEmail,
    messageId: info.messageId,
  };
}
