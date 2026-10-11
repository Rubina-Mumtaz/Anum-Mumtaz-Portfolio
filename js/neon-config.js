const NEON_FUNCTION_URL = "https://br-broad-recipe-b39g0e7r-inquiryapi.compute.c-4.ap-southeast-1.aws.neon.tech/";
const EMAILJS_SERVICE_ID = "service_f4kqswm";
const EMAILJS_TEMPLATE_ID = "template_77j0yvd";
const EMAILJS_PUBLIC_KEY = "_L0XSkz3Pnv3PUO1";

const form = document.querySelector("#inquiry-form");
const status = document.querySelector("#form-status");

if (!(form instanceof HTMLFormElement)) {
  console.error("The contact form #inquiry-form was not found.");
} else if (!(status instanceof HTMLElement)) {
  console.error("The contact form status element #form-status was not found.");
} else {
  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  const formFields = ["name", "email", "service", "budget", "message"];
  const mismatchedFields = formFields.filter((fieldName) => {
    const field = form.elements.namedItem(fieldName);
    return !(field instanceof HTMLElement)
      || field.id !== fieldName
      || field.getAttribute("name") !== fieldName;
  });

  if (mismatchedFields.length) {
    console.error("Contact form fields are missing or misaligned:", mismatchedFields);
    showStatus("The contact form is unavailable because some fields are misconfigured.", true);
  } else {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      showStatus("");

      const submitButton = form.querySelector('button[type="submit"]');
      if (!(submitButton instanceof HTMLButtonElement)) {
        showStatus("The inquiry form is unavailable. Please try again later.", true);
        console.error("The contact form submit button was not found.");
        return;
      }

      const formData = new FormData(form);
      const inquiry = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        service: String(formData.get("service") || "").trim(),
        budget: String(formData.get("budget") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        website: String(formData.get("website") || "").trim()
      };

      if (!inquiry.name || !inquiry.email || !inquiry.service || !inquiry.message) {
        showStatus("Please complete all required fields before sending.", true);
        return;
      }

      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      showStatus("Processing your inquiry...");

      try {
        let response;
        try {
          response = await fetch(NEON_FUNCTION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inquiry)
          });
        } catch (error) {
          console.error("Could not reach the Neon inquiry function:", error);
          showStatus("We could not connect to the inquiry service. Please try again later.", true);
          return;
        }

        let result;
        try {
          result = await response.json();
        } catch (error) {
          console.error("Neon inquiry function returned an unreadable response:", {
            status: response.status,
            error
          });
          showStatus("The inquiry service returned an unexpected response. Please try again later.", true);
          return;
        }

        if (!response.ok || result.ok !== true) {
          console.error("Neon inquiry function reported an error:", {
            status: response.status,
            error: result.error || "The function did not confirm the submission."
          });
          showStatus(
            response.status === 400
              ? (result.error || "Please check your inquiry and try again.")
              : "Your inquiry could not be saved. Please try again later.",
            true
          );
          return;
        }

        if (result.spam === true) {
          form.reset();
          showStatus("Thank you! Your inquiry has been received.");
          return;
        }

        if (result.saved !== true) {
          console.error("Neon inquiry function did not confirm that the inquiry was saved:", result);
          showStatus("Your inquiry could not be saved. Please try again later.", true);
          return;
        }

        console.info("Client inquiry saved to Neon.");

        if (!window.emailjs) {
          console.error("Inquiry was saved, but the EmailJS browser SDK is unavailable.");
          form.reset();
          showStatus("Your inquiry was saved, but the email notification could not be sent.");
          return;
        }

        try {
          window.emailjs.init(EMAILJS_PUBLIC_KEY);
          await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            name: inquiry.name,
            email: inquiry.email,
            service: inquiry.service,
            budget: inquiry.budget,
            message: inquiry.message
          });
          console.info("EmailJS notification sent for the saved inquiry.");
          form.reset();
          showStatus("Thank you! Your inquiry has been saved and the email notification was sent.");
        } catch (error) {
          console.error("Inquiry was saved to Neon, but its EmailJS notification failed:", error);
          form.reset();
          showStatus("Your inquiry was saved, but the email notification could not be sent. Thank you for reaching out.");
        }
      } catch (error) {
        console.error("Unexpected error while processing the contact form:", error);
        showStatus("Something went wrong while processing your inquiry. Please try again later.", true);
      } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    });
  }
}
