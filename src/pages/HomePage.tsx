import { Benefits } from "../components/home/Benefits.tsx";
import { BestSellers } from "../components/home/BestSellers.tsx";
import { CategorySection } from "../components/home/CategorySection.tsx";
import { ChooseYourSide } from "../components/home/ChooseYourSide.tsx";
import { FeaturedProducts } from "../components/home/FeaturedProducts.tsx";
import { Hero } from "../components/home/Hero.tsx";
import { Newsletter } from "../components/home/Newsletter.tsx";
import { OfferBanner } from "../components/home/OfferBanner.tsx";

export function HomePage() {
  return (
    <main id="conteudo">
      <Hero />
      <ChooseYourSide />
      <CategorySection />
      <FeaturedProducts />
      <OfferBanner />
      <BestSellers />
      <Benefits />
      <Newsletter />
    </main>
  );
}
