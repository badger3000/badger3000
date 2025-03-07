"use client";

import {useState, useEffect} from "react";

export default function Contact() {
  // Form state management
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    submitting: false,
    success: null,
    errorMessage: "",
  });

  // Form submission tracking
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    // DON'T prevent default - let the native form submission happen
    // e.preventDefault()

    console.log("Form submitted - allowing native submission");
    setFormState({...formState, submitting: true});

    // We'll set a flag to show success message after redirect
    localStorage.setItem("formSubmitted", "true");
  };

  // Check for form submission on component mount
  useEffect(() => {
    const wasSubmitted = localStorage.getItem("formSubmitted") === "true";
    if (wasSubmitted) {
      setIsSubmitted(true);
      localStorage.removeItem("formSubmitted");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }
  }, []);

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Let's Connect
      </h2>

      {/* Success message if form was just submitted */}
      {isSubmitted && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Thank you for your message! We'll get back to you soon.
        </div>
      )}

      <div className="p-5 rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-800/[0.65]">
        {/* Use a direct form submission to Netlify with no preventDefault */}
        <form
          name="contact"
          method="POST"
          action="/?success=true"
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
