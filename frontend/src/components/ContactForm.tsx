import React, {useState, useEffect} from "react";
import {Alert, AlertDescription} from "@/components/ui/alert";

// Declare the grecaptcha object on the window
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: {action: string}) => Promise<string>;
    };
  }
}

interface ContactFormProps {
  recaptchaSiteKey: string;
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

type FormStatus = "idle" | "sending" | "success" | "error";

const ContactForm: React.FC<ContactFormProps> = ({recaptchaSiteKey}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Load the reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log("reCAPTCHA script loaded");
    };

    script.onerror = () => {
      console.error("Error loading reCAPTCHA script");
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [recaptchaSiteKey]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const executeRecaptcha = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(recaptchaSiteKey, {action: "submit"})
            .then(resolve, reject);
        });
      } else {
        reject("reCAPTCHA not loaded");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const token = await executeRecaptcha();

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Form submission successful:", result);
        setStatus("success");
        setFormData({name: "", email: "", message: ""});
      } else {
        const errorData = await response.json();
        console.error("Server responded with an error:", errorData);
        setStatus("error");
        setErrorMessage(errorData.message || "An unexpected error occurred");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-1 text-white">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="email" className="block mb-1 text-white">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="message" className="block mb-1 text-white">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          rows={4}
        ></textarea>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-500 disabled:bg-red-400 transition-all duration-700"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
      {status === "success" && (
        <Alert>
          <AlertDescription>
            Your message has been sent successfully!
          </AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage || "An error occurred. Please try again later."}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
};

export default ContactForm;
