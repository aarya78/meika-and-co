"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
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
  AppDialogTitle,
} from "@/components/ui/app-dialog";
import {
  AppPopover,
  AppPopoverContent,
  AppPopoverTrigger,
} from "@/components/ui/app-popover";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  FolderTree,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
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
import axios from "axios";

import api from "@/lib/api";

type CategoryId = number | string;

interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  createdAt: string | null;
}

interface CategoryFormValues {
  name: string;
}

interface CategoryPayload {
  id?: CategoryId;
  _id?: CategoryId;
  name?: string;
  slug?: string;
  createdAt?: string | null;
  created_at?: string | null;
}

interface CategoriesResponse {
  categories?: CategoryPayload[];
  data?: CategoryPayload[];
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

interface CategoryDialogProps {
  formValues: CategoryFormValues;
  generatedSlug: string;
  isOpen: boolean;
  isSaving: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

interface CategoriesToolbarProps {
  onCreate: () => void;
  onSearchChange: (value: string) => void;
  searchQuery: string;
  totalCount: number;
  visibleCount: number;
}

function normalizeCategory(category: CategoryPayload): Category {
  return {
    id: category.id ?? category._id ?? "",
    name: category.name?.trim() ?? "",
    slug: category.slug?.trim() ?? "",
    createdAt: category.createdAt ?? category.created_at ?? null,
  };
}

function normalizeCategoriesResponse(data: CategoryPayload[] | CategoriesResponse): Category[] {
  const rawCategories = Array.isArray(data)
    ? data
    : data.categories ?? data.data ?? [];

  return rawCategories
    .map(normalizeCategory)
    .filter((category) => Boolean(category.id) && Boolean(category.name));
}

function slugifyCategoryName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCreatedAt(value: string | null) {
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

function CategoryTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6]">
      <div className="border-b border-[#eadfd6] bg-[#fdfaf7] px-5 py-4">
        <div className="h-4 w-40 animate-pulse rounded-full bg-[#efe3da]" />
      </div>

      <div className="space-y-4 p-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid animate-pulse grid-cols-[1.3fr_1fr_1fr_120px] gap-4 rounded-2xl border border-[#f3e8e1] bg-[#fffdfa] p-4"
          >
            <div className="h-4 rounded-full bg-[#f0e6df]" />
            <div className="h-4 rounded-full bg-[#f0e6df]" />
            <div className="h-4 rounded-full bg-[#f0e6df]" />
            <div className="h-4 rounded-full bg-[#f0e6df]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onClearSearch,
}: {
  hasSearch: boolean;
  onClearSearch: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] sm:py-20"
    >
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#fff4ed] ring-1 ring-[#f5d6c3]">
        <div className="absolute inset-3 rounded-[22px] border border-dashed border-[#edc7b4]" />
        <FolderTree size={34} className="text-[#c96f4f]" />
      </div>

