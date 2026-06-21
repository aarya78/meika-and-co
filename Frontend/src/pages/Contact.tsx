"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import SEO from "@/components/SEO";

import { useSettings } from "@/contexts/SettingsContext";
import { submitContactForm } from "@/services/contactService";

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

type ToastMessage = {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
};

const faqs = [
  {
    question: "Do you take custom doll requests?",
    answer:
      "Yes. We love creating thoughtful custom pieces for gifts, keepsakes and special moments. Share your idea with us and we will guide you through what is possible.",
  },
  {
    question: "How long does a handmade order usually take?",
    answer:
      "Timelines depend on the design and current order volume, but we always try to give a clear estimate before we begin so you can plan comfortably.",
  },
  {
    question: "Can I ask about product availability before ordering?",
    answer:
      "Absolutely. If you have a specific design, collection or size in mind, message us first and we will help you with the latest availability.",
  },
  {
    question: "What is the best way to reach Meika quickly?",
    answer:
      "WhatsApp is usually the fastest for quick questions, while email is great if you want to share a little more detail.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((f) => ({
    "@type": "Question",
    "name": f.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": f.answer,
    },
  })),
};

function normalizeWhatsappNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      (error.request ? "Unable to reach the server. Please try again." : fallback)
    );
  }

  return fallback;
}

