import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "./Container.tsx";
import { Wordmark } from "./Wordmark.tsx";

const navItems = [
  { href: "#inicio", label: "Início" },
  { href: "#produtos", label: "Produtos" },
  { href: "#categorias", label: "Categorias" },
  { href: "#ofertas", label: "Ofertas" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header id="inicio" className="sticky top-0 z-30 border-b border-line bg-page">
      <Container className="flex h-16 items-center gap-6 lg:h-[4.5rem] lg:gap-8">
        <a href="#inicio" className="shrink-0" aria-label="GuliX">
          <Wordmark />
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {navItems.map((item) => {
              const current = item.href === "#inicio";
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`relative text-sm font-medium ${
                      current ? "text-ink" : "text-ink/80 hover:text-ink"
                    }`}
                  >
                    {item.label}
                    {current ? (
                      <span className="absolute -bottom-2 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand" />
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <label className="relative ml-auto hidden w-full max-w-md lg:block">
          <span className="sr-only">Buscar produtos</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            type="search"
            placeholder="Buscar produtos..."
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-line bg-paper pr-3 pl-10 text-sm text-ink placeholder:text-muted"
          />
        </label>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <a
            href="#inicio"
            className="inline-flex h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-ink"
          >
            <User aria-hidden="true" size={18} />
            <span className="hidden sm:inline">Minha conta</span>
          </a>
          <button
            type="button"
            aria-label="Carrinho"
            className="inline-flex h-11 w-11 items-center justify-center text-ink"
          >
            <ShoppingBag aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </div>
      </Container>

      <Container className="pb-3 lg:hidden">
        <label className="relative block">
          <span className="sr-only">Buscar produtos</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            type="search"
            placeholder="Buscar produtos..."
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-line bg-paper pr-3 pl-10 text-base text-ink placeholder:text-muted"
          />
        </label>
        <nav
          id="menu-principal"
          aria-label="Principal"
          className={menuOpen ? "mt-2 border-t border-line pt-2" : "hidden"}
        >
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex min-h-11 items-center text-sm font-medium text-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
