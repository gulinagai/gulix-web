import { ArrowRight, Check } from "lucide-react";
import { heroImage, highlightProduct } from "../../data/catalog.ts";
import { Container } from "../layout/Container.tsx";

const assurances = ["Até 12x sem juros", "Curadoria própria", "Produtos selecionados"];

export function Hero() {
  return (
    <section className="py-10 sm:py-14 lg:py-16" aria-labelledby="titulo-principal">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" />
              Curadoria Gulix
            </p>
            <h1
              id="titulo-principal"
              className="mt-5 font-serif text-[2.7rem] leading-[0.98] font-medium tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.4rem]"
            >
              Encontre o<br />
              que <em className="text-brand italic">combina</em>
              <br />
              com você.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Produtos selecionados, uma experiência de compra simples e tudo o que você procura em um só lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#produtos"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-white hover:bg-action-hover"
              >
                Explorar produtos
                <ArrowRight aria-hidden="true" size={16} />
              </a>
              <a
                href="#ofertas"
                className="inline-flex min-h-11 items-center rounded-lg border border-line bg-paper px-5 text-sm font-semibold text-ink"
              >
                Ver ofertas
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm text-muted">
              {assurances.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Check aria-hidden="true" className="text-brand" size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <img src={heroImage} alt="" className="aspect-[5/4] w-full object-cover" />
            </div>
            <p className="absolute top-4 right-4 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-action text-center text-[11px] leading-tight font-bold text-white">
              -25%
              <span className="text-[9px] font-semibold">NO ARIA</span>
            </p>
            <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-paper p-4 shadow-[0_12px_40px_rgba(20,20,20,0.12)] sm:right-auto sm:w-72">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                    Em destaque
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">{highlightProduct.name}</p>
                  <p className="mt-2 text-lg font-bold text-ink">
                    {highlightProduct.price}
                    {highlightProduct.compareAt ? (
                      <span className="ml-2 text-sm font-medium text-muted line-through">
                        {highlightProduct.compareAt}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted">{highlightProduct.installment}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Adicionar ${highlightProduct.name}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-ink"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
