import type { FormEvent } from "react";
import { Mail } from "lucide-react";
import { Container } from "../layout/Container.tsx";

export function Newsletter() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className="py-6 pb-16 sm:py-8" aria-labelledby="titulo-newsletter">
      <Container>
        <div className="grid items-center gap-8 rounded-3xl border border-line bg-paper px-6 py-8 sm:px-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" />
              Newsletter
            </p>
            <h2
              id="titulo-newsletter"
              className="mt-4 font-serif text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-ink"
            >
              Fique por dentro
              <br />
              das novidades
            </h2>
            <p className="mt-3 text-sm text-muted">
              Receba novidades, lançamentos e ofertas selecionadas.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block flex-1">
                <span className="sr-only">E-mail</span>
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                  size={16}
                />
                <input
                  type="email"
                  required
                  placeholder="Seu melhor e-mail"
                  className="h-12 w-full rounded-lg border border-line bg-page pr-3 pl-10 text-sm text-ink placeholder:text-muted"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-action px-5 text-sm font-semibold text-white hover:bg-action-hover"
              >
                Quero receber
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Ao assinar, você concorda em receber comunicações da GuliX.
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}