      <h3 className="text-xl font-semibold text-[#2f241f]">
        {hasSearch ? "No categories match your search" : "No categories yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#8a7668]">
        {hasSearch
          ? "Try a different keyword or clear the search to see all categories."
          : "Create your first category to organize products and keep the catalog tidy for your team."}
      </p>

      {hasSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-5 rounded-xl bg-[#fef0e7] px-4 py-2 text-sm font-medium text-[#c96f4f] transition hover:bg-[#fce4d6]"
        >
          Clear search
        </button>
      )}
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
            className={`pointer-events-auto overflow-hidden rounded-2xl border bg-white shadow-xl ${
              toast.variant === "success"
                ? "border-emerald-100 ring-1 ring-emerald-100"
                : "border-red-100 ring-1 ring-red-100"
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  toast.variant === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {toast.variant === "success" ? <Tag size={16} /> : <Trash2 size={16} />}
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

function CategoriesToolbar({
  onCreate,
  onSearchChange,
  searchQuery,
  totalCount,
  visibleCount,
}: CategoriesToolbarProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fef0e7] shadow-sm ring-1 ring-[#f5d6c3]">
            <FolderTree size={20} className="text-[#c96f4f]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#2f241f] sm:text-3xl">
              Categories
            </h1>
            <p className="text-xs text-[#8a7668] sm:text-sm">
              {visibleCount} of {totalCount} categories
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c96f4f] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#c96f4f]/15 transition active:scale-[0.98] sm:hover:-translate-y-0.5 sm:hover:bg-[#b8614a] sm:hover:shadow-lg"
        >
          <Plus size={18} />
          Create Category
        </button>
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
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-[#eadfd6] bg-[#fdfaf7] py-2.5 pl-10 pr-10 text-sm text-[#2f241f] placeholder:text-[#c4b5aa] transition focus:border-[#c96f4f] focus:outline-none focus:ring-4 focus:ring-[#c96f4f]/10"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a298] transition hover:text-[#6A5D55]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="rounded-xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-2.5 text-sm text-[#8a7668]">
            Sorted and searchable catalog groups
          </div>
        </div>
      </motion.div>
    </>
  );
}

function CategoryDialog({
  formValues,
  generatedSlug,
  isOpen,
  isSaving,
  mode,
  onClose,
  onNameChange,
  onSubmit,
}: CategoryDialogProps) {
  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <AppDialogContent className="w-[95vw] max-w-md rounded-[28px]">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-[#eadfd6]"
            >
                  <div className="border-b border-[#f3e8e1] px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fef0e7] ring-1 ring-[#f5d6c3]">
                          {mode === "create" ? (
                            <Plus size={18} className="text-[#c96f4f]" />
                          ) : (
                            <Pencil size={18} className="text-[#c96f4f]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <AppDialogTitle className="text-lg font-bold text-[#2f241f] sm:text-xl">
                            {mode === "create" ? "Create Category" : "Edit Category"}
                          </AppDialogTitle>
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
                    <div className="space-y-5 px-5 py-5 sm:px-6">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#4e3b31]">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={formValues.name}
                          onChange={(event) => onNameChange(event.target.value)}
                          placeholder="Mini Buddies"
                          className="w-full rounded-2xl border border-[#eadfd6] bg-[#fdfaf7] px-4 py-3 text-sm text-[#2f241f] outline-none transition focus:border-[#c96f4f] focus:ring-4 focus:ring-[#c96f4f]/10"
                          disabled={isSaving}
                          required
                        />
                      </div>

                      <div className="rounded-2xl border border-[#eadfd6] bg-[#fffaf6] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b0a298]">
                          Slug Preview
                        </p>
                        <div className="mt-2 rounded-xl border border-[#f1dfd3] bg-white px-3 py-2.5 text-sm font-medium text-[#4e3b31]">
                          {generatedSlug || "slug-preview"}
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
                        {mode === "create" ? "Create Category" : "Save Changes"}
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

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<CategoryFormValues>({
    name: "",
  });
  const [editingCategoryId, setEditingCategoryId] = useState<CategoryId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileActionId, setMobileActionId] = useState<CategoryId | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const generatedSlug = useMemo(
    () => slugifyCategoryName(formValues.name),
    [formValues.name],
  );

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get<CategoryPayload[] | CategoriesResponse>("/categories");
      setCategories(normalizeCategoriesResponse(data));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load categories."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

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

  const addToast = (
    title: string,
    description: string,
    variant: ToastMessage["variant"],
  ) => {
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

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.slug]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [categories, searchQuery]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingCategoryId(null);
    setFormValues({ name: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setDialogMode("edit");
    setEditingCategoryId(category.id);
    setFormValues({
      name: category.name,
    });
    setIsDialogOpen(true);
    setMobileActionId(null);
  };

  const closeDialog = (force = false) => {
    if (isSaving && !force) {
      return;
    }

    setIsDialogOpen(false);
    setEditingCategoryId(null);
    setFormValues({ name: "" });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formValues.name.trim();
    const slug = slugifyCategoryName(trimmedName);

    if (!trimmedName || !slug) {
      addToast("Missing details", "Please enter a valid category name.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: trimmedName,
        slug,
      };

      if (dialogMode === "create") {
        await api.post("/categories", payload);
        addToast("Category created", "The category has been added successfully.", "success");
      } else if (editingCategoryId !== null) {
        await api.put(`/categories/${editingCategoryId}`, payload);
        addToast("Category updated", "The category details were saved.", "success");
      }

      closeDialog(true);
      await fetchCategories();
    } catch (saveError) {
      addToast(
        dialogMode === "create" ? "Unable to create category" : "Unable to update category",
        getErrorMessage(saveError, "Please try again in a moment."),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`/categories/${deletingCategory.id}`);
      setCategories((current) =>
        current.filter((category) => category.id !== deletingCategory.id),
      );
      addToast("Category deleted", "The category has been removed.", "success");
      setDeletingCategory(null);
      setMobileActionId(null);
    } catch (deleteError) {
      addToast(
        "Unable to delete category",
        getErrorMessage(deleteError, "Please try again in a moment."),
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
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
            <p className="truncate text-sm font-semibold text-[#2f241f]">
              {row.original.name}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "slug",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7668] transition hover:text-[#c96f4f]"
          >
            Slug
            <ArrowUpDown size={13} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-[#fef0e7] px-3 py-1 text-xs font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3]">
            {row.original.slug}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        sortingFn: "datetime",
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
          <span className="text-sm text-[#6A5D55]">
            {formatCreatedAt(row.original.createdAt)}
          </span>
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
              onClick={() => setDeletingCategory(row.original)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: filteredCategories,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <CategoriesToolbar
          onCreate={openCreateDialog}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          totalCount={categories.length}
          visibleCount={filteredCategories.length}
        />

        {loading ? (
          <CategoryTableSkeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6]"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#2f241f]">
                  Unable to load categories
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#8a7668]">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => void fetchCategories()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c96f4f] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#c96f4f]/15 transition hover:bg-[#b8614a]"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            hasSearch={Boolean(searchQuery)}
            onClearSearch={() => setSearchQuery("")}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="hidden overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6] md:block">
              <div className="max-h-[65vh] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10 bg-[#fdfaf7]">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        className="border-b border-[#eadfd6]"
                      >
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-5 py-4 text-left align-middle"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody className="divide-y divide-[#f0e8e1]">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="transition hover:bg-[#fdfaf7]"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-5 py-4 align-middle"
                          >
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
              {table.getRowModel().rows.map((row) => {
                const category = row.original;
                const isMenuOpen = mobileActionId === category.id;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(120,90,70,0.06)] ring-1 ring-[#eadfd6]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fef0e7] ring-1 ring-[#f5d6c3]">
                        <Tag size={18} className="text-[#c96f4f]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#2f241f]">
                              {category.name}
                            </h3>
                          </div>

                          <AppPopover
                            open={isMenuOpen}
                            onOpenChange={(open) =>
                              setMobileActionId(open ? category.id : null)
                            }
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
                                onClick={() => openEditDialog(category)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#4e3b31] transition hover:bg-[#faf5f0]"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingCategory(category);
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
                          <span className="inline-flex rounded-full bg-[#fef0e7] px-3 py-1 text-[11px] font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3]">
                            {category.slug}
                          </span>
                          <span className="text-xs text-[#8a7668]">
                            Created {formatCreatedAt(category.createdAt)}
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

      <CategoryDialog
        formValues={formValues}
        generatedSlug={generatedSlug}
        isOpen={isDialogOpen}
        isSaving={isSaving}
        mode={dialogMode}
        onClose={closeDialog}
        onNameChange={(value) =>
          setFormValues((current) => ({ ...current, name: value }))
        }
        onSubmit={handleFormSubmit}
      />

      <AppAlertDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && !isDeleting && setDeletingCategory(null)}
      >
        <AnimatePresence>
          {deletingCategory && (
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
                      Delete Category
                    </AppAlertDialogTitle>
                    <AppAlertDialogDescription className="mt-2 text-sm leading-6 text-[#8a7668]">
                      Are you sure you want to delete this category?
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
                        onClick={() => void handleDeleteCategory()}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                        Delete Category
                      </button>
                    </div>
              </motion.div>
            </AppAlertDialogContent>
          )}
        </AnimatePresence>
      </AppAlertDialog>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((current) => current.filter((toast) => toast.id !== id))
        }
      />
    </>
  );
}
