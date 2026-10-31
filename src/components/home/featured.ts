import type { Product } from "../../data/catalog.ts";
import {
  formatDiscount,
  formatPrice,
  hasPromotionalPrice,
  payablePrice,
  usableImage,
  type CatalogProduct,
  type CatalogRef,
  type ProductPage,
} from "../../lib/catalog/catalog.ts";

export const FEATURED_PAGE_SIZE = 20;

export type PaymentConditions = {
  quantidadeParcelas: number;
  valorParcela: number;
};

export function parsePaymentConditions(payload: {
  quantidadeParcelas?: unknown;
  valorParcela?: unknown;
}): PaymentConditions | undefined {
  const installments =
    typeof payload.quantidadeParcelas === "number"
      ? payload.quantidadeParcelas
      : typeof payload.quantidadeParcelas === "string"
        ? Number(payload.quantidadeParcelas)
        : Number.NaN;
  const amount = money(payload.valorParcela);

  if (!Number.isInteger(installments) || installments <= 0 || amount === undefined) {
    return undefined;
  }

  return { quantidadeParcelas: installments, valorParcela: amount };
}

export function formatInstallment(conditions: PaymentConditions): string {
  return `ou ${conditions.quantidadeParcelas}x de ${formatPrice(conditions.valorParcela)} sem juros`;
}

function money(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.round(parsed * 100) / 100;
}

export function toFeaturedCard(
  product: CatalogProduct,
  categories: CatalogRef[],
  imageBaseUrl?: string,
  conditions?: PaymentConditions,
): Product {
  const promotional = hasPromotionalPrice(product);
  const category = categories.find((item) => item.id === product.categoriaId)?.nome ?? "";

  return {
    id: String(product.id),
    name: product.nome,
    category,
    price: formatPrice(promotional ? (product.precoFinal ?? product.preco) : payablePrice(product)),
    compareAt: promotional ? formatPrice(product.preco) : undefined,
    installment: conditions ? formatInstallment(conditions) : undefined,
    badge:
      promotional && product.desconto != null && product.desconto > 0
        ? formatDiscount(product.desconto)
        : undefined,
    image: usableImage(product.imagemURL, imageBaseUrl),
  };
}

export function featuredPage(page: ProductPage | undefined, fallbackSize: number): ProductPage {
  return {
    content: Array.isArray(page?.content) ? page.content : [],
    totalElements: page?.totalElements ?? 0,
    totalPages: page?.totalPages ?? 0,
    number: page?.number ?? 0,
    size: page?.size ?? fallbackSize,
  };
}
