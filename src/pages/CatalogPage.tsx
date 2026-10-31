import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CatalogFilters, type ActiveFilter } from "../components/catalog/CatalogFilters.tsx";
import { ProductCard } from "../components/home/ProductCard.tsx";
import { Container } from "../components/layout/Container.tsx";
import type { Product } from "../data/catalog.ts";
import { api, type ApiClient } from "../lib/http/client.ts";
import { isApiError } from "../lib/http/errors.ts";
import {
  PAGE_SIZES,
  SORT_OPTIONS,
  buildProductQuery,
  emptyProductPage,
  formatDiscount,
  formatPrice,
  hasPromotionalPrice,
  isFullPriceRange,
  matchesPriceRange,
  normalizePriceRange,
  parsePriceBounds,
  payablePrice,
  usableImage,
  type CatalogProduct,
  type CatalogQuery,
  type CatalogRef,
  type PageSize,
  type PriceBounds,
  type ProductPage,
  type SortId,
} from "../lib/catalog/catalog.ts";

type CatalogPageProps = {
  client?: ApiClient;
  imageBaseUrl?: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      categories: CatalogRef[];
      brands: CatalogRef[];
      page: ProductPage;
      bounds: PriceBounds | null;
      priceMessage: string | null;
    };

type PriceSelection = {
  min: number;
  max: number;
  key: string;
};

