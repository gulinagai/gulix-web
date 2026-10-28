import { Link } from "react-router";
import { Container } from "../components/layout/Container.tsx";

export function NotFoundPage() {
  return (
    <main id="conteudo" className="flex flex-1 items-center py-16 sm:py-24">
      <Container>
        <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
          <span className="h-px w-8 bg-brand" />
          404
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-6xl">
          Página não encontrada
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
          O endereço não corresponde a uma página da GuliX.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-action px-5 text-sm font-semibold text-white hover:bg-action-hover"
        >
          Voltar ao início
        </Link>
      </Container>
    </main>
  );
}
