"use server";

import {revalidatePath} from "next/cache";

export async function submitContactForm(prevState: any, formData: FormData) {
  // Prepare the data for Netlify's form handling
  const data = {
    "form-name": "contact",
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  try {
    // Create the fetch request body in the format Netlify expects
    const body = new URLSearchParams(data as Record<string, string>).toString();

    // Submit to Netlify's form endpoint
    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body,
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Form submission failed. Please try again.",
      };
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Thank you! Your message has been received.",
    };
  } catch (error) {
    console.error("Form submission error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
