import controleGames from "../assets/categories/controle-games.jpg";
import headsetNovaImage from "../assets/products/headset-nova.jpg";
import mousePulseImage from "../assets/products/mouse-pulse.jpg";
import notebookAuraImage from "../assets/products/notebook-aura.jpg";
import tecladoLumenImage from "../assets/products/teclado-lumen.jpg";

export type CategoryId = "tecnologia" | "games" | "audio" | "acessorios";

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export const categories: Category[] = [
  {
    id: "tecnologia",
    name: "Tecnologia",
    description: "Notebooks e dispositivos para o dia a dia.",
    image: notebookAuraImage,
  },
  {
    id: "games",
    name: "Games",
    description: "Controles e consoles.",
    image: controleGames,
  },
  {
    id: "audio",
    name: "Áudio",
    description: "Fones e som para ouvir em qualquer lugar.",
    image: headsetNovaImage,
  },
  {
    id: "acessorios",
    name: "Acessórios",
    description: "Teclados, mouses e itens do setup.",
    image: tecladoLumenImage,
  },
];

const headsetNova: Product = {
  id: "headset-nova",
  name: "Headset Nova",
  price: "R$ 459,90",
  image: headsetNovaImage,
};

export const highlightProduct = headsetNova;

export const products: Product[] = [
  {
    id: "notebook-aura",
    name: "Notebook Aura 14",
    price: "R$ 4.299,00",
    image: notebookAuraImage,
  },
  headsetNova,
  {
    id: "teclado-lumen",
    name: "Teclado Lumen",
    price: "R$ 389,00",
    image: tecladoLumenImage,
  },
  {
    id: "mouse-pulse",
    name: "Mouse Pulse",
    price: "R$ 219,90",
    image: mousePulseImage,
  },
];
