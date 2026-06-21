const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactPayload(payload = {}) {
  const errors = {};

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters long.";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please provide a valid email address.";
  }

  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length < 12) {
    errors.message = "Message must be at least 12 characters long.";
  } else if (message.length > 4000) {
    errors.message = "Message must be 4000 characters or fewer.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      name,
      email,
      message,
    },
  };
}
