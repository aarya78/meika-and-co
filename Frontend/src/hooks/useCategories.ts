import { useCallback, useEffect, useState } from "react";

import { fetchCategories, type Category } from "@/services/categoryService";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load categories.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return {
    categories,
    error,
    isLoading,
    reloadCategories: loadCategories,
  };
}
