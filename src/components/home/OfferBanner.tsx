import { ArrowRight } from "lucide-react";
import { offerImage } from "../../data/catalog.ts";
import { Container } from "../layout/Container.tsx";

export function OfferBanner() {
  return (
    <section id="ofertas" className="scroll-mt-24 py-6 sm:py-10" aria-labelledby="titulo-ofertas">
      <Container>
        <div className="grid overflow-hidden rounded-3xl bg-inverse text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" />
              Ofertas da coleção
            </p>
            <h2
              id="titulo-ofertas"
              className="mt-5 max-w-md font-serif text-4xl leading-[1.02] font-medium tracking-[-0.03em] sm:text-5xl"
            >
              Seu próximo
              <br />
              favorito está aqui.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              Descubra produtos selecionados para o seu dia a dia, com condições especiais nesta seleção.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#produtos"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-white hover:bg-action-hover"
              >
                Descobrir ofertas
                <ArrowRight aria-hidden="true" size={16} />
              </a>
              <p className="text-sm text-white/70">Seleção por tempo limitado</p>
            </div>
          </div>
          <div className="relative min-h-72">
            <img src={offerImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-inverse to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-xl bg-black/55 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-white/70">SELEÇÃO</p>
              <p className="mt-1 text-sm font-semibold">
                Áudio e tecnologia <span className="ml-3 text-white/80">até -25%</span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
