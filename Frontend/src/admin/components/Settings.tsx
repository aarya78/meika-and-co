import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Loader2,
  Mail,
  MessageCircle,
  Save,
  Settings as SettingsIcon,
  Share2,
  Sparkles,
  Store,
} from "lucide-react";
import axios from "axios";

import api from "@/lib/api";
import { useSettings } from "@/contexts/SettingsContext";

interface SettingsFormValues {
  site_name: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  email: string;
}

interface SettingsPayload extends SettingsFormValues {
  id?: number | string;
}

interface SettingsResponse {
  success?: boolean;
  settings?: Partial<SettingsPayload> | null;
  message?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

const defaultValues: SettingsFormValues = {
  site_name: "",
  whatsapp_number: "",
  instagram_url: "",
  facebook_url: "",
  email: "",
};

function normalizeSettings(settings?: Partial<SettingsPayload> | null): SettingsFormValues {
  return {
    site_name: settings?.site_name ?? "",
    whatsapp_number: settings?.whatsapp_number ?? "",
    instagram_url: settings?.instagram_url ?? "",
    facebook_url: settings?.facebook_url ?? "",
    email: settings?.email ?? "",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      (error.request ? "Unable to reach the server. Please try again." : fallback)
    );
  }

  return fallback;
}

function ToastStack({
  onDismiss,
  toasts,
}: {
  onDismiss: (id: number) => void;
  toasts: ToastMessage[];
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
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
              {toast.variant === "success" ? <Sparkles size={16} /> : <SettingsIcon size={16} />}
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
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-white/55 bg-white/70 p-6 shadow-[0_24px_80px_rgba(140,105,82,0.12)] backdrop-blur-xl">
        <div className="h-8 w-48 animate-pulse rounded-full bg-[#efe3da]" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded-full bg-[#f3e7df]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[30px] border border-white/55 bg-white/70 p-6 shadow-[0_24px_80px_rgba(140,105,82,0.12)] backdrop-blur-xl"
            >
              <div className="h-5 w-40 animate-pulse rounded-full bg-[#efe3da]" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((__, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="h-14 animate-pulse rounded-2xl bg-[#f6eee8]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/55 bg-white/70 p-6 shadow-[0_24px_80px_rgba(140,105,82,0.12)] backdrop-blur-xl">
            <div className="h-5 w-36 animate-pulse rounded-full bg-[#efe3da]" />
            <div className="mt-6 space-y-4">
              <div className="h-14 animate-pulse rounded-2xl bg-[#f6eee8]" />
              <div className="h-14 animate-pulse rounded-2xl bg-[#f6eee8]" />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/55 bg-white/70 p-6 shadow-[0_24px_80px_rgba(140,105,82,0.12)] backdrop-blur-xl">
            <div className="h-24 animate-pulse rounded-3xl bg-[#f6eee8]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[30px] border border-white/55 bg-white/70 p-6 shadow-[0_24px_80px_rgba(140,105,82,0.12)] backdrop-blur-xl sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fef0e7] text-[#c96f4f] ring-1 ring-[#f5d6c3]">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f241f]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#8a7668]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function InputField({
  icon,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  icon: ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#4e3b31]">{label}</label>
      <div className="flex items-center rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-[#eadfd6]/70 transition focus-within:border-[#c96f4f] focus-within:ring-4 focus-within:ring-[#c96f4f]/10">
        <span className="mr-3 text-[#b46b4e]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#2f241f] outline-none placeholder:text-[#c4b5aa]"
        />
      </div>
    </div>
  );
}

export default function Settings() {
  const [formValues, setFormValues] = useState<SettingsFormValues>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 4000),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  const addToast = (title: string, description: string, variant: ToastMessage["variant"]) => {
    toastIdRef.current += 1;
    setToasts((current) => [
      ...current,
      {
        id: toastIdRef.current,
        title,
        description,
        variant,
      },
    ]);
  };
  const { refresh } = useSettings();

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get<SettingsResponse>("/settings");
      setFormValues(normalizeSettings(data.settings));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Unable to load settings."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const payload: SettingsFormValues = {
        site_name: formValues.site_name.trim(),
        whatsapp_number: formValues.whatsapp_number.trim(),
        instagram_url: formValues.instagram_url.trim(),
        facebook_url: formValues.facebook_url.trim(),
        email: formValues.email.trim(),
      };

      const { data } = await api.put<SettingsResponse>("/settings", payload);
      setFormValues(normalizeSettings(data.settings));
      addToast("Settings saved", "Your store settings were updated successfully.", "success");
      // update global settings cache
      void refresh();
    } catch (saveError) {
      addToast(
        "Save failed",
        getErrorMessage(saveError, "Unable to save settings right now."),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[34px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,246,240,0.72))] p-6 shadow-[0_28px_90px_rgba(140,105,82,0.14)] backdrop-blur-2xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-[#fef0e7] text-[#c96f4f] shadow-sm ring-1 ring-[#f5d6c3]">
                <SettingsIcon size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#2f241f]">
                  Settings
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8a7668] sm:text-base">
                  Fine-tune your storefront identity, contact channels and social presence from one polished dashboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c96f4f] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c96f4f]/15 transition hover:bg-[#b8614a] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-[30px] border border-red-100 bg-white/80 p-6 shadow-[0_24px_80px_rgba(140,105,82,0.1)] ring-1 ring-red-100 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#2f241f]">
                  Unable to load settings
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#8a7668]">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => void fetchSettings()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c96f4f] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#c96f4f]/15 transition hover:bg-[#b8614a]"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <SectionCard
                title="Store Information"
                description="These details shape how your store appears in communication and brand touchpoints."
                icon={<Store size={20} />}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    icon={<Store size={16} />}
                    label="Site Name"
                    placeholder="Meika Doll Shop"
                    value={formValues.site_name}
                    onChange={(value) =>
                      setFormValues((current) => ({ ...current, site_name: value }))
                    }
                  />
                  <InputField
                    icon={<Mail size={16} />}
                    label="Email"
                    type="email"
                    placeholder="hello@meika.com"
                    value={formValues.email}
                    onChange={(value) =>
                      setFormValues((current) => ({ ...current, email: value }))
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Social Media"
                description="Keep your public links current so customers can discover and follow your brand."
                icon={<Share2 size={20} />}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    icon={<Sparkles size={16} />}
                    label="Instagram URL"
                    placeholder="https://instagram.com/meika"
                    value={formValues.instagram_url}
                    onChange={(value) =>
                      setFormValues((current) => ({ ...current, instagram_url: value }))
                    }
                  />
                  <InputField
                    icon={<Share2 size={16} />}
                    label="Facebook URL"
                    placeholder="https://facebook.com/meika"
                    value={formValues.facebook_url}
                    onChange={(value) =>
                      setFormValues((current) => ({ ...current, facebook_url: value }))
                    }
                  />
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard
                title="Contact Information"
                description="Give shoppers a clear direct line for inquiries and ordering conversations."
                icon={<MessageCircle size={20} />}
              >
                <InputField
                  icon={<MessageCircle size={16} />}
                  label="WhatsApp Number"
                  placeholder="919999999999"
                  value={formValues.whatsapp_number}
                  onChange={(value) =>
                    setFormValues((current) => ({ ...current, whatsapp_number: value }))
                  }
                />
              </SectionCard>

              <section className="overflow-hidden rounded-[30px] border border-white/55 bg-[linear-gradient(145deg,rgba(254,240,231,0.9),rgba(255,255,255,0.82))] p-6 shadow-[0_24px_80px_rgba(140,105,82,0.12)] backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-[#c96f4f] ring-1 ring-[#f5d6c3]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#2f241f]">Brand Snapshot</h2>
                    <p className="mt-1 text-sm leading-6 text-[#8a7668]">
                      A quick overview of the identity details your storefront is currently using.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b0a298]">
                      Storefront
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#2f241f]">
                      {formValues.site_name || "Not set yet"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b0a298]">
                      Primary Contact
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#2f241f]">
                      {formValues.email || formValues.whatsapp_number || "Add an email or WhatsApp number"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((current) => current.filter((toast) => toast.id !== id))
        }
      />
    </>
  );
}
