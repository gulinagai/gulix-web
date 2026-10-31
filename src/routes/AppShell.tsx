import { Outlet, useMatch } from "react-router";
import { AnnouncementBar } from "../components/layout/AnnouncementBar.tsx";
import { Footer } from "../components/layout/Footer.tsx";
import { Header } from "../components/layout/Header.tsx";

export function AppShell() {
  const home = useMatch({ path: "/", end: true });
  const catalog = useMatch("/produtos");

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      {home || catalog ? null : <AnnouncementBar />}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-action focus:px-4 focus:py-2 focus:text-white"
      >
        Ir para o conteúdo
      </a>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
