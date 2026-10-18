import { ENV } from "varlock/env";

type Email = { from: string; to: string; subject: string; text: string };

// Sends through Resend's HTTPS API (port 443). SMTP ports are blocked on
// DigitalOcean droplets, which made the old nodemailer transport hang.
export async function sendEmail(email: Email): Promise<void> {
  if (!ENV.RESEND_API_KEY) {
    if (ENV.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    // Local dev: no key, so print the email (including the login/share link).
    console.log("[dev email]", email);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }

  const { id } = (await res.json()) as { id: string };
  console.log("Email sent via Resend:", id);
}
