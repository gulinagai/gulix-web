import { Benefits } from "../components/home/Benefits.tsx";
import { CategorySection } from "../components/home/CategorySection.tsx";
import { ChooseYourSide } from "../components/home/ChooseYourSide.tsx";
import { FeaturedProducts } from "../components/home/FeaturedProducts.tsx";
import { Hero } from "../components/home/Hero.tsx";

export function HomePage() {
  return (
    <main id="conteudo" className="space-y-8 sm:space-y-10">
      <Hero />
      <ChooseYourSide />
      <CategorySection />
      <FeaturedProducts />
      <Benefits />
    </main>
  );
}
