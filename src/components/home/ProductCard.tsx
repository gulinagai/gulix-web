import type { Product } from "../../data/catalog.ts";
import { Heart } from "lucide-react";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <div className="relative overflow-hidden rounded-2xl bg-paper shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        <img
          src={product.image}
          alt=""
          className="aspect-square w-full object-cover"
        />
        {product.badge ? (
          <span className="absolute top-3 left-3 rounded-md bg-action px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
            {product.badge}
          </span>
        ) : null}
        <button
          type="button"
          aria-label={`Favoritar ${product.name}`}
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-page shadow-sm"
        >
          <Heart aria-hidden="true" size={16} />
        </button>
      </div>
      <div className="pt-3">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          {product.category}
        </p>
        <h3 className="mt-1 text-[15px] font-semibold text-ink">{product.name}</h3>
        <p className="mt-2 text-lg font-bold tracking-tight text-ink">
          {product.price}
          {product.compareAt ? (
            <span className="ml-2 text-sm font-medium text-muted line-through">
              {product.compareAt}
            </span>
          ) : null}
        </p>
        {product.installment ? (
          <p className="mt-1 text-xs text-muted">{product.installment}</p>
        ) : null}
      </div>
    </article>
  );
}
