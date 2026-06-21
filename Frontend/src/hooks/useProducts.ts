import { useCallback, useEffect, useState } from "react";

import { fetchProducts, type Product } from "@/services/productService";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load products.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return {
    products,
    setProducts,
    isLoading,
    error,
    reloadProducts: loadProducts,
  };
}
