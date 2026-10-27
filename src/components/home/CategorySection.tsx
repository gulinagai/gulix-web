import { ArrowUpRight } from "lucide-react";
import { categories } from "../../data/catalog.ts";
import { Container } from "../layout/Container.tsx";

export function CategorySection() {
  return (
    <section id="categorias" className="scroll-mt-24 bg-band py-12 sm:py-16" aria-labelledby="titulo-categorias">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" />
              Navegue
            </p>
            <h2
              id="titulo-categorias"
              className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl"
            >
              Explore por categoria
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-relaxed text-muted lg:block">
            Cinco universos, uma única curadoria.
            <br />
            Escolha por onde começar.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
          {categories.map((category) => (
            <li key={category.id}>
              <article>
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={category.image} alt="" className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-md bg-paper px-2 py-1 text-[10px] font-semibold tracking-wide text-ink">
                    {category.count}
                  </span>
                </div>
                <h3 className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  {category.name}
                  <ArrowUpRight aria-hidden="true" size={14} />
                </h3>
                <p className="mt-0.5 text-sm text-muted">{category.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
