export const PRICE_MIN = 0;
export const PRICE_MAX = 20_000;

export const PAGE_SIZES = [10, 20] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

export const SORT_OPTIONS = [
  { id: "preco-asc", label: "Menor preço", sort: "preco,asc" },
  { id: "preco-desc", label: "Maior preço", sort: "preco,desc" },
  { id: "nome-asc", label: "Título A-Z", sort: "nome,asc" },
  { id: "nome-desc", label: "Título Z-A", sort: "nome,desc" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export type CatalogRef = {
  id: number;
  nome: string;
};

export type CatalogProduct = {
  id: number;
  nome: string;
  preco: number;
  precoFinal: number | null;
  desconto: number | null;
  destaque: boolean | null;
  imagemURL: string | null;
  categoriaId: number | null;
  marcaId: number | null;
};

export type ProductPage = {
  content: CatalogProduct[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type CatalogQuery = {
  page: number;
  size: PageSize;
  sort: SortId;
  categoriaId?: number;
  marcaId?: number;
};

export function sortParam(sort: SortId): string {
  return SORT_OPTIONS.find((option) => option.id === sort)?.sort ?? SORT_OPTIONS[0].sort;
}

export function buildProductQuery(query: CatalogQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: Math.max(0, query.page),
    size: query.size,
    sort: sortParam(query.sort),
  };

  if (query.categoriaId !== undefined) {
    params.categoriaId = query.categoriaId;
  }

  if (query.marcaId !== undefined) {
    params.marcaId = query.marcaId;
  }

  return params;
}

export function clampPrice(value: number): number {
  if (!Number.isFinite(value)) {
    return PRICE_MIN;
  }

  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, Math.round(value)));
}

export function normalizePriceRange(min: number, max: number): { min: number; max: number } {
  const low = clampPrice(min);
  const high = clampPrice(max);
  return low <= high ? { min: low, max: high } : { min: high, max: low };
}

export function isFullPriceRange(min: number, max: number): boolean {
  return min <= PRICE_MIN && max >= PRICE_MAX;
}

export function payablePrice(product: Pick<CatalogProduct, "preco" | "precoFinal">): number {
  return product.precoFinal ?? product.preco;
}

export function matchesPriceRange(
  product: Pick<CatalogProduct, "preco" | "precoFinal">,
  min: number,
  max: number,
): boolean {
  const price = payablePrice(product);
  return price >= min && price <= max;
}

export function usableImage(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
    return value;
  }

  return "";
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDiscount(value: number): string {
  const formatted = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
  return `-${formatted}%`;
}

export function emptyProductPage(size: number): ProductPage {
  return { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}
