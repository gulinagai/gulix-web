import type { CatalogRef } from "../../lib/catalog/catalog.ts";
import { PRICE_MAX, PRICE_MIN, formatPrice } from "../../lib/catalog/catalog.ts";

type CatalogFiltersProps = {
  categories: CatalogRef[];
  brands: CatalogRef[];
  categoriaId?: number;
  marcaId?: number;
  priceMin: number;
  priceMax: number;
  soldByGulix: boolean;
  onCategoria: (id: number | undefined) => void;
  onMarca: (id: number | undefined) => void;
  onPrice: (min: number, max: number) => void;
  onSoldByGulix: (value: boolean) => void;
  onClear: () => void;
  listsReady?: boolean;
};

function toggleId(current: number | undefined, id: number): number | undefined {
  return current === id ? undefined : id;
}

export function CatalogFilters({
  categories,
  brands,
  categoriaId,
  marcaId,
  priceMin,
  priceMax,
  soldByGulix,
  onCategoria,
  onMarca,
  onPrice,
  onSoldByGulix,
  onClear,
  listsReady = false,
}: CatalogFiltersProps) {
  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-[0.14em] text-ink uppercase">Filtros</h2>
        <button type="button" className="text-sm font-medium text-brand hover:text-ink" onClick={onClear}>
          Limpar
        </button>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Vendido por</legend>
        <label className="mt-3 flex min-h-11 items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="size-4 accent-brand"
            checked={soldByGulix}
            onChange={(event) => onSoldByGulix(event.target.checked)}
          />
          GuliX
        </label>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Preço</legend>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          De {formatPrice(priceMin)} até {formatPrice(priceMax)}. A API não filtra por faixa; o intervalo oculta
          itens fora dela nesta página.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-muted">
            Mínimo
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={priceMin}
              aria-valuetext={formatPrice(priceMin)}
              onChange={(event) => onPrice(Number(event.target.value), priceMax)}
              className="mt-1 w-full accent-brand"
            />
          </label>
          <label className="block text-xs text-muted">
            Máximo
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={priceMax}
              aria-valuetext={formatPrice(priceMax)}
              onChange={(event) => onPrice(priceMin, Number(event.target.value))}
              className="mt-1 w-full accent-brand"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted">
              Preço mínimo
              <input
                type="number"
                inputMode="numeric"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceMin}
                onChange={(event) => onPrice(Number(event.target.value), priceMax)}
                className="mt-1 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink"
              />
            </label>
            <label className="text-xs text-muted">
              Preço máximo
              <input
                type="number"
                inputMode="numeric"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={priceMax}
                onChange={(event) => onPrice(priceMin, Number(event.target.value))}
                className="mt-1 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink"
              />
            </label>
          </div>
        </div>
      </fieldset>

      <FilterGroup
        legend="Categoria"
        empty="Nenhuma categoria cadastrada."
        ready={listsReady}
        options={categories}
        selected={categoriaId}
        onToggle={(id) => onCategoria(toggleId(categoriaId, id))}
      />
      <FilterGroup
        legend="Marca"
        empty="Nenhuma marca cadastrada."
        ready={listsReady}
        options={brands}
        selected={marcaId}
        onToggle={(id) => onMarca(toggleId(marcaId, id))}
      />
    </form>
  );
}

function FilterGroup({
  legend,
  empty,
  ready,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  empty: string;
  ready: boolean;
  options: CatalogRef[];
  selected?: number;
  onToggle: (id: number) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      {ready && options.length === 0 ? <p className="mt-3 text-sm text-muted">{empty}</p> : null}
      <ul className="mt-2">
        {options.map((option) => (
          <li key={option.id}>
            <label className="flex min-h-11 items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                className="size-4 accent-brand"
                checked={selected === option.id}
                onChange={() => onToggle(option.id)}
              />
              {option.nome}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
