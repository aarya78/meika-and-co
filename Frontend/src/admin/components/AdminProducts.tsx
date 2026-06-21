"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  ImageIcon,
  Loader2,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import {
  AppAlertDialog,
  AppAlertDialogCancel,
  AppAlertDialogContent,
  AppAlertDialogDescription,
  AppAlertDialogTitle,
} from "@/components/ui/app-alert-dialog";
import {
  AppDialog,
  AppDialogClose,
  AppDialogContent,
  AppDialogDescription,
  AppDialogTitle,
} from "@/components/ui/app-dialog";
import {
  AppPopover,
  AppPopoverContent,
  AppPopoverTrigger,
} from "@/components/ui/app-popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import {
  deleteProduct,
  updateProduct,
  uploadProductFiles,
  type MediaType,
  type Product,
} from "@/services/productService";

interface ProductFormValues {
  name: string;
  slug: string;
  size: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  featured: boolean;
  isActive: boolean;
}

interface ProductMediaDraft {
  id: string;
  type: MediaType;
  preview: string;
  url?: string;
  file?: File;
  isExisting: boolean;
}

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

interface ProductDialogProps {
  categories: Array<{ id: number | string; name: string }>;
  categoryError: string | null;
  categoryLoading: boolean;
  formValues: ProductFormValues;
  isOpen: boolean;
  isSaving: boolean;
  mediaDrafts: ProductMediaDraft[];
  onClose: () => void;
  onMediaAdd: (files: FileList | File[]) => void;
  onMediaRemove: (id: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onValueChange: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function ToggleCard({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        checked
          ? "border-[#c96f4f]/30 bg-[#fef0e7] ring-4 ring-[#c96f4f]/10"
          : "border-[#eadfd6] bg-[#fdfaf7] hover:border-[#d0bfb3]"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-[#2f241f]">{label}</p>
        <p className="mt-1 text-xs text-[#8a7668]">{description}</p>
      </div>

      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? "bg-[#c96f4f]" : "bg-[#e7d8ce]"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
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
                {toast.variant === "success" ? <Sparkles size={16} /> : <Trash2 size={16} />}
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
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ProductsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6]">
      <div className="border-b border-[#eadfd6] bg-[#fdfaf7] px-5 py-4">
        <div className="h-4 w-36 animate-pulse rounded-full bg-[#efe3da]" />
      </div>
      <div className="space-y-4 p-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid animate-pulse grid-cols-[88px_1.4fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr_1fr_120px] gap-4 rounded-2xl border border-[#f3e8e1] bg-[#fffdfa] p-4"
          >
            {Array.from({ length: 9 }).map((__, cellIndex) => (
              <div key={cellIndex} className="h-4 rounded-full bg-[#f0e6df]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] sm:py-20"
    >
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#fff4ed] ring-1 ring-[#f5d6c3]">
        <div className="absolute inset-3 rounded-[22px] border border-dashed border-[#edc7b4]" />
        <Package size={34} className="text-[#c96f4f]" />
      </div>
      <h3 className="text-xl font-semibold text-[#2f241f]">No products yet</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#8a7668]">
        Create your first product listing to start filling the catalog with media, pricing and inventory.
      </p>
      <NavLink
        to="/admin/add-product"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c96f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#c96f4f]/15 transition hover:bg-[#b8614a]"
      >
        <Plus size={16} />
        Add Product
      </NavLink>
    </motion.div>
  );
}

function ProductDialog({
  categories,
  categoryError,
  categoryLoading,
  formValues,
  isOpen,
  isSaving,
  mediaDrafts,
  onClose,
  onMediaAdd,
  onMediaRemove,
  onNameChange,
  onSubmit,
  onValueChange,
}: ProductDialogProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <AppDialogContent className="max-w-4xl overflow-hidden rounded-[28px]">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-[#eadfd6]"
            >
                  <div className="border-b border-[#f3e8e1] px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fef0e7] ring-1 ring-[#f5d6c3]">
                          <Pencil size={18} className="text-[#c96f4f]" />
                        </div>
                        <div>
                          <AppDialogTitle className="text-lg font-bold text-[#2f241f] sm:text-xl">
                            Edit Product
                          </AppDialogTitle>
                          <AppDialogDescription className="mt-1 text-sm leading-5 text-[#8a7668]">
                            Update catalog details, inventory and media in one place.
                          </AppDialogDescription>
                        </div>
                      </div>

                      <AppDialogClose asChild>
                        <button
                          type="button"
                          className="rounded-xl border border-[#eadfd6] p-2 text-[#8a7668] transition hover:bg-[#faf5f0] hover:text-[#4e3b31]"
                        >
                          <X size={16} />
                        </button>
                      </AppDialogClose>
                    </div>
                  </div>

                  <form onSubmit={onSubmit}>
                    <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={formValues.name}
                            onChange={(event) => onNameChange(event.target.value)}
                            className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                            Slug
                          </label>
                          <div className="rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-4 py-3 text-sm font-medium text-[#4e3b31]">
                            {formValues.slug || "slug-preview"}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#4e3b31]">Size</label>
                          <input
                            type="text"
                            value={formValues.size}
                            onChange={(event) => onValueChange("size", event.target.value)}
                            className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                            Category
                          </label>
                          <div className="rounded-2xl border border-[#eadfd6] bg-[#fdfaf7]">
                            <Select
                              value={formValues.categoryId}
                              onValueChange={(value) => onValueChange("categoryId", value)}
                              disabled={categoryLoading || !categories.length}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    categoryLoading ? "Loading categories..." : "Select a category"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {categoryError && (
                            <p className="mt-2 text-xs text-red-500">{categoryError}</p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#4e3b31]">Price</label>
                          <input
                            type="number"
                            min="0"
                            value={formValues.price}
                            onChange={(event) => onValueChange("price", event.target.value)}
                            className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                            Sale Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formValues.salePrice}
                            onChange={(event) => onValueChange("salePrice", event.target.value)}
                            className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                            Description
                          </label>
                          <textarea
                            rows={4}
                            value={formValues.description}
                            onChange={(event) => onValueChange("description", event.target.value)}
                            className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                          />
                        </div>

                        <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
                          <ToggleCard
                            checked={formValues.featured}
                            description="Feature this listing in highlighted admin and storefront spots."
                            label="Featured"
                            onChange={(value) => onValueChange("featured", value)}
                          />

                          <ToggleCard
                            checked={formValues.isActive}
                            description="Inactive products stay hidden while inventory is being updated."
                            label="Active"
                            onChange={(value) => onValueChange("isActive", value)}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="mb-3 flex items-center justify-between">
                            <label className="text-sm font-medium text-[#4e3b31]">Media</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="rounded-xl border border-[#eadfd6] bg-white px-3 py-2 text-xs font-semibold text-[#4e3b31] transition hover:bg-[#faf5f0]"
                              >
                                Add Images
                              </button>
                              <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                className="rounded-xl border border-[#eadfd6] bg-white px-3 py-2 text-xs font-semibold text-[#4e3b31] transition hover:bg-[#faf5f0]"
                              >
                                Add Videos
                              </button>
                            </div>
                          </div>

                          <input
                            ref={imageInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              if (event.target.files) {
                                onMediaAdd(event.target.files);
                                event.target.value = "";
                              }
                            }}
                          />
                          <input
                            ref={videoInputRef}
                            type="file"
                            multiple
                            accept="video/*"
                            className="hidden"
                            onChange={(event) => {
                              if (event.target.files) {
                                onMediaAdd(event.target.files);
                                event.target.value = "";
                              }
                            }}
                          />

                          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] p-4 sm:grid-cols-3 lg:grid-cols-4">
                            {mediaDrafts.map((item, index) => (
                              <div
                                key={item.id}
                                className="relative overflow-hidden rounded-2xl border border-[#eadfd6] bg-white"
                              >
                                <div className="aspect-square bg-[#f5ebe3]">
                                  {item.type === "image" ? (
                                    <img
                                      src={item.preview}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Video size={22} className="text-[#b46b4e]" />
                                    </div>
                                  )}
                                </div>

                                {index === 0 && (
                                  <span className="absolute left-2 top-2 rounded-full bg-[#c96f4f] px-2 py-0.5 text-[10px] font-semibold text-white">
                                    Cover
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => onMediaRemove(item.id)}
                                  className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white transition hover:bg-black/70"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[#f3e8e1] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                      <AppDialogClose asChild>
                        <button
                          type="button"
                          className="rounded-xl border border-[#eadfd6] bg-white px-5 py-3 text-sm font-semibold text-[#4e3b31] transition hover:bg-[#faf5f0]"
                        >
                          Cancel
                        </button>
                      </AppDialogClose>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c96f4f] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#c96f4f]/15 transition hover:bg-[#b8614a] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
            </motion.div>
          </AppDialogContent>
        )}
      </AnimatePresence>
    </AppDialog>
  );
}

export default function AdminProducts() {
  const { categories, error: categoryError, isLoading: categoryLoading } = useCategories();
  const { error, isLoading, products, reloadProducts, setProducts } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>({
    name: "",
    slug: "",
    size: "",
    description: "",
    price: "",
    salePrice: "",
    categoryId: "",
    featured: false,
    isActive: true,
  });
  const [mediaDrafts, setMediaDrafts] = useState<ProductMediaDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileActionId, setMobileActionId] = useState<number | string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);
  const mediaDraftsRef = useRef<ProductMediaDraft[]>([]);

  useEffect(() => {
    if (!toasts.length) {
      return undefined;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 4000),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  useEffect(() => {
    mediaDraftsRef.current = mediaDrafts;
  }, [mediaDrafts]);

  useEffect(
    () => () => {
      mediaDraftsRef.current.forEach((item) => {
        if (!item.isExisting) {
          URL.revokeObjectURL(item.preview);
        }
      });
    },
    [],
  );

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

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.slug,
        product.categoryName,
        product.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, searchQuery]);

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormValues({
      name: product.name,
      slug: product.slug,
      size: product.size,
      description: product.description,
      price: String(product.price),
      salePrice: product.salePrice === null ? "" : String(product.salePrice),
      categoryId: product.categoryId ? String(product.categoryId) : "",
      featured: product.featured,
      isActive: product.isActive,
    });
    setMediaDrafts(
      product.media.map((item) => ({
        id: String(item.id ?? crypto.randomUUID()),
        isExisting: true,
        preview: item.url,
        type: item.type,
        url: item.url,
      })),
    );
    setMobileActionId(null);
  };

  const closeEditDialog = () => {
    if (isSaving) {
      return;
    }

    mediaDrafts.forEach((item) => {
      if (!item.isExisting) {
        URL.revokeObjectURL(item.preview);
      }
    });

    setEditingProduct(null);
    setMediaDrafts([]);
    setFormValues({
      name: "",
      slug: "",
      size: "",
      description: "",
      price: "",
      salePrice: "",
      categoryId: "",
      featured: false,
      isActive: true,
    });
  };

  const handleMediaAdd = (files: FileList | File[]) => {
    const nextMedia = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        isExisting: false,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      })) satisfies ProductMediaDraft[];

