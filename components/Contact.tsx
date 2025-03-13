"use client";

import {useState, FormEvent, ChangeEvent} from "react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

// Define form data interface
interface FormData {
  name: string;
  email: string;
  message: string;
}

// Define submit status type with more specific error states
type SubmitStatus =
  | "success"
  | "error"
  | "recaptcha-failed"
  | "suspicious-activity"
  | null;

// Inner component that uses the reCAPTCHA hook
function ContactForm() {
  // Get executeRecaptcha function from the hook
  const {executeRecaptcha} = useGoogleReCaptcha();

  // State for form fields with proper typing
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  // State for form submission with proper typing
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  // Handle form input changes with proper event typing
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission with proper event typing
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Check if executeRecaptcha is available
    if (!executeRecaptcha) {
      console.error("reCAPTCHA has not been loaded");
      setSubmitStatus("recaptcha-failed");
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA with action name
      const recaptchaToken = await executeRecaptcha("contact_form_submit");

      // Send data to our API route with the token
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check for specific error codes from the API
        if (result.errorCode === "recaptcha-failed") {
          setSubmitStatus("recaptcha-failed");
        } else if (result.errorCode === "suspicious-activity") {
          setSubmitStatus("suspicious-activity");
        } else {
          setSubmitStatus("error");
        }
        throw new Error(
          result.message || result.error || "Network response was not ok"
        );
      }

      // Handle success
      setSubmitStatus("success");
      setFormData({name: "", email: "", message: ""});
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Only set generic error if not already set to a specific error
      if (
        submitStatus !== "recaptcha-failed" &&
        submitStatus !== "suspicious-activity"
      ) {
        setSubmitStatus("error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact">
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Let's Connect
      </h2>
      <div className="p-5 rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-800/[0.65]">
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="flex bg-white dark:bg-gray-900 p-2 rounded-lg focus-within:ring-2 ring-gray-300 dark:ring-gray-600 mb-4">
            <input
              className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 border-none focus:ring-0 focus:outline-none"
              type="text"
              name="name"
              aria-label="Your name"
              placeholder="Your name..."
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div className="flex bg-white dark:bg-gray-900 p-2 rounded-lg focus-within:ring-2 ring-gray-300 dark:ring-gray-600 mb-4">
            <input
              className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 border-none focus:ring-0 focus:outline-none"
              type="email"
              name="email"
              aria-label="Your email address"
              placeholder="Your email..."
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Message Field */}
          <div className="flex bg-white dark:bg-gray-900 p-2 rounded-lg focus-within:ring-2 ring-gray-300 dark:ring-gray-600 mb-4">
            <textarea
              className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 border-none focus:ring-0 focus:outline-none min-h-[100px] resize-y"
              name="message"
              aria-label="Your message"
              placeholder="Your message..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Success message */}
          {submitStatus === "success" && (
            <div className="text-sm mb-4 p-2 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Thank you for your message! We've sent you a confirmation email
              and will get back to you soon.
            </div>
          )}

          {/* Generic error message */}
          {submitStatus === "error" && (
            <div className="text-sm mb-4 p-2 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              There was a problem submitting your form. Please try again.
            </div>
          )}

          {/* reCAPTCHA failed message */}
          {submitStatus === "recaptcha-failed" && (
            <div className="text-sm mb-4 p-2 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              We couldn't verify that you're a human. Please try refreshing the
              page and submitting again.
            </div>
          )}

          {/* Suspicious activity message */}
          {submitStatus === "suspicious-activity" && (
            <div className="text-sm mb-4 p-2 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              For security reasons, we couldn't process your submission at this
              time. Please try again later or contact us through another method.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-sm text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}

// Wrapper component that provides the reCAPTCHA context
export default function Contact() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <ContactForm />
    </GoogleReCaptchaProvider>
  );
}
