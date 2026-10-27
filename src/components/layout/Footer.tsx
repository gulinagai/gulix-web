import type { ReactNode } from "react";
import { Container } from "./Container.tsx";
import { Wordmark } from "./Wordmark.tsx";

function SocialIcon({ children, label }: { children: ReactNode; label: string }) {
  return (
    <a
      href="#inicio"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15"
    >
      {children}
    </a>
  );
}

const columns = [
  {
    title: "Navegar",
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Produtos", href: "#produtos" },
      { label: "Categorias", href: "#categorias" },
      { label: "Ofertas", href: "#ofertas" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Central de ajuda", href: "#inicio" },
      { label: "Prazos e entregas", href: "#inicio" },
      { label: "Trocas e devoluções", href: "#inicio" },
      { label: "Fale conosco", href: "#inicio" },
    ],
  },
  {
    title: "Minha conta",
    links: [
      { label: "Meus pedidos", href: "#inicio" },
      { label: "Favoritos", href: "#inicio" },
      { label: "Endereços", href: "#inicio" },
      { label: "Minha conta", href: "#inicio" },
    ],
  },
];

const payments = ["VISA", "MASTERCARD", "PIX", "BOLETO"];

export function Footer() {
  return (
    <footer className="bg-inverse text-white">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Curadoria de tecnologia, áudio e casa para quem valoriza bons detalhes no dia a dia.
          </p>
          <ul className="mt-5 flex gap-3">
            <li>
              <SocialIcon label="Instagram">
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </SocialIcon>
            </li>
            <li>
              <SocialIcon label="YouTube">
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2.5" y="6" width="19" height="12" rx="3" />
                  <path d="M10 9.5v5l5-2.5z" fill="currentColor" stroke="none" />
                </svg>
              </SocialIcon>
            </li>
            <li>
              <SocialIcon label="LinkedIn">
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.5 9H4v11h2.5V9zM5.2 4C4.3 4 3.6 4.7 3.6 5.6S4.3 7.2 5.2 7.2 6.8 6.5 6.8 5.6 6.1 4 5.2 4zM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6-1.1 0-1.7.7-2 1.4-.1.2-.1.6-.1.9V20H11V9h2.4v1.5c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V20z" />
                </svg>
              </SocialIcon>
            </li>
          </ul>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-semibold tracking-[0.16em] text-white/80 uppercase">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/75 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-6 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70">FORMAS DE PAGAMENTO</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {payments.map((method) => (
              <li
                key={method}
                className="rounded border border-white/20 px-2 py-1 text-[10px] font-semibold tracking-wide"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
        <p className="max-w-sm text-right text-xs leading-relaxed text-white/60 lg:text-right">
          Protótipo de demonstração. Nenhum pedido, pagamento ou cadastro é processado de verdade.
        </p>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-white/10 py-4 text-xs text-white/55 sm:flex-row sm:justify-between">
        <p>© 2026 GuliX. Todos os direitos reservados.</p>
        <p>Feito com cuidado no Brasil.</p>
      </Container>
    </footer>
  );
}
