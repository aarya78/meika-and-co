"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { getPrimaryProductThumbnail } from "@/services/productService";
import SEO from '@/components/SEO'
import ProductCard from '@/components/ProductCard'

function ProductsSkeleton() {
  return (
    <section className="min-h-screen bg-[#FFF9F5] py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-40 animate-pulse rounded-full bg-[#efe3da]" />
          <div className="mx-auto mt-4 h-10 w-60 animate-pulse rounded-full bg-[#f2e5dd] sm:mt-6 sm:h-12 sm:w-72" />
          <div className="mx-auto mt-3 h-4 w-[20rem] max-w-full animate-pulse rounded-full bg-[#f4e9e2] sm:mt-4 sm:h-5 sm:w-[32rem]" />
        </div>

        <div className="mx-auto mt-8 max-w-md sm:mt-12">
          <div className="h-11 animate-pulse rounded-2xl bg-white shadow-sm sm:h-12" />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2.5 sm:mt-10 sm:gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-24 animate-pulse rounded-full bg-white sm:h-10 sm:w-28" />
          ))}
        </div>

        <div className="mt-10 grid auto-rows-fr grid-cols-2 gap-3 sm:mt-16 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[22px] border border-neutral-200 bg-white p-2.5 shadow-sm sm:rounded-3xl sm:p-3"
            >
              <div className="aspect-[0.88] animate-pulse rounded-[18px] bg-[#f5ebe3] sm:aspect-[0.94] sm:rounded-2xl" />
              <div className="mt-3 h-4 w-20 animate-pulse rounded-full bg-[#f1e4dc] sm:mt-5 sm:h-5 sm:w-24" />
              <div className="mt-3 h-5 w-28 animate-pulse rounded-full bg-[#efe3da] sm:mt-4 sm:h-6 sm:w-40" />
              <div className="mt-2 h-3.5 w-full animate-pulse rounded-full bg-[#f4e9e2] sm:mt-3 sm:h-4" />
              <div className="mt-4 h-8 animate-pulse rounded-xl bg-[#f3e7df] sm:mt-5 sm:h-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const [search, setSearch] = useState("");

  const categoryFromUrl = searchParams.get("category") ?? "all";
  const activeCategorySlug = categoryFromUrl.toLowerCase();

  useEffect(() => {
    if (activeCategorySlug === "all") {
      return;
    }

    const matchesCategory = categories.some(
      (category) => category.slug.toLowerCase() === activeCategorySlug,
    );

    if (!categoriesLoading && categories.length && !matchesCategory) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("category");
        return next;
      });
    }
  }, [activeCategorySlug, categories, categoriesLoading, setSearchParams]);

  const filters = useMemo(
    () => [
      { label: "All", slug: "all" },
      ...categories.map((category) => ({ label: category.name, slug: category.slug })),
    ],
    [categories],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.isActive) {
        return false;
      }

      const matchesCategory =
        activeCategorySlug === "all" ||
        product.categorySlug.toLowerCase() === activeCategorySlug;

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [product.name, product.description].join(" ").toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategorySlug, products, search]);

  console.log("filteredProducts", filteredProducts);
  if (categoriesLoading || productsLoading) {
    return <ProductsSkeleton />;
  }

  return (
    <>
      <SEO
        title="Products"
        description="Browse handmade fabric and crochet dolls at Meika & Co. Find personalized and custom dolls perfect for gifts across India."
        pathname="/products"
      />
      <section className="min-h-screen overflow-x-hidden bg-[#FFF9F5] py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="rounded-full border border-[#d9b8a1] bg-[#fff1e8] px-3 py-1.5 text-xs text-[#c96f4f] sm:px-4 sm:py-2 sm:text-sm">
              Handmade With Love
            </span>

            <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:mt-6 sm:text-5xl">
              Our Products
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:mt-4 sm:text-base sm:leading-7">
              Explore our handcrafted doll collections, designed to bring comfort, joy and beautiful memories.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-md sm:mt-12">
            <div className="flex items-center rounded-2xl border border-neutral-200 bg-white px-3.5 shadow-sm sm:px-4">
              <Search className="h-4 w-4 text-neutral-500 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search dolls..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full bg-transparent px-2.5 text-sm text-neutral-900 outline-none sm:h-12 sm:px-3 sm:text-base"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3">
            {filters.map((filter) => (
              <button
                key={filter.slug}
                onClick={() =>
                  setSearchParams((current) => {
                    const next = new URLSearchParams(current);
                    if (filter.slug === "all") {
                      next.delete("category");
                    } else {
                      next.set("category", filter.slug);
                    }
                    return next;
                  })
                }
                className={`rounded-full px-3.5 py-2 text-xs transition-all duration-300 sm:px-5 sm:text-sm ${activeCategorySlug === filter.slug
                    ? "bg-[#D97757] text-white shadow-lg shadow-[#d97757]/20"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {(categoriesError || productsError) && (
            <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-red-100 bg-white px-4 py-4 text-center text-sm text-red-500 shadow-sm sm:mt-8 sm:px-6 sm:py-5">
              {categoriesError || productsError}
            </div>
          )}

          <div className="mt-10 grid auto-rows-fr grid-cols-2 gap-3 sm:mt-16 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="mt-14 text-center sm:mt-20">
              <h3 className="text-xl font-semibold text-black sm:text-2xl">No products found</h3>
              <p className="mt-2 text-sm text-neutral-400 sm:mt-3 sm:text-base">
                Try another search term or switch to a different collection.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
