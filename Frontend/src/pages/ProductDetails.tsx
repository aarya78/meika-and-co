"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  Play,
  Share2,
  Shield,
  Sparkles,
  Tag,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { fetchProductById, type Product } from "@/services/productService";
import { useSettings } from "@/contexts/SettingsContext";
import SEO from '@/components/SEO'
import { buildSrcSet } from '@/lib/image'

function ProductDetailsSkeleton() {
  return (
    <section className="min-h-screen bg-[#fdf6f0] py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="h-[340px] animate-pulse rounded-[24px] bg-white shadow-[0_8px_30px_rgba(120,90,70,0.08)] ring-1 ring-[#eadfd6] sm:h-[460px] sm:rounded-3xl lg:h-[620px]" />
            <div className="mt-3 flex gap-2.5 sm:mt-4 sm:gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 w-16 animate-pulse rounded-xl bg-[#f5ebe3] sm:h-20 sm:w-20 sm:rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="h-7 w-28 animate-pulse rounded-full bg-[#efe3da] sm:h-8 sm:w-36" />
            <div className="h-10 w-60 animate-pulse rounded-full bg-[#f2e5dd] sm:h-14 sm:w-80" />
            <div className="h-4 w-44 animate-pulse rounded-full bg-[#f4e9e2] sm:h-5 sm:w-52" />
            <div className="h-8 w-32 animate-pulse rounded-full bg-[#f0e0d6] sm:h-10 sm:w-40" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-[#f4e9e2]" />
              <div className="h-4 w-full animate-pulse rounded-full bg-[#f4e9e2]" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#f4e9e2]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-white ring-1 ring-[#eadfd6] sm:h-16 sm:rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const { settings, loading: settingsLoading } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Product not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const productData = await fetchProductById(id);
        setProduct(productData);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load this product.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [product?.id]);

  const selectedMedia = product?.media[currentIndex] ?? null;

  const discountPercentage = useMemo(() => {
    if (!product || product.salePrice === null || product.salePrice >= product.price) {
      return null;
    }

    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  }, [product]);

  const whatsappUrl = useMemo(() => {
    if (!product || !settings?.whatsapp_number) {
      return null;
    }

    const message = `Hi, I'm interested in ${product.name}`;
    return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
  }, [product, settings]);

  const handleShare = async () => {
    if (!product) {
      return;
    }

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareFeedback("Product link copied to clipboard.");
      window.setTimeout(() => setShareFeedback(null), 2500);
    } catch {
      setShareFeedback("Unable to share right now.");
      window.setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  if (isLoading || settingsLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#fdf6f0] px-6">
        <div className="text-center">
          <p className="text-6xl">Item unavailable</p>
          <h2 className="mt-4 text-2xl font-semibold text-[#2f241f]">Product not found</h2>
          <p className="mt-2 text-[#7b685d]">{error ?? "This product may no longer be available."}</p>
        </div>
      </section>
    );
  }
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "sku": product.id?.toString?.() ?? undefined,
    "image": product.media.map((m) => m.url),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": product.salePrice ?? product.price,
      "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": window.location.href,
    },
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        image={selectedMedia?.url}
        pathname={`/products/${product.id}`}
        schema={productSchema}
      />
      <section className="min-h-screen overflow-x-hidden bg-[#fdf6f0] py-14 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="min-w-0"
            >
              <div className="group relative overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgba(120,90,70,0.08)] ring-1 ring-[#eadfd6] sm:rounded-3xl">
                <div className="relative h-[320px] overflow-hidden sm:h-[420px] lg:h-[620px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedMedia?.type}-${selectedMedia?.url}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="h-full w-full"
                    >
                      {selectedMedia?.type === "video" ? (
                        <video controls className="h-full w-full object-cover">
                          <source src={selectedMedia.url} type="video/mp4" />
                        </video>
                      ) : (
                        (() => {
                          const srcsets = selectedMedia ? buildSrcSet(selectedMedia.url) : null;

                          if (srcsets) {
                            return (
                              <picture>
                                <img
                                  src={selectedMedia!.url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  draggable={false}
                                  loading="eager"
                                  decoding="async"
                                  fetchPriority="high"
                                  width={1200}
                                  height={900}
                                />
                              </picture>
                            );
                          }

                          return (
                            <img
                              src={selectedMedia?.url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              draggable={false}
                              loading="eager"
                              fetchPriority="high"
                            />
                          );
                        })()
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {selectedMedia?.type === "video" && (
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#4e3b31] shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
                      <Play size={12} />
                      Video Preview
                    </div>
                  )}

                  {product.media.length > 1 && (
                    <>
                      <button
                        aria-label="Previous media"
                        onClick={() =>
                          setCurrentIndex((prev) => (prev === 0 ? product.media.length - 1 : prev - 1))
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#eadfd6] bg-white/90 p-2 text-[#4e3b31] shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white sm:left-3 sm:p-2.5"
                      >
                        <ChevronLeft size={18} className="sm:size-5" />
                      </button>
                      <button
                        aria-label="Next media"
                        onClick={() =>
                          setCurrentIndex((prev) => (prev === product.media.length - 1 ? 0 : prev + 1))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#eadfd6] bg-white/90 p-2 text-[#4e3b31] shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white sm:right-3 sm:p-2.5"
                      >
                        <ChevronRight size={18} className="sm:size-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {product.media.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:mt-4 sm:gap-3">
                  {product.media.map((media, index) => (
                    <button
                      key={`${media.url}-${index}`}
                      aria-label={`Select media ${index + 1}`}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-300 ${index === currentIndex
                        ? "ring-2 ring-[#c96f4f] ring-offset-2 ring-offset-[#fdf6f0]"
                        : "ring-1 ring-[#eadfd6] hover:ring-[#d0bfb3]"
                        }`}
                    >
                      {media.type === "video" ? (
                        <div className="flex h-16 w-16 items-center justify-center bg-[#f5ebe3] sm:h-20 sm:w-20">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm sm:h-8 sm:w-8">
                            <Play size={14} className="ml-0.5 text-[#c96f4f]" />
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const s = buildSrcSet(media.url);

                          if (s) {
                            return (
                              <picture>
                                <img
                                  src={media.url}
                                  alt={`${product.name} thumbnail`}
                                  className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                                  draggable={false}
                                  loading="lazy"
                                  decoding="async"
                                  width={160}
                                  height={160}
                                />
                              </picture>
                            );
                          }

                          return (
                            <img
                              src={media.url}
                              alt={`${product.name} thumbnail`}
                              className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                              draggable={false}
                              loading="lazy"
                            />
                          );
                        })()
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              className="min-w-0 lg:sticky lg:top-28 lg:h-fit"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fef0e7] px-3 py-1 text-[11px] font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3] sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-sm">
                  <Sparkles size={12} className="sm:size-[14px]" />
                  {product.categoryName}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#D97757] px-3 py-1 text-[11px] font-medium text-white sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-sm">
                    <Sparkles size={12} className="sm:size-[14px]" />
                    Featured
                  </span>
                )}
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ring-1 sm:px-4 sm:py-1.5 sm:text-sm ${product.isActive
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-red-50 text-red-500 ring-red-100"
                    }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h1 className="mt-4 font-serif text-[1.85rem] font-bold leading-tight text-[#2f241f] sm:mt-5 sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:mt-5 sm:gap-3">
                <p className="text-3xl font-bold text-[#c96f4f] sm:text-4xl">
                  Rs. {product.salePrice ?? product.price}
                </p>
                {product.salePrice !== null && product.salePrice < product.price && (
                  <span className="text-sm text-[#b0a298] line-through sm:text-lg">Rs. {product.price}</span>
                )}
                {discountPercentage !== null && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 ring-1 ring-green-200 sm:px-2.5 sm:text-sm">
                    {discountPercentage}% off
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-6 text-[#6A5D55] sm:mt-6 sm:text-base sm:leading-relaxed">
                {product.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#eadfd6] sm:rounded-2xl sm:p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#c96f4f]">
                    <Tag size={14} className="sm:size-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]">Size</span>
                  </div>
                  <p className="text-xs font-medium text-[#4e3b31] sm:text-sm">{product.size || "Not specified"}</p>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#eadfd6] sm:rounded-2xl sm:p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#c96f4f]">
                    <Shield size={14} className="sm:size-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]">Status</span>
                  </div>
                  <p className="text-xs font-medium text-[#4e3b31] sm:text-sm">
                    {product.isActive ? "Available to order" : "Temporarily unavailable"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:gap-3 lg:mt-10">
                {whatsappUrl ? (
                  <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition hover:bg-[#20bd5a] sm:flex-1 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle size={18} className="sm:size-5" />
                    WhatsApp Inquiry
                  </motion.a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2.5 rounded-xl bg-[#b9d9c6] px-4 py-3.5 text-sm font-semibold text-white sm:flex-1 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
                  >
                    <Loader2 size={18} className="animate-spin sm:size-5" />
                    Loading Contact
                  </button>
                )}

                <motion.button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-[#eadfd6] bg-white px-4 py-3.5 text-sm font-semibold text-[#4e3b31] transition hover:border-[#d0bfb3] hover:text-[#2f241f] sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={18} className="sm:size-5" />
                  Share Product
                </motion.button>
              </div>

              {shareFeedback && (
                <p className="mt-2 text-xs text-[#8a7668] sm:mt-3 sm:text-sm">{shareFeedback}</p>
              )}

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#fef8f2] p-3 text-xs leading-5 text-[#8a7668] ring-1 ring-[#eadfd6] sm:mt-6 sm:rounded-2xl sm:p-4 sm:text-sm">
                <Shield size={16} className="mt-0.5 shrink-0 text-[#c96f4f]" />
                Each piece is handcrafted and may take 3-5 days for dispatch. Quality is carefully checked before shipping.
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}