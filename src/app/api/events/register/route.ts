
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function json(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function isRateLimited(key: string) {
  const now = Date.now();

  for (const [storedKey, entry] of rateLimit) {
    if (entry.resetAt <= now) rateLimit.delete(storedKey);
  }

  const entry = rateLimit.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimit.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0].trim() ||
    request.headers.get("host");

  if (!origin || !host) {
    return json(
      "This request could not be verified. Please refresh the page and try again.",
      403,
    );
  }

  try {
    if (new URL(origin).host !== host) {
      return json(
        "This request could not be verified. Please refresh the page and try again.",
        403,
      );
    }
  } catch {
    return json(
      "This request could not be verified. Please refresh the page and try again.",
      403,
    );
  }

  const contentLength = Number(
    request.headers.get("content-length") ?? "0",
  );

  if (contentLength > 8192) {
    return json("The request is too large.", 413);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientKey =
    forwardedFor?.split(",").at(-1)?.trim() || "unknown-client";

  if (isRateLimited(clientKey)) {
    return json(
      "Too many attempts. Please wait a little before trying again.",
      429,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json("Please submit a valid form.", 400);
  }

  if (!body || typeof body !== "object") {
    return json("Please submit a valid form.", 400);
  }

  const data = body as Record<string, unknown>;

  // Silently accept bot submissions without sending email.
  if (normalizeText(data.companyWebsite, 200) !== "") {
    return json("Thank you. Your registration has been received.", 200);
  }

  const fullName = normalizeText(data.fullName, 120);
  const email = normalizeText(data.email, 254).toLowerCase();
  const phone = normalizeText(data.phone, 40);
  const company = normalizeText(data.company, 160);
  const guests = normalizeText(data.guests, 2);
  const consent = data.consent === true;

  if (!fullName || !email || !phone || !guests || !consent) {
    return json(
      "Please complete all required fields and accept the contact consent.",
      400,
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return json("Please enter a valid email address.", 400);
  }

  if (!["1", "2", "3", "4"].includes(guests)) {
    return json("Please select a valid number of attendees.", 400);
  }

  // Save the registration before attempting to send emails.
  let registration;

  try {
    registration = await prisma.eventRegistration.create({
      data: {
        fullName,
        email,
        phone,
        company: company || null,
        guests: Number(guests),
        consent,
      },
    });
  } catch (error) {
    console.error("Event registration database save failed:", error);

    return json(
      "We couldn't save your registration right now. Please try again later.",
      503,
    );
  }

  const mailHost = process.env.MAIL_HOST;
  const mailPort = Number(process.env.MAIL_PORT ?? "465");
  const mailUser = process.env.MAIL_USER;
  const mailPassword = process.env.MAIL_PASSWORD;
  const fromAddress = process.env.MAIL_FROM_ADDRESS || mailUser;
  const fromName =
    process.env.MAIL_FROM_NAME || "Diamond Black Corporation";
  const notificationEmail =
    process.env.EVENT_NOTIFICATION_EMAIL || mailUser;

  // Create an SMTP transport only when the configuration is complete.
  // Missing SMTP settings must not undo or block a saved registration.
  const smtp =
    mailHost &&
    mailUser &&
    mailPassword &&
    fromAddress &&
    notificationEmail
      ? nodemailer.createTransport({
          host: mailHost,
          port: mailPort,
          secure: mailPort === 465,
          auth: {
            user: mailUser,
            pass: mailPassword,
          },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
        })
      : null;

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeCompany = escapeHtml(company || "Not provided");
  const safeGuests = escapeHtml(guests);

  const participantHtml = `<!doctype html>
<html><body style="margin:0;background:#0a0a0a;color:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:40px 24px;">
    <h1 style="margin:0 0 8px;font-size:28px;">Diamond Black Corporation</h1>
    <p style="color:#c7a75b;font-weight:700;letter-spacing:1px;">100 PEOPLE · ONE NIGHT</p>
    <p>Dear ${safeName},</p>
    <p>Thank you for registering your interest in <strong>100 People. One Night.</strong></p>
    <p>We have received your registration details.</p>
    <div style="border:1px solid #444;padding:20px;margin:24px 0;">
      <p style="margin:0 0 8px;"><strong>Saturday, 14 November 2026</strong></p>
      <p style="margin:0 0 8px;">19H – 03H · Manila, Philippines</p>
      <p style="margin:0;">Attendees: ${safeGuests}</p>
    </div>
    <p>We look forward to welcoming you.</p>
    <p style="margin-top:32px;">Best regards,<br><strong>Diamond Black Corporation</strong><br>BUILD • INNOVATE • EXPAND</p>
  </div>
</body></html>`;

  const notificationHtml = `<!doctype html>
<html><body style="font-family:Arial,sans-serif;color:#222;">
  <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
    <h2>New Event Registration</h2>
    <p><strong>100 People. One Night.</strong> — 14 November 2026</p>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">
      <tr><td><strong>Full name</strong></td><td>${safeName}</td></tr>
      <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${safePhone}</td></tr>
      <tr><td><strong>Company</strong></td><td>${safeCompany}</td></tr>
      <tr><td><strong>Attendees</strong></td><td>${safeGuests}</td></tr>
    </table>
  </div>
</body></html>`;

  let confirmationEmail: "SENT" | "FAILED" = "FAILED";
  let notificationEmailStatus: "SENT" | "FAILED" = "FAILED";
  let emailError: string | null = null;

  if (smtp) {
    // Attempt the participant email independently.
    try {
      await smtp.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: email,
        replyTo: fromAddress,
        subject: "Registration received | 100 People. One Night.",
        html: participantHtml,
        text: `Dear ${fullName},

Thank you for registering for 100 People. One Night. We received your registration for Saturday, 14 November 2026, 19H–03H in Manila.

Diamond Black Corporation`,
      });

      confirmationEmail = "SENT";
    } catch (error) {
      console.error("Participant confirmation email failed:", error);
      emailError = "Participant confirmation email failed.";
    }

    // Attempt the admin notification even if the participant email fails.
    try {
      await smtp.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: notificationEmail,
        replyTo: email,
        subject: `New event registration | ${fullName}`,
        html: notificationHtml,
        text: `New event registration

Name: ${fullName}
Email: ${email}
Phone: ${phone}
Company: ${company || "Not provided"}
Attendees: ${guests}`,
      });

      notificationEmailStatus = "SENT";
    } catch (error) {
      console.error("Admin notification email failed:", error);
      emailError = emailError
        ? `${emailError} Admin notification email failed.`
        : "Admin notification email failed.";
    }
  } else {
    emailError = "SMTP configuration is incomplete.";
    console.error(
      "Event registration emails were not attempted because SMTP configuration is incomplete.",
    );
  }

  // Record email delivery outcomes without discarding the registration.
  try {
    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        confirmationEmail,
        notificationEmail: notificationEmailStatus,
        emailError,
      },
    });
  } catch (error) {
    console.error("Could not update registration email statuses:", error);
  }

  return json(
    confirmationEmail === "SENT" && notificationEmailStatus === "SENT"
      ? "Registration received. A confirmation email has been sent."
      : "Your registration has been received, but email delivery may be delayed.",
    200,
  );
}