function ContactSkeleton() {
  return (
    <section className="min-h-screen bg-[#fdf6f0] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto h-8 w-36 animate-pulse rounded-full bg-[#f3e5da]" />
          <div className="mx-auto mt-6 h-14 w-[24rem] max-w-full animate-pulse rounded-full bg-[#ecdcd0]" />
          <div className="mx-auto mt-5 h-5 w-[34rem] max-w-full animate-pulse rounded-full bg-[#f1e3d9]" />
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-[#eadfd6] bg-white p-7 shadow-[0_14px_40px_rgba(120,90,70,0.08)]">
            <div className="h-7 w-44 animate-pulse rounded-full bg-[#eedfd5]" />
            <div className="mt-3 h-5 w-64 animate-pulse rounded-full bg-[#f3e7df]" />
            <div className="mt-8 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-3xl border border-[#f1e5dc] bg-[#fffaf6] p-4"
                >
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#f4e6db]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-[#f1e3d8]" />
                    <div className="h-4 w-44 animate-pulse rounded-full bg-[#f5ebe4]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#eadfd6] bg-white p-7 shadow-[0_14px_40px_rgba(120,90,70,0.08)]">
            <div className="h-7 w-40 animate-pulse rounded-full bg-[#eedfd5]" />
            <div className="mt-3 h-5 w-72 animate-pulse rounded-full bg-[#f3e7df]" />
            <div className="mt-8 space-y-4">
              <div className="h-14 animate-pulse rounded-2xl bg-[#fff8f3]" />
              <div className="h-14 animate-pulse rounded-2xl bg-[#fff8f3]" />
              <div className="h-40 animate-pulse rounded-3xl bg-[#fff8f3]" />
              <div className="h-14 w-40 animate-pulse rounded-full bg-[#e8b29d]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  answer,
  isOpen,
  onToggle,
  question,
}: {
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  question: string;
}) {
  return (
    <motion.div
      layout
      className="overflow-hidden rounded-[28px] border border-[#eadfd6] bg-white shadow-[0_12px_30px_rgba(120,90,70,0.06)]"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-[#2f241f] sm:text-lg">{question}</span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#eadfd6] bg-[#fff8f3] text-[#c96f4f] transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="border-t border-[#f1e5dc] px-6 py-5 text-sm leading-7 text-[#7f6d62] sm:text-[15px]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ToastStack({
  onDismiss,
  toasts,
}: {
  onDismiss: (id: number) => void;
  toasts: ToastMessage[];
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[150] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`pointer-events-auto rounded-2xl border bg-white p-4 shadow-xl ${
              toast.variant === "success"
                ? "border-emerald-100 ring-1 ring-emerald-100"
                : "border-red-100 ring-1 ring-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  toast.variant === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {toast.variant === "success" ? <Sparkles size={16} /> : <Mail size={16} />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#2f241f]">{toast.title}</p>
                <p className="mt-1 text-sm leading-5 text-[#8a7668]">{toast.description}</p>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-lg p-1 text-[#a99588] transition hover:bg-[#faf5f0] hover:text-[#5c4a41]"
              >
                <ChevronDown className="-rotate-90" size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const { settings, loading } = useSettings();
  const [openFaq, setOpenFaq] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [formValues, setFormValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (!toasts.length) {
      return undefined;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3200),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  const whatsappUrl = useMemo(() => {
    if (!settings?.whatsapp_number) {
      return null;
    }

    const normalized = normalizeWhatsappNumber(settings.whatsapp_number);
    if (!normalized) {
      return null;
    }

    return `https://wa.me/${normalized}`;
  }, [settings?.whatsapp_number]);

  const contactItems = useMemo(
    () => [
      {
        label: "Email",
        value: settings?.email || "Not available right now",
        href: settings?.email ? `mailto:${settings.email}` : undefined,
        icon: Mail,
      },
      {
        label: "WhatsApp",
        value: settings?.whatsapp_number || "Not available right now",
        href: whatsappUrl ?? undefined,
        icon: MessageCircle,
      },
      {
        label: "Instagram",
        value: settings?.instagram_url || "Not available right now",
        href: settings?.instagram_url || undefined,
        icon: FaInstagram,
      },
      {
        label: "Facebook",
        value: settings?.facebook_url || "Not available right now",
        href: settings?.facebook_url || undefined,
        icon: FaFacebook,
      },
    ],
    [settings, whatsappUrl],
  );

  const handleChange = (field: keyof ContactFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setIsSubmitted(false);
  };

  const addToast = (title: string, description: string, variant: ToastMessage["variant"]) => {
    setToasts((current) => [
      ...current,
      {
        id: Date.now() + current.length,
        title,
        description,
        variant,
      },
    ]);
  };

  const validateForm = () => {
    const nextErrors: ContactFormErrors = {};

    if (!formValues.name.trim()) {
      nextErrors.name = "Please tell us your name.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Please add your email address.";
    } else if (!isValidEmail(formValues.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formValues.message.trim()) {
      nextErrors.message = "Please share a short message.";
    } else if (formValues.message.trim().length < 12) {
      nextErrors.message = "A little more detail will help us reply better.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSending(true);

    try {
      await submitContactForm({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        message: formValues.message.trim(),
      });

      setIsSubmitted(true);
      setFormValues({
        name: "",
        email: "",
        message: "",
      });
      setErrors({});
      addToast("Message sent", "Message sent successfully.", "success");
    } catch (error) {
      if (axios.isAxiosError<{ errors?: ContactFormErrors }>(error) && error.response?.data?.errors) {
        setErrors((current) => ({
          ...current,
          ...error.response?.data?.errors,
        }));
      }

      addToast(
        "Unable to send message",
        getErrorMessage(error, "Something went wrong while sending your message."),
        "error",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <ContactSkeleton />;
  }

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with Meika & Co for custom handmade dolls, orders and gifting enquiries. Fast WhatsApp support and personalised service."
        pathname="/contact"
        schema={faqSchema}
      />
    <div className="bg-[#fdf6f0]">
      <section className="relative overflow-hidden px-6 pb-10 pt-16 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f7e7db] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#d97757]">
              <Sparkles size={14} />
              Contact Meika
            </span>

            <h1 className="mt-6 font-serif text-5xl font-semibold leading-tight text-[#2d2d2d] sm:text-6xl">
              Get in Touch
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#7d6a5f] sm:text-lg">
              We would love to hear about your ideas, gifting plans, custom requests, or the doll
              that already has your heart. Reach out and let&apos;s make something beautiful
              together.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-8 sm:py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="rounded-[32px] border border-[#eadfd6] bg-white p-7 shadow-[0_14px_40px_rgba(120,90,70,0.08)] sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-[#fff1e7] ring-1 ring-[#f5d6c3]">
                <Mail size={24} className="text-[#d97757]" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-semibold text-[#2f241f]">
                  Contact Information
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#7f6d62] sm:text-[15px]">
                  A few easy ways to reach {settings?.site_name || "Meika Doll Shop"} for
                  questions, custom ideas, or a little shopping guidance.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <div className="group flex items-center gap-4 rounded-[28px] border border-[#efe4db] bg-[#fffaf6] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#e3c8b6] hover:bg-white">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#d97757] shadow-sm ring-1 ring-[#efe0d5]">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b79786]">
                        {item.label}
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-[#3c2f29] sm:text-[15px]">
                        {item.value}
                      </p>
                    </div>
                    {item.href && (
                      <span className="hidden rounded-full bg-[#f7ebe3] p-2 text-[#d97757] sm:flex">
                        <ExternalLink size={16} />
                      </span>
                    )}
                  </div>
                );

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.12 + index * 0.06 }}
                  >
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.16 }}
            className="rounded-[32px] border border-[#eadfd6] bg-white p-7 shadow-[0_14px_40px_rgba(120,90,70,0.08)] sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-[#fff1e7] ring-1 ring-[#f5d6c3]">
                <Send size={24} className="text-[#d97757]" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-semibold text-[#2f241f]">Send a Message</h2>
                <p className="mt-2 text-sm leading-7 text-[#7f6d62] sm:text-[15px]">
                  Leave a note and we&apos;ll get back to you with care.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e3b31]">Name</label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3.5 text-sm text-[#2f241f] outline-none transition focus:border-[#d97757] focus:ring-4 focus:ring-[#d97757]/10"
                  placeholder="Your name"
                />
                {errors.name && <p className="mt-2 text-sm text-[#d05f47]">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e3b31]">Email</label>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3.5 text-sm text-[#2f241f] outline-none transition focus:border-[#d97757] focus:ring-4 focus:ring-[#d97757]/10"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-2 text-sm text-[#d05f47]">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#4e3b31]">Message</label>
                <textarea
                  rows={6}
                  value={formValues.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  className="w-full rounded-[24px] border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3.5 text-sm text-[#2f241f] outline-none transition focus:border-[#d97757] focus:ring-4 focus:ring-[#d97757]/10"
                  placeholder="Tell us what you have in mind..."
                />
                {errors.message && (
                  <p className="mt-2 text-sm text-[#d05f47]">{errors.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.p
                      key="success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-sm font-medium text-[#3f8f64]"
                    >
                      Thanks for reaching out. We&apos;ll be in touch soon.
                    </motion.p>
                  ) : (
                    <motion.p
                      key="helper"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-sm text-[#8b776b]"
                    >
                      We read every message with care.
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d97757] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#d97757]/20 transition hover:-translate-y-0.5 hover:bg-[#c96b4f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isSending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f7e7db] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#d97757]">
              Friendly Answers
            </span>
            <h2 className="mt-6 font-serif text-4xl font-semibold text-[#2d2d2d] sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#7d6a5f]">
              A few quick answers before you message us.
            </p>
          </motion.div>

          <div className="mt-10 space-y-4">
            {faqs.map((item, index) => (
              <FAQItem
                key={item.question}
                answer={item.answer}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq((current) => (current === index ? -1 : index))}
                question={item.question}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-[#eadfd6] bg-[linear-gradient(135deg,#fff8f3_0%,#ffffff_45%,#fdf1e8_100%)] px-7 py-10 shadow-[0_16px_44px_rgba(120,90,70,0.08)] sm:px-10 sm:py-12"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#d97757] ring-1 ring-[#f0ddd2]">
                <Sparkles size={14} />
                Create With Meika
              </span>
              <h2 className="mt-5 font-serif text-4xl font-semibold text-[#2f241f] sm:text-5xl">
                Let&apos;s create something special together
              </h2>
              <p className="mt-4 text-base leading-8 text-[#7a675c]">
                Whether it&apos;s a heartfelt gift, a custom keepsake, or a question before you
                order, we&apos;re here to help with warmth and care.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition ${
                  whatsappUrl
                    ? "bg-[#d97757] text-white shadow-lg shadow-[#d97757]/20 hover:-translate-y-0.5 hover:bg-[#c96b4f]"
                    : "cursor-not-allowed bg-[#edd8cb] text-[#8e796d]"
                }`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                Start on WhatsApp
              </a>

              <a
                href={settings?.email ? `mailto:${settings.email}` : "#"}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold transition ${
                  settings?.email
                    ? "border-[#eadfd6] bg-white text-[#4e3b31] hover:-translate-y-0.5 hover:border-[#d8c1b3] hover:bg-[#fff9f4]"
                    : "cursor-not-allowed border-[#eadfd6] bg-white text-[#9d8a7d]"
                }`}
              >
                <Mail size={16} />
                Email Us
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </div>
    </>
  );
}
