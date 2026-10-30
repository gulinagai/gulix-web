import bannerOfertas from "../assets/catalog/banner-ofertas.jpg";
import catAcessorios from "../assets/catalog/cat-acessorios.jpg";
import catArmazenamento from "../assets/catalog/cat-armazenamento.jpg";
import catAudio from "../assets/catalog/cat-audio.jpg";
import catCasa from "../assets/catalog/cat-casa.jpg";
import catFonte from "../assets/catalog/cat-fonte.jpg";
import catGabinete from "../assets/catalog/cat-gabinete.jpg";
import catGames from "../assets/catalog/cat-games.jpg";
import catMemoria from "../assets/catalog/cat-memoria.jpg";
import catPlacaDeVideo from "../assets/catalog/cat-placa-de-video.jpg";
import catPlacaMae from "../assets/catalog/cat-placa-mae.jpg";
import catProcessador from "../assets/catalog/cat-processador.jpg";
import catTecnologia from "../assets/catalog/cat-tecnologia.jpg";
import prodAria from "../assets/catalog/prod-aria.jpg";
import prodBuds from "../assets/catalog/prod-buds.jpg";
import prodControle from "../assets/catalog/prod-controle.jpg";
import prodLamp from "../assets/catalog/prod-lamp.jpg";
import prodMouse from "../assets/catalog/prod-mouse.jpg";
import prodSpeaker from "../assets/catalog/prod-speaker.jpg";
import prodTeclado from "../assets/catalog/prod-teclado.jpg";
import prodWatch from "../assets/catalog/prod-watch.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  compareAt?: string;
  installment?: string;
  badge?: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "aria",
    name: "Fone GuliX Aria",
    category: "Áudio",
    price: "R$ 899,00",
    compareAt: "R$ 1.199,00",
    installment: "ou 12x de R$ 74,92 sem juros",
    badge: "-25%",
    image: prodAria,
  },
  {
    id: "type-75",
    name: "Teclado GuliX Type 75",
    category: "Tecnologia",
    price: "R$ 749,90",
    compareAt: "R$ 899,90",
    installment: "ou 12x de R$ 62,49 sem juros",
    badge: "-17%",
    image: prodTeclado,
  },
  {
    id: "glide-pro",
    name: "Mouse GuliX Glide Pro",
    category: "Tecnologia",
    price: "R$ 349,90",
    compareAt: "R$ 429,90",
    installment: "ou 12x de R$ 29,16 sem juros",
    badge: "-19%",
    image: prodMouse,
  },
  {
    id: "pulse",
    name: "Smartwatch GuliX Pulse",
    category: "Acessórios",
    price: "R$ 1.299,00",
    installment: "ou 12x de R$ 108,25 sem juros",
    badge: "NOVO",
    image: prodWatch,
  },
  {
    id: "bloom",
    name: "Caixa de som GuliX Bloom",
    category: "Áudio",
    price: "R$ 599,90",
    compareAt: "R$ 749,90",
    installment: "ou 12x de R$ 49,99 sem juros",
    badge: "-20%",
    image: prodSpeaker,
  },
  {
    id: "arc",
    name: "Controle GuliX Arc",
    category: "Games",
    price: "R$ 469,90",
    installment: "ou 12x de R$ 39,16 sem juros",
    badge: "ÚLTIMAS UNIDADES",
    image: prodControle,
  },
  {
    id: "echo-buds",
    name: "Fone GuliX Echo Buds",
    category: "Áudio",
    price: "R$ 349,90",
    compareAt: "R$ 399,90",
    installment: "ou 12x de R$ 29,16 sem juros",
    badge: "-13%",
    image: prodBuds,
  },
  {
    id: "halo",
    name: "Luminária GuliX Halo",
    category: "Casa e decoração",
    price: "R$ 289,90",
    installment: "ou 12x de R$ 24,16 sem juros",
    badge: "NOVO",
    image: prodLamp,
  },
];

export const highlightProduct = products[0];

export const categories = [
  {
    id: "tecnologia",
    name: "Tecnologia",
    description: "Para o dia a dia",
    count: "4 ITENS",
    image: catTecnologia,
  },
  {
    id: "audio",
    name: "Áudio",
    description: "Som que acompanha",
    count: "3 ITENS",
    image: catAudio,
  },
  {
    id: "games",
    name: "Games",
    description: "Sessões mais longas",
    count: "1 ITEM",
    image: catGames,
  },
  {
    id: "casa",
    name: "Casa e decoração",
    description: "Ambientes com caráter",
    count: "1 ITEM",
    image: catCasa,
  },
  {
    id: "acessorios",
    name: "Acessórios",
    description: "Detalhes que completam",
    count: "4 ITENS",
    image: catAcessorios,
  },
];

export const hardwareCategories = [
  {
    id: "gabinete",
    name: "Gabinete",
    description: "O corpo do setup",
    image: catGabinete,
  },
  {
    id: "placa-de-video",
    name: "Placa de Vídeo",
    description: "A imagem do jogo",
    image: catPlacaDeVideo,
  },
  {
    id: "placa-mae",
    name: "Placa-mãe",
    description: "A base da máquina",
    image: catPlacaMae,
  },
  {
    id: "processador",
    name: "Processador",
    description: "O ritmo da máquina",
    image: catProcessador,
  },
  {
    id: "memoria-ram",
    name: "Memória RAM",
    description: "Folga para jogar",
    image: catMemoria,
  },
  {
    id: "fonte",
    name: "Fonte",
    description: "Energia estável",
    image: catFonte,
  },
  {
    id: "armazenamento",
    name: "Armazenamento",
    description: "Onde tudo fica",
    image: catArmazenamento,
  },
];

export const offerImage = bannerOfertas;

export const rankingIds = ["aria", "type-75", "glide-pro", "pulse"];
