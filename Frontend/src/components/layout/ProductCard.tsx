import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface ProductCardProps {
  id: number | string;
  name: string;
  image: string;
  categoryName?: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  featured?: boolean;
}

export default function ProductCard({
  id,
  name,
  image,
  categoryName,
  description,
  price,
  salePrice,
  featured = false,
}: ProductCardProps) {
  return (
    <Link
      to={`/products/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#eadfd6] bg-white shadow-[0_12px_30px_rgba(120,90,70,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(120,90,70,0.12)] sm:rounded-[28px]"
    >
      <div className="relative aspect-[0.88] overflow-hidden bg-[#f5ebe3] sm:aspect-[0.94]">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {featured && (
          <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#D97757] px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg shadow-[#d97757]/20 sm:left-3 sm:top-3 sm:px-3 sm:text-[11px]">
            <Sparkles size={11} className="sm:size-3" />
            Featured
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        {categoryName && (
          <span className="inline-flex w-fit rounded-full bg-[#fef0e7] px-2.5 py-1 text-[10px] font-medium text-[#c96f4f] ring-1 ring-[#f5d6c3] sm:px-3 sm:text-[11px]">
            {categoryName}
          </span>
        )}

        <h3 className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-[#2f241f] sm:mt-3 sm:min-h-[2.75rem] sm:text-lg sm:leading-6">
          {name}
        </h3>

        {description && (
          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-[#6A5D55] sm:mt-2 sm:min-h-[3rem] sm:text-sm sm:leading-6">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-3 sm:gap-2 sm:pt-4">
          <p className="text-base font-bold text-[#c96f4f] sm:text-xl">
            Rs. {salePrice ?? price}
          </p>
          {salePrice !== null && salePrice !== undefined && salePrice < price && (
            <span className="text-[11px] text-[#b0a298] line-through sm:text-sm">Rs. {price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
