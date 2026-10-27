import { Tag } from "lucide-react";
import { Container } from "./Container.tsx";

export function AnnouncementBar() {
  return (
    <div className="border-b border-line bg-page text-xs text-muted">
      <Container className="flex items-center justify-between gap-4 py-2">
        <p className="inline-flex items-center gap-2">
          <Tag aria-hidden="true" size={14} />
          Frete especial em produtos selecionados
        </p>
        <p className="hidden sm:block">Até 12x sem juros / Curadoria própria</p>
      </Container>
    </div>
  );
}
