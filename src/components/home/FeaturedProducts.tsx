import { useEffect, useState } from "react";
import type { Product } from "../../data/catalog.ts";
import { api, type ApiClient } from "../../lib/http/client.ts";
import { isApiError } from "../../lib/http/errors.ts";
import type { CatalogRef, ProductPage } from "../../lib/catalog/catalog.ts";
import { Container } from "../layout/Container.tsx";
import {
  FEATURED_PAGE_SIZE,
  featuredPage,
  parsePaymentConditions,
  toFeaturedCard,
  type PaymentConditions,
} from "./featured.ts";
import { ProductCard } from "./ProductCard.tsx";

type FeaturedProductsProps = {
  client?: ApiClient;
  imageBaseUrl?: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: Product[] };

export function FeaturedProducts({
  client = api,
  imageBaseUrl = import.meta.env.VITE_API_BASE_URL,
}: FeaturedProductsProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    loadFeaturedProducts(client, signal)
      .then(({ products, categories, conditions }) => {
        if (signal.aborted) {
          return;
        }

        setState({
          status: "ready",
          products: products.map((product) =>
            toFeaturedCard(product, categories, imageBaseUrl, conditions.get(product.id)),
          ),
        });
      })
      .catch((error: unknown) => {
        if (signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message: isApiError(error)
            ? error.message
            : "Não foi possível carregar os produtos em destaque.",
        });
      });

    return () => controller.abort();
  }, [client, imageBaseUrl]);

  return (
    <section id="produtos" className="scroll-mt-24 py-12 sm:py-16" aria-labelledby="titulo-produtos">
      <Container>
        <p
          id="selecao-da-casa"
          className="flex scroll-mt-24 items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase"
        >
          <span className="h-px w-8 bg-brand" />
          Seleção da casa
        </p>
        <h2
          id="titulo-produtos"
          className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl"
        >
          Produtos em destaque
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Uma seleção especial de hardware para levar seu setup a outro nível.
        </p>
        {state.status === "loading" ? (
          <>
            <p className="mt-6 text-sm text-muted">Carregando produtos em destaque.</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-5" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => (
                <li key={index} className="min-w-0 animate-pulse motion-reduce:animate-none">
                  <div className="aspect-square rounded-2xl bg-paper" />
                  <div className="mt-3 h-3 w-16 rounded bg-paper" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-paper" />
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="mt-6 text-sm text-muted">
            {state.message}
          </p>
        ) : null}
        {state.status === "ready" && state.products.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Nenhum produto em destaque no momento.</p>
        ) : null}
        {state.status === "ready" && state.products.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-5">
            {state.products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}

async function loadFeaturedProducts(client: ApiClient, signal: AbortSignal) {
  const [categories, firstPage] = await Promise.all([
    client.get<CatalogRef[]>("/api/v1/categorias", { signal }),
    client.get<ProductPage>("/api/v1/produtos", {
      query: { destaque: true, page: 0, size: FEATURED_PAGE_SIZE },
      signal,
    }),
  ]);

  const first = featuredPage(firstPage, FEATURED_PAGE_SIZE);
  const pages = [first];

  if (first.totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, index) =>
        client.get<ProductPage>("/api/v1/produtos", {
          query: { destaque: true, page: index + 1, size: first.size },
          signal,
        }),
      ),
    );

    pages.push(...rest.map((page) => featuredPage(page, first.size)));
  }

  const products = pages.flatMap((page) => page.content);
  const conditions = await loadPaymentConditions(client, products, signal);

  return {
    categories: Array.isArray(categories) ? categories : [],
    products,
    conditions,
  };
}

async function loadPaymentConditions(
  client: ApiClient,
  products: ProductPage["content"],
  signal: AbortSignal,
) {
  const ids = [...new Set(products.map((product) => product.id))];
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const body = await client.get<{ quantidadeParcelas?: unknown; valorParcela?: unknown }>(
          `/api/v1/pagamentos/produtos/${id}`,
          { signal },
        );

        return [id, parsePaymentConditions(body)] as const;
      } catch (error) {
        if (signal.aborted) {
          throw error;
        }

        return [id, undefined] as const;
      }
    }),
  );

  return new Map<number, PaymentConditions | undefined>(entries);
}