    setMediaDrafts((current) => [...current, ...nextMedia]);
  };

  const handleMediaRemove = (id: string) => {
    setMediaDrafts((current) => {
      const match = current.find((item) => item.id === id);
      if (match && !match.isExisting) {
        URL.revokeObjectURL(match.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const handleSubmitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    const trimmedName = formValues.name.trim();
    const slug = slugify(trimmedName);

    if (!trimmedName || !slug || !formValues.categoryId || !formValues.price) {
      addToast("Missing details", "Please complete the required product fields.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const uploadedMedia = await uploadProductFiles(
        mediaDrafts.filter((item) => item.file).map((item) => item.file as File),
      );

      const existingMedia = mediaDrafts
        .filter((item) => item.isExisting && item.url)
        .map((item) => ({
          media_url: item.url as string,
          media_type: item.type,
        }));

      const updated = await updateProduct(editingProduct.id, {
        name: trimmedName,
        slug,
        size: formValues.size.trim(),
        description: formValues.description.trim(),
        price: Number(formValues.price),
        sale_price: formValues.salePrice ? Number(formValues.salePrice) : null,
        category_id: formValues.categoryId,
        featured: formValues.featured,
        is_active: formValues.isActive,
        media: [...existingMedia, ...uploadedMedia],
      });

      setProducts((current) =>
        current.map((product) => (product.id === updated.id ? updated : product)),
      );
      addToast("Product updated", "Your product changes have been saved.", "success");
      closeEditDialog();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Unable to update product.";
      addToast("Update failed", message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteProduct(deletingProduct.id);
      setProducts((current) => current.filter((item) => item.id !== deletingProduct.id));
      addToast("Product deleted", "The product was removed from the catalog.", "success");
      setDeletingProduct(null);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete product.";
      addToast("Delete failed", message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "thumbnail",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7668]">
            Image
          </span>
        ),
        cell: ({ row }) => {
          const firstMedia = row.original.media[0];
          return (
            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#f5ebe3]">
              {firstMedia?.type === "image" ? (
                <img src={firstMedia.url} alt={row.original.name} className="h-full w-full object-cover" />
              ) : firstMedia?.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Video size={18} className="text-[#b46b4e]" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon size={18} className="text-[#c4b5aa]" />
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7668] transition hover:text-[#c96f4f]"
          >
            Name
            <ArrowUpDown size={13} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#2f241f]">{row.original.name}</p>
            <p className="mt-1 text-xs text-[#8a7668]">{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: "categoryName",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7668] transition hover:text-[#c96f4f]"
          >
            Category
            <ArrowUpDown size={13} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-[#fef0e7] px-3 py-1 text-xs font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3]">
            {row.original.categoryName}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7668] transition hover:text-[#c96f4f]"
          >
            Price
            <ArrowUpDown size={13} />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-[#2f241f]">₹{row.original.price}</p>
            {row.original.salePrice !== null && (
              <p className="text-xs text-[#8a7668] line-through">₹{row.original.salePrice}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "featured",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7668]">
            Featured
          </span>
        ),
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${
              row.original.featured
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : "bg-[#f4efea] text-[#8a7668] ring-[#eadfd6]"
            }`}
          >
            {row.original.featured ? "Featured" : "Standard"}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7668]">
            Status
          </span>
        ),
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${
              row.original.isActive
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-red-50 text-red-500 ring-red-100"
            }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7668] transition hover:text-[#c96f4f]"
          >
            Created At
            <ArrowUpDown size={13} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-[#6A5D55]">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => (
          <div className="text-right text-xs font-semibold uppercase tracking-wider text-[#8a7668]">
            Actions
          </div>
        ),
        cell: ({ row }) => (
          <div className="hidden items-center justify-end gap-2 md:flex">
            <button
              type="button"
              onClick={() => openEditDialog(row.original)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#eadfd6] bg-white px-3 py-2 text-sm font-medium text-[#4e3b31] transition hover:bg-[#faf5f0]"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setDeletingProduct(row.original)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        ),
      },
    ],
    [products],
  );

  const table = useReactTable({
    columns,
    data: filteredProducts,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fef0e7] shadow-sm ring-1 ring-[#f5d6c3]">
              <Package size={20} className="text-[#c96f4f]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2f241f] sm:text-3xl">Products</h1>
              <p className="text-xs text-[#8a7668] sm:text-sm">
                {filteredProducts.length} of {products.length} products
              </p>
            </div>
          </div>

          <NavLink
            to="/admin/add-product"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c96f4f] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#c96f4f]/15 transition active:scale-[0.98] sm:hover:-translate-y-0.5 sm:hover:bg-[#b8614a] sm:hover:shadow-lg"
          >
            <Plus size={18} />
            Add Product
          </NavLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl bg-white p-3 shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] sm:rounded-3xl sm:p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a298]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-[#eadfd6] bg-[#fdfaf7] py-2.5 pl-10 pr-10 text-sm text-[#2f241f] placeholder:text-[#c4b5aa] transition focus:border-[#c96f4f] focus:outline-none focus:ring-4 focus:ring-[#c96f4f]/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a298] transition hover:text-[#6A5D55]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="rounded-xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-2.5 text-sm text-[#8a7668]">
              Manage pricing, media and status
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <ProductsTableSkeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6]"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#2f241f]">Unable to load products</h3>
                <p className="mt-2 text-sm leading-6 text-[#8a7668]">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => void reloadProducts()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c96f4f] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#c96f4f]/15 transition hover:bg-[#b8614a]"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="hidden overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] md:block">
              <div className="max-h-[68vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#fdfaf7]">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b border-[#eadfd6]">
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-5 py-4 text-left align-middle">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-[#f0e8e1]">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="transition hover:bg-[#fdfaf7]">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-5 py-4 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredProducts.map((product) => {
                const firstMedia = product.media[0];
                const isMenuOpen = mobileActionId === product.id;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6]"
                  >
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eadfd6] bg-[#f5ebe3]">
                        {firstMedia?.type === "image" ? (
                          <img src={firstMedia.url} alt={product.name} className="h-full w-full object-cover" />
                        ) : firstMedia?.type === "video" ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <Video size={18} className="text-[#b46b4e]" />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon size={18} className="text-[#c4b5aa]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#2f241f]">
                              {product.name}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-[#8a7668]">
                              {product.categoryName}
                            </p>
                          </div>

                          <AppPopover
                            open={isMenuOpen}
                            onOpenChange={(open) => setMobileActionId(open ? product.id : null)}
                          >
                            <AppPopoverTrigger asChild>
                              <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd6] bg-white text-[#6A5D55] transition hover:bg-[#faf5f0]"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </AppPopoverTrigger>

                            <AppPopoverContent
                              align="end"
                              className="min-w-36 overflow-hidden rounded-2xl border border-[#eadfd6] bg-white p-0 shadow-xl"
                            >
                              <button
                                type="button"
                                onClick={() => openEditDialog(product)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#4e3b31] transition hover:bg-[#faf5f0]"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingProduct(product);
                                  setMobileActionId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </AppPopoverContent>
                          </AppPopover>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-[#c96f4f]">₹{product.price}</span>
                          <span className="rounded-full bg-[#fef0e7] px-2.5 py-0.5 text-[10px] font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3]">
                            {product.featured ? "Featured" : "Standard"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${
                              product.isActive
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-red-50 text-red-500 ring-red-100"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <ProductDialog
        categories={categories}
        categoryError={categoryError}
        categoryLoading={categoryLoading}
        formValues={formValues}
        isOpen={Boolean(editingProduct)}
        isSaving={isSaving}
        mediaDrafts={mediaDrafts}
        onClose={closeEditDialog}
        onMediaAdd={handleMediaAdd}
        onMediaRemove={handleMediaRemove}
        onNameChange={(value) =>
          setFormValues((current) => ({ ...current, name: value, slug: slugify(value) }))
        }
        onSubmit={handleSubmitEdit}
        onValueChange={(key, value) =>
          setFormValues((current) => ({ ...current, [key]: value }))
        }
      />

      <AppAlertDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && !isDeleting && setDeletingProduct(null)}
      >
        <AnimatePresence>
          {deletingProduct && (
            <AppAlertDialogContent className="max-w-md rounded-[28px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-[#eadfd6]"
              >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                      <Trash2 size={24} className="text-red-500" />
                    </div>
                    <AppAlertDialogTitle className="text-lg font-bold text-[#2f241f]">
                      Delete Product
                    </AppAlertDialogTitle>
                    <AppAlertDialogDescription className="mt-2 text-sm leading-6 text-[#8a7668]">
                      This will permanently remove {deletingProduct.name} from your catalog.
                    </AppAlertDialogDescription>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <AppAlertDialogCancel asChild>
                        <button
                          type="button"
                          className="rounded-xl border border-[#eadfd6] bg-white px-5 py-3 text-sm font-semibold text-[#4e3b31] transition hover:bg-[#faf5f0]"
                        >
                          Cancel
                        </button>
                      </AppAlertDialogCancel>

                      <button
                        type="button"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                        Delete Product
                      </button>
                    </div>
              </motion.div>
            </AppAlertDialogContent>
          )}
        </AnimatePresence>
      </AppAlertDialog>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </>
  );
}