function parseId(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseSort(value: string | null): SortId {
  return SORT_OPTIONS.some((option) => option.id === value) ? (value as SortId) : "preco-asc";
}

function parseSize(value: string | null): PageSize {
  return value === "20" ? 20 : 10;
}

function toCard(product: CatalogProduct, categories: CatalogRef[], imageBaseUrl?: string): Product {
  const current = payablePrice(product);
  const promotional = hasPromotionalPrice(product);

  return {
    id: String(product.id),
    name: product.nome,
    category: categories.find((item) => item.id === product.categoriaId)?.nome ?? "",
    price: formatPrice(current),
    compareAt: promotional ? formatPrice(product.preco) : undefined,
    badge: product.desconto && product.desconto > 0 ? formatDiscount(product.desconto) : undefined,
    image: usableImage(product.imagemURL, imageBaseUrl),
  };
}

export function CatalogPage({
  client = api,
  imageBaseUrl = import.meta.env.VITE_API_BASE_URL,
}: CatalogPageProps) {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceSelection, setPriceSelection] = useState<PriceSelection | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const sort = parseSort(params.get("ordem"));
  const size = parseSize(params.get("tamanho"));
  const page = Math.max(1, Number(params.get("pagina")) || 1);
  const categoriaId = parseId(params.get("categoria"));
  const marcaId = parseId(params.get("marca"));
  const soldByGulix = params.get("vendedor") !== "0";
  const bounds = state.status === "ready" ? state.bounds : null;
  const boundsKey = bounds ? `${bounds.min}|${bounds.max}` : "";

  if (bounds && priceSelection?.key !== boundsKey) {
    const next = priceSelection
      ? normalizePriceRange(priceSelection.min, priceSelection.max, bounds)
      : { min: bounds.min, max: bounds.max };
    setPriceSelection({ ...next, key: boundsKey });
  }

  if (!bounds && priceSelection) {
    setPriceSelection(null);
  }

  const priceMin = priceSelection?.min ?? bounds?.min ?? 0;
  const priceMax = priceSelection?.max ?? bounds?.max ?? 0;
  const fullPrice = !bounds || !priceSelection || isFullPriceRange(priceMin, priceMax, bounds);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const request: CatalogQuery = { page: page - 1, size, sort, categoriaId, marcaId };

    const products = soldByGulix
      ? client.get<ProductPage>("/api/v1/produtos", { query: buildProductQuery(request), signal })
      : Promise.resolve(emptyProductPage(size));

    Promise.all([
      client.get<CatalogRef[]>("/api/v1/categorias", { signal }),
      client.get<CatalogRef[]>("/api/v1/marcas", { signal }),
      products,
      loadPriceBounds(client, signal),
    ])
      .then(([categories, brands, productPage, price]) => {
        if (signal.aborted) {
          return;
        }

        setState({
          status: "ready",
          categories: Array.isArray(categories) ? categories : [],
          brands: Array.isArray(brands) ? brands : [],
          bounds: price.bounds,
          priceMessage: price.message,
          page: {
            content: Array.isArray(productPage.content) ? productPage.content : [],
            totalElements: productPage.totalElements ?? 0,
            totalPages: productPage.totalPages ?? 0,
            number: productPage.number ?? 0,
            size: productPage.size ?? size,
          },
        });
      })
      .catch((error: unknown) => {
        if (signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message: isApiError(error) ? error.message : "Não foi possível carregar o catálogo.",
        });
      });

    return () => controller.abort();
  }, [client, soldByGulix, page, size, sort, categoriaId, marcaId]);

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtersOpen]);

  function updateParams(next: Record<string, string | undefined>, resetPage = false) {
    const updated = new URLSearchParams(params);

    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    }

    if (resetPage) {
      updated.delete("pagina");
    }

    setParams(updated);
  }

  function changePrice(min: number, max: number) {
    if (!bounds) {
      return;
    }

    const range = normalizePriceRange(min, max, bounds);
    setPriceSelection({ ...range, key: boundsKey });
  }

  const categories = state.status === "ready" ? state.categories : [];
  const brands = state.status === "ready" ? state.brands : [];
  const productPage = state.status === "ready" ? state.page : undefined;
  const visible = (productPage?.content ?? []).filter((product) =>
    fullPrice ? true : matchesPriceRange(product, priceMin, priceMax),
  );
  const totalPages = productPage?.totalPages ?? 0;
  const categoryName = categories.find((item) => item.id === categoriaId)?.nome;
  const brandName = brands.find((item) => item.id === marcaId)?.nome;
  const resultCount = fullPrice ? (productPage?.totalElements ?? 0) : visible.length;
  const activeFilters: ActiveFilter[] = [];

  if (bounds && !fullPrice) {
    activeFilters.push({
      id: "preco",
      label: `${formatPrice(priceMin)} – ${formatPrice(priceMax)}`,
      onRemove: () => changePrice(bounds.min, bounds.max),
    });
  }

  if (categoryName) {
    activeFilters.push({
      id: "categoria",
      label: categoryName,
      onRemove: () => updateParams({ categoria: undefined }, true),
    });
  }

  if (brandName) {
    activeFilters.push({
      id: "marca",
      label: brandName,
      onRemove: () => updateParams({ marca: undefined }, true),
    });
  }

  if (!soldByGulix) {
    activeFilters.push({
      id: "vendedor",
      label: "Sem GuliX",
      onRemove: () => updateParams({ vendedor: undefined }),
    });
  }

  return (
    <main id="conteudo" className="py-8 sm:py-10">
      <Container>
        <nav aria-label="Trilha" className="text-sm text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-ink">
                Início
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink">Produtos</li>
          </ol>
        </nav>
        <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl">
          Produtos
        </h1>

        <div className="mt-8 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10">
          <aside className={filtersOpen ? "fixed inset-0 z-40 lg:static" : "hidden lg:block"}>
            <button
              type="button"
              aria-label="Fechar filtros"
              className="absolute inset-0 bg-inverse/70 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="relative h-full w-[min(100%,20rem)] overflow-x-hidden overflow-y-auto bg-page p-5 lg:w-auto lg:overflow-visible lg:bg-transparent lg:p-0">
              <CatalogFilters
                categories={categories}
                brands={brands}
                categoriaId={categoriaId}
                marcaId={marcaId}
                bounds={bounds}
                priceMin={priceMin}
                priceMax={priceMax}
                priceMessage={
                  state.status === "loading"
                    ? "Carregando a faixa de preços."
                    : state.status === "ready"
                      ? state.priceMessage
                      : null
                }
                soldByGulix={soldByGulix}
                activeFilters={activeFilters}
                onCategoria={(id) => updateParams({ categoria: id ? String(id) : undefined }, true)}
                onMarca={(id) => updateParams({ marca: id ? String(id) : undefined }, true)}
                onPrice={changePrice}
                onSoldByGulix={(value) => updateParams({ vendedor: value ? undefined : "0" })}
                listsReady={state.status === "ready"}
                onClear={() => {
                  if (bounds) {
                    changePrice(bounds.min, bounds.max);
                  }
                  updateParams({ categoria: undefined, marca: undefined, vendedor: undefined }, true);
                }}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-medium text-ink lg:hidden"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal aria-hidden="true" size={16} />
                Filtros
              </button>
              <div className="ml-auto flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <label className="flex min-w-0 flex-col gap-3 text-xs text-muted">
                  Ordenar
                  <select
                    value={sort}
                    onChange={(event) => updateParams({ ordem: event.target.value }, true)}
                    className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink sm:w-44"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-w-0 flex-col gap-3 text-xs text-muted">
                  Por página
                  <select
                    value={String(size)}
                    onChange={(event) => updateParams({ tamanho: event.target.value }, true)}
                    className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink sm:w-36"
                  >
                    {PAGE_SIZES.map((option) => (
                      <option key={option} value={option}>
                        {option} produtos
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {state.status === "loading" ? <ProductSkeleton count={size} /> : null}
            {state.status === "error" ? (
              <p role="alert" className="mt-8 text-sm text-muted">
                {state.message}
              </p>
            ) : null}
            {state.status === "ready" && visible.length === 0 ? (
              <p className="mt-8 text-sm text-muted">Nenhum produto encontrado com esses filtros.</p>
            ) : null}
            {state.status === "ready" && visible.length > 0 ? (
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
                {visible.map((product) => (
                  <li key={product.id} className="min-w-0">
                    <ProductCard product={toCard(product, categories, imageBaseUrl)} />
                  </li>
                ))}
              </ul>
            ) : null}

            {state.status === "ready" && soldByGulix ? (
              <nav
                aria-label="Paginação"
                className="mt-8 flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-4"
              >
                <p className="text-sm text-muted">
                  Página {Math.min(page, Math.max(totalPages, 1))} de {Math.max(totalPages, 1)}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-line px-4 text-sm font-medium text-ink disabled:text-muted"
                    disabled={page <= 1}
                    onClick={() => updateParams({ pagina: String(page - 1) })}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-line px-4 text-sm font-medium text-ink disabled:text-muted"
                    disabled={totalPages === 0 || page >= totalPages}
                    onClick={() => updateParams({ pagina: String(page + 1) })}
                  >
                    Próxima
                  </button>
                </div>
                <p className="text-right text-sm text-muted">
                  {resultCount} {resultCount === 1 ? "produto encontrado" : "produtos encontrados"}
                  {fullPrice ? "" : " nesta página"}
                </p>
              </nav>
            ) : null}
          </div>
        </div>
      </Container>
    </main>
  );
}

function ProductSkeleton({ count }: { count: number }) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-5" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="min-w-0 animate-pulse motion-reduce:animate-none">
          <div className="aspect-square rounded-2xl bg-paper" />
          <div className="mt-3 h-3 w-16 rounded bg-paper" />
          <div className="mt-2 h-4 w-3/4 rounded bg-paper" />
        </li>
      ))}
    </ul>
  );
}

async function loadPriceBounds(
  client: ApiClient,
  signal: AbortSignal,
): Promise<{ bounds: PriceBounds | null; message: string | null }> {
  try {
    const body = await client.get<{ menorPreco?: unknown; maiorPreco?: unknown }>("/api/v1/produtos/faixa-precos", {
      signal,
    });
    const bounds = parsePriceBounds(body);

    if (!bounds) {
      return { bounds: null, message: "A faixa de preços retornada pela API é inválida." };
    }

    return { bounds, message: null };
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }

    if (isApiError(error) && error.status === 404) {
      return { bounds: null, message: "Nenhum produto disponível para definir a faixa de preços." };
    }

    return {
      bounds: null,
      message: isApiError(error) ? error.message : "Não foi possível carregar a faixa de preços.",
    };
  }
}
