import { products } from "../../data/catalog.ts";
import { Container } from "../layout/Container.tsx";
import { ProductCard } from "./ProductCard.tsx";

export function FeaturedProducts() {
  return (
    <section id="produtos" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="titulo-produtos">
      <Container>
        <p id="selecao-da-casa" className="flex scroll-mt-24 items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
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
          Uma seleção especial de hardware para levar seu setup a outro nível.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
