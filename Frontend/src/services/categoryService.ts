import api from "@/lib/api";

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string | null;
}

interface CategoryPayload {
  id?: number | string;
  _id?: number | string;
  name?: string;
  slug?: string;
  description?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
}

interface CategoriesResponse {
  categories?: CategoryPayload[];
  data?: CategoryPayload[];
}

const normalizeCategory = (category: CategoryPayload): Category => ({
  id: category.id ?? category._id ?? "",
  name: category.name?.trim() ?? "",
  slug: category.slug?.trim() ?? "",
  description: category.description?.trim() ?? undefined,
  createdAt: category.createdAt ?? category.created_at ?? null,
});

export async function fetchCategories() {
  const { data } = await api.get<CategoriesResponse | CategoryPayload[]>("/categories");
  const rawCategories = Array.isArray(data)
    ? data
    : data.categories ?? data.data ?? [];

  return rawCategories.map(normalizeCategory).filter((category) => category.id && category.name);
}
