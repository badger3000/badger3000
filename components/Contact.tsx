"use client";

import {useState} from "react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    submitting: false,
    success: null as boolean | null,
    errorMessage: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({...formState, submitting: true});

    const form = e.target as HTMLFormElement;
    if (!form) {
      console.error("No form element found");
      return;
    }

    const formData = new FormData(form);

    try {
      // Convert FormData to a format that URLSearchParams can accept
      const formDataObj = Object.fromEntries(formData.entries());
      const params = new URLSearchParams(formDataObj as Record<string, string>);
      const response = await fetch("/", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: params.toString(),
      });

      if (response.ok) {
        // Reset the form
        setFormState({
          name: "",
          email: "",
          message: "",
          submitting: false,
          success: true,
          errorMessage: "",
        });
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error("Form error:", error);
      setFormState({
        ...formState,
        submitting: false,
        success: false,
        errorMessage:
          "There was a problem submitting your form. Please try again.",
      });
    }
  };

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Let's Connect
      </h2>
      <div className="p-5 rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-800/[0.65]">
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          {/* Hidden fields for Netlify */}
          <input type="hidden" name="form-name" value="contact" />
          <div className="hidden">
            <input name="bot-field" />
          </div>

          {/* Name Field */}
          <div className="flex bg-white dark:bg-gray-900 p-2 rounded-lg focus-within:ring-2 ring-gray-300 dark:ring-gray-600 mb-4">
            <input
              className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 border-none focus:ring-0 focus:outline-none"
              type="text"
              name="name"
              aria-label="Your name"
              placeholder="Your name..."
              autoComplete="name"
              value={formState.name}
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
              value={formState.email}
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
              value={formState.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Form feedback message */}
          {formState.success === true && (
            <div className="text-sm mb-4 p-2 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}

          {formState.success === false && (
            <div className="text-sm mb-4 p-2 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {formState.errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={formState.submitting}
            className="btn-sm text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState.submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
