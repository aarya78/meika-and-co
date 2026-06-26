"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Check,
  Eye,
  FolderTree,
  ImagePlus,
  IndianRupee,
  Loader2,
  Package,
  Plus,
  Sparkles,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { createProduct, uploadProductFiles, type MediaType } from "@/services/productService";

interface ProductFormValues {
  name: string;
  slug: string;
  size: string;
  description: string;
  price: string;
  categoryId: string;
  featured: boolean;
  isActive: boolean;
}

interface MediaDraft {
  id: string;
  file: File;
  preview: string;
  type: MediaType;
}

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  variant: "success" | "error";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${checked
          ? "border-[#c96f4f]/30 bg-[#fef0e7] ring-4 ring-[#c96f4f]/10"
          : "border-[#eadfd6] bg-[#fdfaf7] hover:border-[#d0bfb3]"
        }`}
    >
      <div>
        <p className="text-sm font-semibold text-[#2f241f]">{label}</p>
        <p className="mt-1 text-xs text-[#8a7668]">{description}</p>
      </div>

      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? "bg-[#c96f4f]" : "bg-[#e7d8ce]"
          }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "translate-x-5" : "translate-x-0"
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
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`pointer-events-auto rounded-2xl border bg-white p-4 shadow-xl ${toast.variant === "success"
                ? "border-emerald-100 ring-1 ring-emerald-100"
                : "border-red-100 ring-1 ring-red-100"
              }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toast.variant === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                  }`}
              >
                {toast.variant === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
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

export default function AddProduct() {
  const navigate = useNavigate();
  const { categories, error: categoriesError, isLoading: categoriesLoading, reloadCategories } =
    useCategories();

  const [formValues, setFormValues] = useState<ProductFormValues>({
    name: "",
    slug: "",
    size: "",
    description: "",
    price: "",
    categoryId: "",
    featured: false,
    isActive: true,
  });
  const [mediaDrafts, setMediaDrafts] = useState<MediaDraft[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);
  const mediaDraftsRef = useRef<MediaDraft[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!categoriesLoading && categories.length && !formValues.categoryId) {
      setFormValues((current) => ({
        ...current,
        categoryId: String(categories[0].id),
      }));
    }
  }, [categories, categoriesLoading, formValues.categoryId]);

  useEffect(() => {
    mediaDraftsRef.current = mediaDrafts;
  }, [mediaDrafts]);

  useEffect(
    () => () => {
      mediaDraftsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [],
  );

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

  const handleNameChange = (value: string) => {
    setFormValues((current) => ({
      ...current,
      name: value,
      slug: slugify(value),
    }));
  };

  const handleMediaSelection = (files: FileList | File[], kind?: MediaType) => {
    const nextFiles = Array.from(files)
      .filter((file) => {
        if (kind) {
          return kind === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/");
        }

        return file.type.startsWith("image/") || file.type.startsWith("video/");
      })
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      })) satisfies MediaDraft[];

    setMediaDrafts((current) => [...current, ...nextFiles]);
  };

  const removeMedia = (id: string) => {
    setMediaDrafts((current) => {
      const match = current.find((item) => item.id === id);
      if (match) {
        URL.revokeObjectURL(match.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const isValid = useMemo(
    () =>
      Boolean(
        formValues.name.trim() &&
        formValues.slug &&
        formValues.description.trim() &&
        formValues.size.trim() &&
        formValues.price &&
        formValues.categoryId &&
        mediaDrafts.length,
      ),
    [formValues, mediaDrafts.length],
  );

  const previewCategoryName =
    categories.find((category) => String(category.id) === formValues.categoryId)?.name ??
    "Category";

  const previewImage = mediaDrafts.find((item) => item.type === "image");

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      addToast("Missing details", "Please complete the required fields and add media.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedMedia = await uploadProductFiles(mediaDrafts.map((item) => item.file));

      await createProduct({
        name: formValues.name.trim(),
        slug: formValues.slug,
        size: formValues.size.trim(),
        description: formValues.description.trim(),
        price: Number(formValues.price),
        category_id: formValues.categoryId,
        featured: formValues.featured,
        is_active: formValues.isActive,
        media: uploadedMedia,
      });

      addToast("Product created", "Your new product was saved successfully.", "success");
      window.setTimeout(() => {
        navigate("/admin/products", { replace: true });
      }, 700);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create product right now.";
      addToast("Create failed", message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
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
              <h1 className="text-2xl font-bold text-[#2f241f] sm:text-3xl">Add Product</h1>
              <p className="text-xs text-[#8a7668] sm:text-sm">
                Build a complete listing with pricing, inventory and media.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white p-5 shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] sm:p-6"
            >
              <div className="mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-[#c96f4f]" />
                <h2 className="text-lg font-semibold text-[#2f241f]">Product Details</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Sleepy Dino"
                    className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                    Slug
                  </label>
                  <div className="rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-4 py-3 text-sm font-medium text-[#4e3b31]">
                    {formValues.slug || "slug-preview"}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                    Size
                  </label>

                  <Select
                    value={formValues.size}
                    onValueChange={(value) =>
                      setFormValues((current) => ({
                        ...current,
                        size: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-auto w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10">
                      <SelectValue placeholder="Select product size" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="8-10 inches">
                        8-10 inches
                      </SelectItem>

                      <SelectItem value="12 inches">
                        12 inches
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                    Category
                  </label>
                  <div className="rounded-2xl border border-[#eadfd6] bg-[#fdfaf7]">
                    <Select
                      value={formValues.categoryId}
                      onValueChange={(value) =>
                        setFormValues((current) => ({ ...current, categoryId: value }))
                      }
                      disabled={categoriesLoading || !categories.length}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categoriesLoading ? "Loading categories..." : "Select a category"
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

                  {categoriesError && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-red-50 px-3 py-2 text-xs text-red-500">
                      <span>{categoriesError}</span>
                      <button
                        type="button"
                        onClick={() => void reloadCategories()}
                        className="font-semibold"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4e3b31]">Price</label>
                  <div className="flex items-center rounded-2xl border border-[#eadfd6] bg-[#fdfaf7]">
                    <span className="flex h-11 w-11 items-center justify-center text-[#b46b4e]">
                      <IndianRupee size={16} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={formValues.price}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, price: event.target.value }))
                      }
                      placeholder="1499"
                      className="w-full bg-transparent py-3 pr-4 text-sm text-[#2f241f] outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={formValues.description}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Describe the handmade materials, feel, finish and who it is perfect for."
                    className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                  />
                </div>

                <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                  <ToggleCard
                    checked={formValues.featured}
                    description="Highlight this product in key storefront sections."
                    label="Featured"
                    onChange={(value) =>
                      setFormValues((current) => ({ ...current, featured: value }))
                    }
                  />

                  <ToggleCard
                    checked={formValues.isActive}
                    description="Inactive products stay hidden while you prepare them."
                    label="Active"
                    onChange={(value) =>
                      setFormValues((current) => ({ ...current, isActive: value }))
                    }
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white p-5 shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] sm:p-6"
            >
              <div className="mb-6 flex items-center gap-2">
                <ImagePlus size={18} className="text-[#c96f4f]" />
                <h2 className="text-lg font-semibold text-[#2f241f]">Media Upload</h2>
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleMediaSelection(event.dataTransfer.files);
                }}
                className={`rounded-3xl border-2 border-dashed p-6 text-center transition ${isDragging
                    ? "border-[#c96f4f] bg-[#fef0e7]"
                    : "border-[#e0d4ca] bg-[#fdfaf7] hover:border-[#d0bfb3]"
                  }`}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fef0e7]">
                  <UploadCloud size={24} className="text-[#c96f4f]" />
                </div>

                <p className="text-sm font-semibold text-[#2f241f]">
                  Drag images or videos here
                </p>
                <p className="mt-1 text-sm text-[#8a7668]">
                  Upload multiple files. The first image becomes the thumbnail.
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadfd6] bg-white px-4 py-2.5 text-sm font-medium text-[#4e3b31] shadow-sm transition hover:border-[#d0bfb3]"
                  >
                    <ImagePlus size={16} className="text-[#c96f4f]" />
                    Add Images
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadfd6] bg-white px-4 py-2.5 text-sm font-medium text-[#4e3b31] shadow-sm transition hover:border-[#d0bfb3]"
                  >
                    <Video size={16} className="text-[#c96f4f]" />
                    Add Videos
                  </button>
                </div>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) {
                    handleMediaSelection(event.target.files, "image");
                    event.target.value = "";
                  }
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) {
                    handleMediaSelection(event.target.files, "video");
                    event.target.value = "";
                  }
                }}
              />

              {mediaDrafts.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {mediaDrafts.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fdfaf7]"
                    >
                      <div className="aspect-square bg-[#f5ebe3]">
                        {item.type === "image" ? (
                          <img src={item.preview} alt="" className="h-full w-full object-cover" />
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
                        onClick={() => removeMedia(item.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white transition hover:bg-black/70"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition ${isSubmitting
                    ? "bg-[#dba38d] text-white"
                    : "bg-[#c96f4f] text-white shadow-lg shadow-[#c96f4f]/15 hover:bg-[#b8614a]"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving product...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Product
                  </>
                )}
              </button>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-fit rounded-3xl bg-white p-5 shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] sm:p-6"
          >
            <div className="mb-5 flex items-center gap-2">
              <Eye size={16} className="text-[#c96f4f]" />
              <h3 className="text-base font-semibold text-[#2f241f]">Live Preview</h3>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fdfaf7]">
              <div className="aspect-[1/1] bg-[#f5ebe3]">
                {previewImage ? (
                  <img src={previewImage.preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-center">
                    <div>
                      <ImagePlus size={28} className="mx-auto text-[#d0bfb3]" />
                      <p className="mt-2 text-xs text-[#b0a298]">First uploaded image appears here</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fef0e7] px-3 py-1 text-xs font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3]">
                  <FolderTree size={10} />
                  {previewCategoryName}
                </span>

                <h4 className="mt-3 text-lg font-semibold text-[#2f241f]">
                  {formValues.name || "Product Name"}
                </h4>

                <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#8a7668]">
                  {formValues.description || "Product description preview will appear here."}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <p className="text-2xl font-bold text-[#c96f4f]">
                    {formValues.price ? `₹${formValues.price}` : "₹0"}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-[#fffaf6] px-3 py-2 text-[#6A5D55] ring-1 ring-[#f1dfd3]">
                    Size: <span className="font-semibold">{formValues.size || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </>
  );
}
