"use client";

import {useFormState} from "react-dom";
import {useRef, useState} from "react";
import {submitContactForm} from "../app/actions";

const initialState = {
  success: false,
  message: "",
};

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(submitContactForm, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  // Reset form after successful submission
  if (state.success && formRef.current) {
    formRef.current.reset();
    setIsSubmitting(false);
  }

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Let's Connect
      </h2>
      <div className="p-5 rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-800/[0.65]">
        {/* This hidden form is for Netlify's form detection */}
        <form name="contact" data-netlify="true" hidden>
          <input type="hidden" name="form-name" value="contact" />
          <input type="text" name="name" />
          <input type="email" name="email" />
          <textarea name="message"></textarea>
        </form>

        {/* The actual form users will interact with */}
        <form
          ref={formRef}
          action={formAction}
          onSubmit={handleSubmit}
          className="relative"
        >
          <input type="hidden" name="form-name" value="contact" />

          {/* Name Field */}
          <div className="flex bg-white dark:bg-gray-900 p-2 rounded-lg focus-within:ring-2 ring-gray-300 dark:ring-gray-600 mb-4">
            <input
              className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 border-none focus:ring-0 focus:outline-none"
              type="text"
              name="name"
              aria-label="Your name"
              placeholder="Your name..."
              autoComplete="name"
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
              required
            ></textarea>
          </div>

          {/* Form feedback message */}
          {state.message && (
            <div
              className={`text-sm mb-4 p-2 rounded ${
                state.success
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {state.message}
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
