import { neon } from 'https://esm.sh/@neondatabase/serverless';

// 1. Configuration Credentials
const DATABASE_URL = "postgresql://neondb_owner:npg_vYpl5fgtJ6cw@ep-dark-lake-b39lq9jz-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(DATABASE_URL);

const EMAILJS_SERVICE_ID = "service_f4kqswm";
const EMAILJS_TEMPLATE_ID = "template_77j0yvd";
const EMAILJS_PUBLIC_KEY = "_L0XSkz3Pnv3PUO1T";

// Initialize EmailJS
if (window.emailjs) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log("EmailJS initialized successfully.");
}

// Attach event listener immediately or on DOM load
function initContactForm() {
  const form = document.querySelector("#inquiry-form");
  
  if (!form) {
    console.warn("Inquiry form #inquiry-form not found on this page!");
    return;
  }

  console.log("Inquiry form attached successfully.");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Form submit button clicked, processing...");

    const status = document.querySelector("#form-status");
    if (status) {
      status.textContent = "Sending inquiry & saving to database...";
      status.style.color = "#34d399";
    }

    // Get input values directly by ID
    const name = document.querySelector("#name")?.value || "";
    const email = document.querySelector("#email")?.value || "";
    const service = document.querySelector("#service")?.value || "";
    const budget = document.querySelector("#budget")?.value || "";
    const message = document.querySelector("#message")?.value || "";

    try {
      // 1. Insert into Neon Database via direct serverless query
      await sql`
        INSERT INTO client_inquiries (name, email, service, budget, message)
        VALUES (${name}, ${email}, ${service}, ${budget}, ${message})
      `;
      console.log("Neon DB Insert Successful!");

      // 2. Send Notification via EmailJS
      if (window.emailjs) {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name, email, service, budget, message
        });
        console.log("EmailJS Notification Sent Successfully!");
      }

      form.reset();
      if (status) {
        status.textContent = "Success! Your inquiry has been sent.";
      }
    } catch (err) {
      console.error("Submission Error Details:", err);
      if (status) {
        status.textContent = "Failed to submit. Check F12 Console.";
        status.style.color = "#f87171";
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initContactForm);
} else {
  initContactForm();
}