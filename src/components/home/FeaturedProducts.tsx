import { useState } from "react";
import { products } from "../../data/catalog.ts";
import { Container } from "../layout/Container.tsx";
import { ProductCard } from "./ProductCard.tsx";

const filters = ["Todos", "Tecnologia", "Áudio", "Games", "Casa e decoração", "Acessórios"] as const;

type Filter = (typeof filters)[number];

export function FeaturedProducts() {
  const [filter, setFilter] = useState<Filter>("Todos");
  const visible =
    filter === "Todos" ? products : products.filter((product) => product.category === filter);

  return (
    <section id="produtos" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="titulo-produtos">
      <Container>
        <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
          <span className="h-px w-8 bg-brand" />
          Seleção da casa
        </p>
        <h2
          id="titulo-produtos"
          className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl"
        >
          Produtos em destaque
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Peças escolhidas pela nossa curadoria, prontas para acompanhar o seu dia.
        </p>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar produtos">
          {filters.map((item) => {
            const selected = item === filter;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item)}
                className={`min-h-10 rounded-full px-4 text-sm font-medium ${
                  selected ? "bg-white text-page" : "border border-line bg-paper text-ink"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted">
          {visible.length} {visible.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
