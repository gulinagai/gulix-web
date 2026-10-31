import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { Link, NavLink, useLocation, useMatch, useNavigate } from "react-router";
import { categories } from "../../data/catalog.ts";
import { CategoryMenu } from "./CategoryMenu.tsx";
import { Container } from "./Container.tsx";
import { Wordmark } from "./Wordmark.tsx";

const categoryNavItems = categories.map((category) => ({
  id: category.id,
  name: category.name,
}));

const linkClassName = "text-sm font-medium text-ink/80 hover:text-ink";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const home = useMatch({ path: "/", end: true });
  const location = useLocation();
  const navigate = useNavigate();
  const returnToTop = useRef(false);
  const onHome = Boolean(home);

  useLayoutEffect(() => {
    if (!onHome || !returnToTop.current) {
      return;
    }

    returnToTop.current = false;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [onHome]);

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

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  function onLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!onHome) {
      returnToTop.current = true;
      return;
    }

    event.preventDefault();

    if (window.scrollY === 0) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

    if (location.hash) {
      navigate("/", { replace: true });
    }
  }

  return (
    <header id="inicio" className="sticky top-0 z-30 border-b border-line bg-page">
      <Container className="flex h-16 items-center gap-6 lg:h-[4.5rem] lg:gap-8">
        <Link to="/" className="shrink-0" aria-label="GuliX" onClick={onLogoClick}>
          <Wordmark />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `relative text-sm font-medium ${isActive ? "text-ink" : "text-ink/80 hover:text-ink"}`
                }
              >
                {({ isActive }) => (
                  <>
                    Início
                    {isActive ? (
                      <span className="absolute -bottom-2 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand" />
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
            <CategoryMenu layout="bar" items={categoryNavItems} />
            <li>
              <NavLink
                to="/produtos"
                className={({ isActive }) =>
                  `relative text-sm font-medium ${isActive ? "text-ink" : "text-ink/80 hover:text-ink"}`
                }
              >
                {({ isActive }) => (
                  <>
                    Produtos
                    {isActive ? (
                      <span className="absolute -bottom-2 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand" />
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <button type="button" className={linkClassName}>
                Monte seu PC
              </button>
            </li>
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
            <li>
              <NavLink
                to="/"
                end
                className="flex min-h-11 items-center text-sm font-medium text-ink"
                onClick={closeMobileMenu}
              >
                Início
              </NavLink>
            </li>
            <CategoryMenu
              key={menuOpen ? "aberto" : "fechado"}
              layout="panel"
              items={categoryNavItems}
              onNavigate={closeMobileMenu}
            />
            <li>
              <NavLink
                to="/produtos"
                className="flex min-h-11 items-center text-sm font-medium text-ink"
                onClick={closeMobileMenu}
              >
                Produtos
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className="flex min-h-11 items-center text-sm font-medium text-ink"
                onClick={closeMobileMenu}
              >
                Monte seu PC
              </button>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
