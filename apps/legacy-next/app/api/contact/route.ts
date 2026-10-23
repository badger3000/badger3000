import {NextRequest, NextResponse} from "next/server";
import {Resend} from "resend";

// Must match the action passed to executeRecaptcha in components/Contact.tsx
const RECAPTCHA_ACTION = "contact_form_submit";

const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Escape user input before interpolating it into HTML emails
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  // Check configuration up front so a missing env var shows up clearly in the logs
  const resendApiKey = process.env.RESEND_API_KEY;
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  const missing = [
    !resendApiKey && "RESEND_API_KEY",
    !recaptchaSecret && "RECAPTCHA_SECRET_KEY",
    !ownerEmail && "OWNER_EMAIL",
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error(
      `Contact form misconfigured, missing env vars: ${missing.join(", ")}`
    );
    return NextResponse.json(
      {error: "Contact form is not configured", errorCode: "config"},
      {status: 500}
    );
  }

  // The resend.dev fallback can only deliver to the Resend account's own address,
  // so the auto-reply to visitors will fail without a verified-domain sender.
  const fromAddress = process.env.CONTACT_FORM_EMAIL;
  if (!fromAddress) {
    console.warn(
      "CONTACT_FORM_EMAIL is not set; falling back to onboarding@resend.dev"
    );
  }
  const ownerFrom = fromAddress || "Contact Form <onboarding@resend.dev>";
  const replyFrom =
    fromAddress || "Kyle Ross | Badger3000 <onboarding@resend.dev>";

  try {
    // Parse the form data from the request
    const formData = await req.json();
    const name = String(formData.name ?? "").trim();
    const email = String(formData.email ?? "").trim();
    const message = String(formData.message ?? "").trim();
    const {recaptchaToken} = formData;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        {error: "Name, email and message are required"},
        {status: 400}
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        {error: "Please provide a valid email address"},
        {status: 400}
      );
    }

    if (name.length > MAX_NAME_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {error: "Name or message is too long"},
        {status: 400}
      );
    }

    // Validate reCAPTCHA token
    if (!recaptchaToken || typeof recaptchaToken !== "string") {
      return NextResponse.json(
        {
          error: "reCAPTCHA verification failed",
          errorCode: "recaptcha-failed",
        },
        {status: 400}
      );
    }

    // Verify reCAPTCHA token with Google
    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret: recaptchaSecret!,
          response: recaptchaToken,
        }),
      }
    );

    const recaptchaResult = await recaptchaResponse.json();

    // Check if reCAPTCHA verification was successful
    if (
      !recaptchaResult.success ||
      recaptchaResult.action !== RECAPTCHA_ACTION
    ) {
      console.error("reCAPTCHA verification failed:", {
        success: recaptchaResult.success,
        action: recaptchaResult.action,
        hostname: recaptchaResult.hostname,
        errorCodes: recaptchaResult["error-codes"],
      });
      return NextResponse.json(
        {
          error: "reCAPTCHA verification failed",
          errorCode: "recaptcha-failed",
          message:
            "We couldn't verify that you're a human. Please try refreshing the page and submitting again.",
        },
        {status: 400}
      );
    }

    // Check the score (for v3) - adjust threshold via RECAPTCHA_MIN_SCORE
    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE) || 0.5;
    if (recaptchaResult.score < minScore) {
      console.error("reCAPTCHA score below threshold:", {
        score: recaptchaResult.score,
        minScore,
        hostname: recaptchaResult.hostname,
      });
      return NextResponse.json(
        {
          error: "Suspicious activity detected",
          errorCode: "suspicious-activity",
          message:
            "For security reasons, we couldn't process your submission at this time. Please try again later or contact us through another method.",
        },
        {status: 400}
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    const resend = new Resend(resendApiKey);

    // Send email to yourself (the site owner)
    const {error: ownerEmailError} = await resend.emails.send({
      from: ownerFrom,
      to: ownerEmail!,
      replyTo: email,
      subject: `New contact form submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message:
${message}
reCAPTCHA Score: ${recaptchaResult.score}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
<p><strong>Message:</strong></p>
<p>${safeMessage}</p>
<p><strong>reCAPTCHA Score:</strong> ${recaptchaResult.score}</p>
      `,
    });

    if (ownerEmailError) {
      console.error("Resend error sending email to owner:", ownerEmailError);
      return NextResponse.json(
        {error: "Failed to send email to site owner"},
        {status: 500}
      );
    }

    // Send auto-reply to the submitter
    const {error: autoReplyError} = await resend.emails.send({
      from: replyFrom,
      to: email,
      subject: "Thank you for your message",
      text: `
Dear ${name},

Thank you for contacting me. I have received your message and will get back to you as soon as possible.

Best regards,
Kyle Ross
      `,
      html: `
<h2>Thank you for your message</h2>
<p>Dear ${safeName},</p>
<p>Thank you for contacting me. I have received your message and will get back to you as soon as possible.</p>
<p>Best regards,<br>Kyle Ross</p>
      `,
    });

    if (autoReplyError) {
      // Soft error: the owner email was already sent
      console.error("Resend error sending auto-reply:", autoReplyError);
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Contact form server error:", error);
    return NextResponse.json(
      {error: "Failed to process your request"},
      {status: 500}
    );
  }
}
