import api from "@/lib/api";

export type MediaType = "image" | "video";

export interface ProductMedia {
  id?: number | string;
  media_url: string;
  media_type: MediaType;
  url: string;
  type: MediaType;
}

export interface ProductCategory {
  id: number | string;
  name: string;
  slug: string;
}

export interface Product {
  id: number | string;
  name: string;
  slug: string;
  size: string;
  description: string;
  price: number;
  featured: boolean;
  isActive: boolean;
  categoryId: number | string | null;
  categoryName: string;
  categorySlug: string;
  category?: ProductCategory | null;
  createdAt: string | null;
  media: ProductMedia[];
}

export interface ProductPayload {
  name: string;
  slug: string;
  size: string;
  description: string;
  price: number;
  featured: boolean;
  is_active: boolean;
  category_id: number | string;
  media?: Array<{
    media_url: string;
    media_type: MediaType;
  }>;
}

interface ProductMediaPayload {
  id?: number | string;
  media_url?: string;
  media_type?: MediaType;
  url?: string;
  type?: MediaType;
}

interface ProductCategoryPayload {
  id?: number | string;
  name?: string;
  slug?: string;
}

interface ProductPayloadResponse {
  id?: number | string;
  name?: string;
  title?: string;
  slug?: string;
  size?: string | null;
  description?: string | null;
  price?: number | string | null;
  featured?: boolean | string | number | null;
  is_active?: boolean | string | number | null;
  category_id?: number | string | null;
  created_at?: string | null;
  createdAt?: string | null;
  categories?: ProductCategoryPayload | null;
  product_images?: ProductMediaPayload[];
  product_media?: ProductMediaPayload[];
}

interface UploadResponse {
  url: string;
  type?: MediaType;
}

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};


const toBoolean = (value: boolean | string | number | null | undefined, fallback = false) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "1";
  }

  return value === 1;
};

const normalizeMedia = (media: ProductMediaPayload): ProductMedia => ({
  id: media.id,
  media_url: media.media_url ?? media.url ?? "",
  media_type: (media.media_type ?? media.type ?? "image") as MediaType,
  url: media.media_url ?? media.url ?? "",
  type: (media.media_type ?? media.type ?? "image") as MediaType,
});

const normalizeProduct = (product: ProductPayloadResponse): Product => ({
  id: product.id ?? "",
  name: product.name ?? product.title ?? "",
  slug: product.slug ?? "",
  size: product.size ?? "",
  description: product.description ?? "",
  price: toNumber(product.price),
  featured: toBoolean(product.featured),
  isActive: toBoolean(product.is_active, true),
  categoryId: product.category_id ?? product.categories?.id ?? null,
  categoryName: product.categories?.name ?? "Uncategorized",
  categorySlug: product.categories?.slug ?? "",
  category: product.categories
    ? {
        id: product.categories.id ?? "",
        name: product.categories.name ?? "Uncategorized",
        slug: product.categories.slug ?? "",
      }
    : null,
  createdAt: product.createdAt ?? product.created_at ?? null,
  media: (product.product_images ?? product.product_media ?? [])
    .map(normalizeMedia)
    .filter((item) => item.url),
});

export async function fetchProducts() {
  const { data } = await api.get<ProductPayloadResponse[]>("/products");
  return data.map(normalizeProduct);
}

export async function fetchProductById(id: number | string) {
  const { data } = await api.get<ProductPayloadResponse>(`/products/${id}`);
  return normalizeProduct(data);
}

export function getPrimaryProductThumbnail(product: Product) {
  return product.media.find((item) => item.type === "image") ?? product.media[0] ?? null;
}

export async function createProduct(payload: ProductPayload) {
  const { data } = await api.post<ProductPayloadResponse>("/products", payload);
  return normalizeProduct(data);
}

export async function updateProduct(id: number | string, payload: ProductPayload) {
  const { data } = await api.put<ProductPayloadResponse>(`/products/${id}`, payload);
  return normalizeProduct(data);
}

export async function deleteProduct(id: number | string) {
  await api.delete(`/products/${id}`);
}

export async function uploadProductFiles(files: File[]) {
  const uploads = await Promise.all(
    files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post<UploadResponse>("/products/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        media_url: data.url,
        media_type: (data.type ?? (file.type.startsWith("video/") ? "video" : "image")) as MediaType,
      };
    }),
  );

  return uploads;
}
