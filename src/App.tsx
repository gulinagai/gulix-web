import { AnnouncementBar } from "./components/layout/AnnouncementBar.tsx";
import { Footer } from "./components/layout/Footer.tsx";
import { Header } from "./components/layout/Header.tsx";
import { HomePage } from "./pages/HomePage.tsx";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      <AnnouncementBar />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-action focus:px-4 focus:py-2 focus:text-white"
      >
        Ir para o conteúdo
      </a>
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}
