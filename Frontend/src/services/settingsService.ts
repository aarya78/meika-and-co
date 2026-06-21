import api from "@/lib/api";

export interface StoreSettings {
  site_name: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  email: string;
}

interface SettingsPayload {
  site_name?: string | null;
  whatsapp_number?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  email?: string | null;
}

interface SettingsResponse {
  settings?: SettingsPayload | null;
}

export async function fetchStoreSettings() {
  const { data } = await api.get<SettingsResponse>("/settings");

  return {
    site_name: data.settings?.site_name ?? "",
    whatsapp_number: data.settings?.whatsapp_number ?? "",
    instagram_url: data.settings?.instagram_url ?? "",
    facebook_url: data.settings?.facebook_url ?? "",
    email: data.settings?.email ?? "",
  } satisfies StoreSettings;
}
