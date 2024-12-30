import {SESClient, SendEmailCommand} from "@aws-sdk/client-ses";
import axios from "axios";

const ses = new SESClient({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  },
});

export const handler = async (event, context) => {
  console.log("Function invoked with event:", JSON.stringify(event));

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message:
          "Contact function is working. Please use POST for actual contact submission.",
      }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({message: "Method Not Allowed"}),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing request body:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Invalid request body"}),
    };
  }

  const {name, email, message, recaptchaToken} = body;

  if (!name || !email || !message || !recaptchaToken) {
    console.error("Missing required fields:", {
      name,
      email,
      message,
      recaptchaToken,
    });
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Missing required fields"}),
    };
  }

  console.log("Form data received:", {name, email, message});

  // Verify reCAPTCHA token
  try {
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA}&response=${recaptchaToken}`
    );

    console.log("reCAPTCHA response:", recaptchaResponse.data);

    if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
      console.log("reCAPTCHA verification failed");
      return {
        statusCode: 400,
        body: JSON.stringify({message: "reCAPTCHA verification failed"}),
      };
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({message: "Error verifying reCAPTCHA"}),
    };
  }

  const params = {
    Destination: {
      ToAddresses: [process.env.RECIPIENT_EMAIL],
    },
    Message: {
      Body: {
        Text: {Data: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`},
      },
      Subject: {Data: "New Contact Form Submission"},
    },
    Source: `"Badger 3000" <${process.env.SENDER_EMAIL}>`,
  };

  console.log("Attempting to send email with params:", JSON.stringify(params));

  try {
    const sendResult = await ses.send(new SendEmailCommand(params));
    console.log("Email sent successfully:", sendResult);

    // Send confirmation email to the user
    const confirmationParams = {
      Destination: {ToAddresses: [email]},
      Message: {
        Body: {
          Html: {
            Data: `
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 0.8em; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h2>Thank You for Contacting Us</h2>
                    </div>
                    <div class="content">
                      <p>Dear ${name},</p>
                      <p>Thank you for reaching out to us. We have received your message and appreciate your interest.</p>
                      <p>Our team will review your inquiry and get back to you as soon as possible.</p>
                      <p>Best regards,<br>Mad Badger Studios</p>
                    </div>
                    <div class="footer">
                      <p>© ${new Date().getFullYear()} Badger3000. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          },
          Text: {
            Data: `Dear ${name},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nBest regards,\nMad Badger Studios`,
          },
        },
        Subject: {Data: "Thank you for your message to Badger3000"},
      },
      Source: `"Mad Badger Studios LLC" <${process.env.SENDER_EMAIL}>`,
      ReplyToAddresses: [process.env.SENDER_EMAIL],
    };

    console.log(
      "Attempting to send confirmation email with params:",
      JSON.stringify(confirmationParams)
    );

    const confirmationResult = await ses.send(
      new SendEmailCommand(confirmationParams)
    );
    console.log("Confirmation email sent successfully:", confirmationResult);

    return {
      statusCode: 200,
      body: JSON.stringify({message: "Emails sent successfully"}),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error sending email",
        error: error.toString(),
      }),
    };
  }
};
