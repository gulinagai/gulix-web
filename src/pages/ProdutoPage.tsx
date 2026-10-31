import { useParams } from "react-router";
import { Container } from "../components/layout/Container.tsx";

export function ProdutoPage() {
  const { id } = useParams();

  return (
    <main id="conteudo" className="py-16 sm:py-24">
      <Container>
        <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
          <span className="h-px w-8 bg-brand" />
          Produto
        </p>
        <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl">{id}</h1>
      </Container>
    </main>
  );
}
