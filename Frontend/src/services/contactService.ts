import api from "@/lib/api";

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
  errors?: Partial<Record<keyof ContactFormPayload, string>>;
}

export async function submitContactForm(payload: ContactFormPayload) {
  const { data } = await api.post<ContactResponse>("/contact", payload);
  return data;
}
