import React from "react";
import { Link } from "react-router-dom";
import { getPrimaryProductThumbnail } from "@/services/productService";

interface Props {
  product: any;
}

function ProductCardInner({ product }: Props) {
  const thumbnail = getPrimaryProductThumbnail(product);
  console.log("thumbnail", thumbnail);
  console.log("thumbnail.url", thumbnail?.url);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:rounded-3xl"
      aria-label={`View details for ${product.name}`}
    >
      <div className="relative overflow-hidden">
        {thumbnail ? (
          <picture>
            <img
              src={thumbnail.url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="aspect-[0.88] w-full object-cover transition duration-700 group-hover:scale-110 sm:aspect-[0.94]"
            />
          </picture>
        ) : (
          <img
            src={thumbnail.url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="aspect-[0.88] w-full object-cover transition duration-700 group-hover:scale-110 sm:aspect-[0.94]"
          />
        )}

        {product.featured && (
          <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#D97757] px-2.5 py-1 text-[10px] font-semibold text-white sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
            Featured
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <span className="w-fit rounded-full bg-[#fef0e7] px-2.5 py-1 text-[10px] font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3] sm:px-3 sm:text-xs">
          {product.categoryName}
        </span>

        <h3 className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-neutral-900 sm:mt-3 sm:min-h-[2.75rem] sm:text-xl sm:leading-7">
          {product.name}
        </h3>

        <p
          className="hidden overflow-hidden text-sm leading-6 text-[#6A5D55] sm:[display:-webkit-box] sm:[-webkit-line-clamp:2] sm:[-webkit-box-orient:vertical]"
        >
          {product.description}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-0 sm:gap-2 sm:pt-0">
          <p className="text-base font-bold text-[#c96f4f] sm:text-xl">Rs. {product.salePrice ?? product.price}</p>
        </div>

        <div className="mt-4 rounded-xl bg-neutral-900 py-2.5 text-center text-sm font-medium text-white transition hover:bg-neutral-800 sm:mt-5 sm:py-3 sm:text-base">
          View Details
        </div>
      </div>
    </Link>
  );
}

export default React.memo(ProductCardInner);
