import {NextRequest, NextResponse} from "next/server";
import {Resend} from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Your email address (where you want to receive submissions)
const OWNER_EMAIL = process.env.OWNER_EMAIL || "your-email@example.com";

export async function POST(req: NextRequest) {
  try {
    // Parse the form data from the request
    const formData = await req.json();
    const {name, email, message, recaptchaToken} = formData;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        {error: "Name, email and message are required"},
        {status: 400}
      );
    }

    // Validate reCAPTCHA token
    if (!recaptchaToken) {
      return NextResponse.json(
        {error: "reCAPTCHA verification failed"},
        {status: 400}
      );
    }

    // Verify reCAPTCHA token with Google
    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      }
    );

    const recaptchaResult = await recaptchaResponse.json();

    // Check if reCAPTCHA verification was successful
    if (!recaptchaResult.success) {
      return NextResponse.json(
        {error: "reCAPTCHA verification failed"},
        {status: 400}
      );
    }

    // Check the score (for v3) - adjust threshold as needed
    if (recaptchaResult.score < 0.5) {
      return NextResponse.json(
        {error: "Suspicious activity detected"},
        {status: 400}
      );
    }

    // Send email to yourself (the site owner)
    const {data: ownerEmailData, error: ownerEmailError} =
      await resend.emails.send({
        from:
          process.env.CONTACT_FORM_EMAIL ||
          "Contact Form <onboarding@resend.dev>", // Use your verified domain or default Resend domain
        to: OWNER_EMAIL,
        subject: `New contact form submission from ${name}`,
        text: `
Name: ${name}
Email: ${email}
Message:
${message}
reCAPTCHA Score: ${recaptchaResult.score}
      `,
        // You can also use HTML for nicer formatting
        html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, "<br>")}</p>
<p><strong>reCAPTCHA Score:</strong> ${recaptchaResult.score}</p>
      `,
      });

    if (ownerEmailError) {
      console.error("Error sending email to owner:", ownerEmailError);
      return NextResponse.json(
        {error: "Failed to send email to site owner"},
        {status: 500}
      );
    }

    // Send auto-reply to the submitter
    const {data: autoReplyData, error: autoReplyError} =
      await resend.emails.send({
        from:
          process.env.CONTACT_FORM_EMAIL ||
          "Kyle Ross | Badger3000 <onboarding@resend.dev>", // Use your verified domain or default Resend domain
        to: email,
        subject: "Thank you for your message",
        text: `
Dear ${name},

Thank you for contacting me. I have received your message and will get back to you as soon as possible.

Best regards,
Kyle Ross
      `,
        // You can also use HTML for nicer formatting
        html: `
<h2>Thank you for your message</h2>
<p>Dear ${name},</p>
<p>Thank you for contacting me. I have received your message and will get back to you as soon as possible.</p>
<p>Best regards,<br>Kyle Ross</p>
      `,
      });

    if (autoReplyError) {
      console.error("Error sending auto-reply:", autoReplyError);
      // We still consider this a "soft" error since the main email was sent
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {error: "Failed to process your request"},
      {status: 500}
    );
  }
}
