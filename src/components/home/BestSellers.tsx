import { ChevronLeft, ChevronRight } from "lucide-react";
import { rankingIds, products } from "../../data/catalog.ts";
import { Container } from "../layout/Container.tsx";
import { ProductCard } from "./ProductCard.tsx";

export function BestSellers() {
  const ranking = rankingIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => product !== undefined);

  return (
    <section className="border-y border-line bg-shelf py-12 sm:py-16" aria-labelledby="titulo-vendidos">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" />
              Ranking Gulix
            </p>
            <h2
              id="titulo-vendidos"
              className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl"
            >
              Mais vendidos
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Os itens que mais saem nesta seleção, do áudio à mesa de trabalho.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              aria-label="Anterior"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink"
            >
              <ChevronLeft aria-hidden="true" size={16} />
            </button>
            <button
              type="button"
              aria-label="Próximo"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink"
            >
              <ChevronRight aria-hidden="true" size={16} />
            </button>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {ranking.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
