import { useMemo } from "react";
import { ArrowRight, FolderTree } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "./ProductCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { getPrimaryProductThumbnail } from "@/services/productService";

function CollectionsSkeleton() {
  return (
    <section id="collection" className="bg-[#FFF9F5] py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 text-center sm:mb-24">
          <div className="mx-auto h-8 w-36 animate-pulse rounded-full bg-[#f6e6d7]" />
          <div className="mx-auto mt-4 h-10 w-[18rem] max-w-full animate-pulse rounded-full bg-[#efe3da] sm:mt-6 sm:h-12 sm:w-[28rem]" />
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="mb-18 sm:mb-28">
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10 sm:gap-6">
              <div className="space-y-3">
                <div className="h-8 w-40 animate-pulse rounded-full bg-[#efe3da] sm:h-10 sm:w-64" />
                <div className="h-4 w-48 animate-pulse rounded-full bg-[#f3e7df] sm:h-5 sm:w-80" />
              </div>
              <div className="h-10 w-24 animate-pulse rounded-full bg-white sm:h-12 sm:w-32" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((__, cardIndex) => (
                <div
                  key={cardIndex}
                  className="overflow-hidden rounded-[28px] border border-[#eadfd6] bg-white p-3 shadow-[0_12px_30px_rgba(120,90,70,0.06)]"
                >
                  <div className="aspect-[0.94] animate-pulse rounded-[22px] bg-[#f5ebe3]" />
                  <div className="mt-4 h-4 w-24 animate-pulse rounded-full bg-[#f1e4dc]" />
                  <div className="mt-3 h-6 w-40 animate-pulse rounded-full bg-[#efe3da]" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-[#f3e7df]" />
                  <div className="mt-5 h-6 w-24 animate-pulse rounded-full bg-[#f1e4dc]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CollectionsEmpty({ message }: { message?: string }) {
  return (
    <section id="collection" className="bg-[#FFF9F5] py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-[28px] border border-[#eadfd6] bg-white px-5 py-14 text-center shadow-[0_16px_40px_rgba(120,90,70,0.08)] sm:rounded-[32px] sm:px-6 sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#fff4ed] ring-1 ring-[#f5d6c3] sm:h-20 sm:w-20 sm:rounded-[28px]">
            <FolderTree size={32} className="text-[#c96f4f]" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-[#2f241f] sm:mt-6 sm:text-2xl">Collections are getting ready</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8a7668] sm:text-base">
            {message || "Once products and categories are available, each collection will appear here automatically."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ProductSection() {
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { products, isLoading: productsLoading, error: productsError } = useProducts();

  const groupedCollections = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          products: products.filter(
            (product) =>
              product.isActive &&
              product.featured === true &&
              String(product.categoryId) === String(category.id),
          ),
        }))
        .filter((category) => category.products.length > 0),
    [categories, products],
  );

  if (categoriesLoading || productsLoading) {
    return <CollectionsSkeleton />;
  }

  if (categoriesError || productsError) {
    return <CollectionsEmpty message={categoriesError || productsError || undefined} />;
  }

  if (!groupedCollections.length) {
    return <CollectionsEmpty />;
  }


  return (
    <section id="collection" className="overflow-x-hidden bg-[#FFF9F5] py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-14 text-center sm:mb-24">
          <span className="rounded-full bg-[#F6E6D7] px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-[#D97757] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.3em]">
            Our Collections
          </span>

          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-[#2D2D2D] sm:mt-6 sm:text-5xl">
            Handmade Companions
            <br />
            Crafted With Love
          </h2>
        </div>

        {groupedCollections.map((collection) => (
          <div key={collection.id} className="mb-16 sm:mb-28">
            <div className="mb-6 flex items-start justify-between gap-4 sm:mb-10 sm:gap-6">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#2D2D2D] sm:text-4xl">
                  {collection.name}
                </h3>
              </div>

              <Link
                to={`/products?category=${collection.slug}`}
                className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-[#eadfd6] bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#4e3b31] shadow-[0_8px_24px_rgba(120,90,70,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9b8a1] hover:bg-[#fffaf6] hover:text-[#c96f4f] hover:shadow-[0_12px_30px_rgba(201,111,79,0.14)] sm:gap-3 sm:px-5 sm:py-3 sm:text-sm"
              >
                <span>View All</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f7ede6] text-[#b46b4e] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#fde7db] group-hover:text-[#c96f4f] sm:h-8 sm:w-8">
                  <ArrowRight size={14} className="sm:size-4" />
                </span>
              </Link>
            </div>

            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-3 sm:-ml-4">
                {collection.products.map((product) => {
                  const thumbnail = getPrimaryProductThumbnail(product);
                  if (!thumbnail) {
                    return null;
                  }

                  return (
                    <CarouselItem
                      key={product.id}
                      className="basis-1/2 pl-3 sm:basis-1/2 sm:pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        image={thumbnail.url}
                        categoryName={product.categoryName}
                        description={product.description}
                        price={product.price}
                        salePrice={product.salePrice}
                        featured={product.featured}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <CarouselPrevious className="left-2 z-50 hidden h-10 w-10 rounded-full border-0 bg-white shadow-xl transition-all hover:scale-110 hover:bg-white sm:flex sm:h-12 sm:w-12 sm:left-0" />
              <CarouselNext className="right-2 z-50 hidden h-10 w-10 rounded-full border-0 bg-white shadow-xl transition-all hover:scale-110 hover:bg-white sm:flex sm:h-12 sm:w-12 sm:right-0" />
            </Carousel>
          </div>
        ))}
      </div>
    </section>
  );
}
