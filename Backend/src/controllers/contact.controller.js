import { sendContactEmail } from "../services/contact.service.js";
import { validateContactPayload } from "../validations/contact.validation.js";

export const submitContactForm = async (req, res) => {
  const { errors, isValid, values } = validateContactPayload(req.body);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Please correct the highlighted fields and try again.",
      errors,
    });
  }

  try {
    await sendContactEmail(values);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to send your message right now.",
    });
  }
};
