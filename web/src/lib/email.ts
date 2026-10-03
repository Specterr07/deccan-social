import { env } from "@/env";

// The only module that talks to Resend (https://resend.com/docs/api-reference/emails/send-email).
export type EmailMessage = { to: string; subject: string; html: string; text: string };

// Sends one email. Throws a readable error; callers decide whether a failed email matters.
export async function sendEmail(message: EmailMessage): Promise<{ id: string }> {
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
    });
  } catch (error) {
    // The network dropped or Resend is unreachable.
    throw new Error(`Could not reach the email service: ${(error as Error).message}`);
  }

  const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok || !body.id) {
    // Typical causes: a wrong API key (401), a sender domain that is not verified yet, or (on Resend's test sender)
    // an address other than the one the Resend account was created with (403).
    throw new Error(`The email service refused the message (HTTP ${response.status}): ${body.message ?? "no details"}`);
  }
  return { id: body.id };
}
