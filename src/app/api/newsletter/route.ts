import { NextResponse } from "next/server";

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
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim()
    || request.headers.get("host");

  if (!origin || !host) {
    return json("This request could not be verified. Please refresh the page and try again.", 403);
  }

  try {
    if (new URL(origin).host !== host) {
      return json("This request could not be verified. Please refresh the page and try again.", 403);
    }
  } catch {
    return json("This request could not be verified. Please refresh the page and try again.", 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 8192) return json("The request is too large.", 413);

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientKey = forwardedFor?.split(",").at(-1)?.trim() || "unknown-client";
  if (isRateLimited(clientKey)) {
    return json("Too many attempts. Please wait a little before trying again.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json("Please submit a valid form.", 400);
  }

  if (!body || typeof body !== "object") return json("Please submit a valid form.", 400);

  const data = body as { email?: unknown; consent?: unknown; companyWebsite?: unknown };

  // Silently accept bot submissions without forwarding them to the mailing provider.
  if (typeof data.companyWebsite === "string" && data.companyWebsite.trim() !== "") {
    return json("If the address can be subscribed, you’ll receive an email with the next step.", 200);
  }

  if (typeof data.email !== "string" || data.email.length > 254) {
    return json("Please enter a valid email address.", 400);
  }

  const email = data.email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) return json("Please enter a valid email address.", 400);
  if (data.consent !== true) return json("Please confirm that you agree to receive email updates.", 400);

  const provider = process.env.NEWSLETTER_PROVIDER?.toLowerCase();
  const apiKey = process.env.NEWSLETTER_API_KEY;
  const audienceId = process.env.NEWSLETTER_AUDIENCE_ID;
  const dataCenter = apiKey?.match(/-([a-z]{2}\d+)$/i)?.[1]?.toLowerCase();

  if (provider !== "mailchimp" || !apiKey || !audienceId || !dataCenter) {
    return json("Newsletter signup is not configured yet. Please try again later.", 503);
  }

  try {
    const response = await fetch(
      `https://${dataCenter}.api.mailchimp.com/3.0/lists/${encodeURIComponent(audienceId)}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`diamond-black:${apiKey}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_address: email, status: "pending" }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      },
    );

    if (response.ok) {
      return json("Thank you. Please check your inbox and confirm your subscription to complete signup.", 200);
    }

    const providerError = await response.json().catch(() => ({})) as { title?: string; detail?: string };
    if (response.status === 400 && /member exists|already a member/i.test(providerError.title ?? "")) {
      // Avoid disclosing whether an email address is already in the audience.
      return json("If this address can be subscribed, you’ll receive an email with the next step.", 200);
    }

    // Never return provider responses or credentials to the browser.
    return json("We couldn’t complete signup right now. Please try again later.", 502);
  } catch {
    return json("The newsletter service is temporarily unavailable. Please try again later.", 502);
  }
}
