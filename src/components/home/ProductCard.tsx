import type { Product } from "../../data/catalog.ts";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

type ProductCardProps = {
  product: Product;
  imageHover?: boolean;
};

const imageMotion =
  "transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100";

export function ProductCard({ product, imageHover = false }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="relative min-w-0">
      <Link to={`/produtos/${product.id}`} className="block">
        <div
          className={`relative overflow-hidden rounded-2xl bg-paper shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] ${
            imageHover
              ? "group cursor-pointer border-2 border-transparent transition duration-300 hover:border-brand motion-reduce:transition-none"
              : ""
          }`}
        >
          {product.image && !imageFailed ? (
            <img
              src={product.image}
              alt=""
              className={`aspect-square w-full object-cover ${imageHover ? imageMotion : ""}`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className={`aspect-square w-full bg-shelf ${imageHover ? imageMotion : ""}`} />
          )}
          {product.badge ? (
            <span className="absolute top-3 left-3 rounded-md bg-action px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
              {product.badge}
            </span>
          ) : null}
        </div>
        <div className="pt-3">
          <p className="truncate text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
            {product.category}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold text-ink">{product.name}</h3>
          <p className="mt-2 text-lg font-bold tracking-tight text-ink">{product.price}</p>
          {product.compareAt ? (
            <p className="text-sm font-medium text-muted line-through">{product.compareAt}</p>
          ) : null}
          {product.installment ? (
            <p className="mt-1 text-xs text-muted">{product.installment}</p>
          ) : null}
        </div>
      </Link>
      <button
        type="button"
        aria-label={`Favoritar ${product.name}`}
        className={`absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-page shadow-sm ${
          imageHover
            ? "group/favorite cursor-pointer transition-colors duration-300 hover:bg-zinc-200 motion-reduce:transition-none"
            : ""
        }`}
      >
        <Heart
          aria-hidden="true"
          size={16}
          className={
            imageHover
              ? "transition-colors duration-300 group-hover/favorite:text-red-500 motion-reduce:transition-none"
              : undefined
          }
        />
      </button>
    </article>
  );
}
