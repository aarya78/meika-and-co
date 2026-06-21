import { Router } from "express";

import { submitContactForm } from "../controllers/contact.controller.js";
import { contactRateLimit } from "../middleware/contact-rate-limit.js";

const router = Router();

router.post("/", contactRateLimit, submitContactForm);

export default router;
