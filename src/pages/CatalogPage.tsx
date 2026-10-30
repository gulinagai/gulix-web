import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CatalogFilters } from "../components/catalog/CatalogFilters.tsx";
import { ProductCard } from "../components/home/ProductCard.tsx";
import { Container } from "../components/layout/Container.tsx";
import type { Product } from "../data/catalog.ts";
import { api, type ApiClient } from "../lib/http/client.ts";
import { isApiError } from "../lib/http/errors.ts";
import {
  PAGE_SIZES,
  PRICE_MAX,
  PRICE_MIN,
  SORT_OPTIONS,
  buildProductQuery,
  emptyProductPage,
  formatDiscount,
  formatPrice,
  isFullPriceRange,
  matchesPriceRange,
  normalizePriceRange,
  payablePrice,
  usableImage,
  type CatalogProduct,
  type CatalogQuery,
  type CatalogRef,
  type PageSize,
  type ProductPage,
  type SortId,
} from "../lib/catalog/catalog.ts";

type CatalogPageProps = {
  client?: ApiClient;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; categories: CatalogRef[]; brands: CatalogRef[]; page: ProductPage };

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

function toCard(product: CatalogProduct, categories: CatalogRef[]): Product {
  const current = payablePrice(product);
  const discounted = product.precoFinal !== null && product.precoFinal < product.preco;

  return {
    id: String(product.id),
    name: product.nome,
    category: categories.find((item) => item.id === product.categoriaId)?.nome ?? "",
    price: formatPrice(current),
    compareAt: discounted ? formatPrice(product.preco) : undefined,
    badge: product.desconto && product.desconto > 0 ? formatDiscount(product.desconto) : undefined,
    image: usableImage(product.imagemURL),
  };
}

export function CatalogPage({ client = api }: CatalogPageProps) {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const sort = parseSort(params.get("ordem"));
  const size = parseSize(params.get("tamanho"));
  const page = Math.max(1, Number(params.get("pagina")) || 1);
  const categoriaId = parseId(params.get("categoria"));
  const marcaId = parseId(params.get("marca"));
  const soldByGulix = params.get("vendedor") !== "0";
  const fullPrice = isFullPriceRange(priceMin, priceMax);

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
    ])
      .then(([categories, brands, productPage]) => {
        if (signal.aborted) {
          return;
        }

        setState({
          status: "ready",
          categories: Array.isArray(categories) ? categories : [],
          brands: Array.isArray(brands) ? brands : [],
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
    const range = normalizePriceRange(min, max);
    setPriceMin(range.min);
    setPriceMax(range.max);
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
        <p className="mt-3 text-sm text-muted">
          {state.status === "ready"
            ? `${resultCount} ${resultCount === 1 ? "produto encontrado" : "produtos encontrados"}${fullPrice ? "" : " nesta página"}`
            : "Catálogo da GuliX"}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {categoryName ? (
            <FilterTag label={categoryName} onRemove={() => updateParams({ categoria: undefined }, true)} />
          ) : null}
          {brandName ? (
            <FilterTag label={brandName} onRemove={() => updateParams({ marca: undefined }, true)} />
          ) : null}
          {fullPrice ? null : (
            <FilterTag
              label={`${formatPrice(priceMin)} – ${formatPrice(priceMax)}`}
              onRemove={() => changePrice(PRICE_MIN, PRICE_MAX)}
            />
          )}
          {soldByGulix ? null : (
            <FilterTag label="Sem GuliX" onRemove={() => updateParams({ vendedor: undefined })} />
          )}
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
          <aside className={filtersOpen ? "fixed inset-0 z-40 lg:static" : "hidden lg:block"}>
            <button
              type="button"
              aria-label="Fechar filtros"
              className="absolute inset-0 bg-inverse/70 lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="relative h-full w-[min(100%,20rem)] overflow-y-auto bg-page p-5 lg:w-auto lg:overflow-visible lg:bg-transparent lg:p-0">
              <CatalogFilters
                categories={categories}
                brands={brands}
                categoriaId={categoriaId}
                marcaId={marcaId}
                priceMin={priceMin}
                priceMax={priceMax}
                soldByGulix={soldByGulix}
                onCategoria={(id) => updateParams({ categoria: id ? String(id) : undefined }, true)}
                onMarca={(id) => updateParams({ marca: id ? String(id) : undefined }, true)}
                onPrice={changePrice}
                onSoldByGulix={(value) => updateParams({ vendedor: value ? undefined : "0" })}
                listsReady={state.status === "ready"}
                onClear={() => {
                  changePrice(PRICE_MIN, PRICE_MAX);
                  updateParams({ categoria: undefined, marca: undefined, vendedor: undefined }, true);
                }}
              />
            </div>
          </aside>

          <div>
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
              <div className="ml-auto flex flex-wrap gap-3">
                <label className="text-xs text-muted">
                  Ordenar
                  <select
                    value={sort}
                    onChange={(event) => updateParams({ ordem: event.target.value }, true)}
                    className="mt-1 h-11 rounded-lg border border-line bg-paper px-3 text-sm text-ink"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-muted">
                  Por página
                  <select
                    value={String(size)}
                    onChange={(event) => updateParams({ tamanho: event.target.value }, true)}
                    className="mt-1 h-11 rounded-lg border border-line bg-paper px-3 text-sm text-ink"
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
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {visible.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={toCard(product, categories)} />
                  </li>
                ))}
              </ul>
            ) : null}

            {state.status === "ready" && soldByGulix ? (
              <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  Página {Math.min(page, Math.max(totalPages, 1))} de {Math.max(totalPages, 1)}
                </p>
                <div className="flex gap-2">
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
              </nav>
            ) : null}
          </div>
        </div>
      </Container>
    </main>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-paper px-3 text-sm text-ink"
    >
      {label}
      <X aria-hidden="true" size={14} />
      <span className="sr-only">Remover filtro</span>
    </button>
  );
}

function ProductSkeleton({ count }: { count: number }) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="animate-pulse motion-reduce:animate-none">
          <div className="aspect-square rounded-2xl bg-paper" />
          <div className="mt-3 h-3 w-16 rounded bg-paper" />
          <div className="mt-2 h-4 w-3/4 rounded bg-paper" />
        </li>
      ))}
    </ul>
  );
}
