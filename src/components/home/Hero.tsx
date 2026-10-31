import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import heroPc from "../../assets/catalog/hero-pc.jpg";
import { Container } from "../layout/Container.tsx";

export function Hero() {
  return (
    <section className="pt-10 pb-8 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12" aria-labelledby="titulo-principal">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
          <div className="relative z-10 lg:-mr-10">
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" />
              Monte o seu
            </p>
            <h1
              id="titulo-principal"
              className="mt-5 font-serif text-[2.75rem] leading-[0.92] font-medium tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.75rem]"
            >
              BUILD YOUR{" "}
              <em className="block text-brand italic">LEGACY.</em>
            </h1>
            <p className="mt-5 text-lg font-medium tracking-[-0.02em] text-ink sm:text-xl">
              Seu setup. Suas regras. Sua máquina.
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Um computador com a sua cara, do primeiro componente ao último detalhe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/produtos"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-action px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-action-hover motion-reduce:transition-none"
              >
                Explorar produtos
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <a
                href="#selecao-da-casa"
                className="inline-flex min-h-11 items-center rounded-lg border border-line bg-paper px-5 text-sm font-semibold text-ink transition-colors duration-300 hover:border-brand hover:bg-brand/10 hover:text-brand motion-reduce:transition-none"
              >
                Ver ofertas
              </a>
            </div>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-full bg-brand/15 blur-3xl" />
            <div className="overflow-hidden rounded-3xl bg-shelf ring-1 ring-line">
              <img
                src={heroPc}
                alt="Computador gamer montado, com gabinete aberto e iluminação azul"
                className="aspect-[5/4] w-full object-cover object-[72%_center] sm:aspect-[4/3]"
              />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-page via-page/70 to-transparent lg:block"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
