import { Check, X } from "lucide-react";
import { useState } from "react";
import type { CatalogRef, PriceBounds } from "../../lib/catalog/catalog.ts";
import { formatPrice } from "../../lib/catalog/catalog.ts";

export type ActiveFilter = {
  id: string;
  label: string;
  onRemove: () => void;
};

type CatalogFiltersProps = {
  categories: CatalogRef[];
  brands: CatalogRef[];
  categoriaId?: number;
  marcaId?: number;
  bounds: PriceBounds | null;
  priceMin: number;
  priceMax: number;
  priceMessage?: string | null;
  soldByGulix: boolean;
  activeFilters: ActiveFilter[];
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
  bounds,
  priceMin,
  priceMax,
  priceMessage = null,
  soldByGulix,
  activeFilters,
  onCategoria,
  onMarca,
  onPrice,
  onSoldByGulix,
  onClear,
  listsReady = false,
}: CatalogFiltersProps) {
  return (
    <form
      className="min-w-0 space-y-6"
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

      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold text-ink">Preço</legend>
        {bounds ? (
          <>
            <p className="mt-2 text-sm text-ink">
              De {formatPrice(priceMin)} até {formatPrice(priceMax)}
            </p>
            <PriceRangeSlider bounds={bounds} min={priceMin} max={priceMax} onChange={onPrice} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MoneyField
                label="Preço mínimo"
                value={priceMin}
                min={bounds.min}
                max={priceMax}
                onCommit={(next) => onPrice(Math.min(next, priceMax), priceMax)}
              />
              <MoneyField
                label="Preço máximo"
                value={priceMax}
                min={priceMin}
                max={bounds.max}
                onCommit={(next) => onPrice(priceMin, Math.max(next, priceMin))}
              />
            </div>
          </>
        ) : priceMessage ? (
          <p className="mt-2 text-sm text-muted">{priceMessage}</p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Vendido por</legend>
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand">
          <input
            type="checkbox"
            className="sr-only"
            checked={soldByGulix}
            onChange={(event) => onSoldByGulix(event.target.checked)}
          />
          {soldByGulix ? <Check aria-hidden="true" size={16} className="text-brand" /> : null}
          GuliX
        </label>
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

      {activeFilters.length > 0 ? (
        <section aria-label="Filtros ativos" className="border-t border-line pt-6">
          <h3 className="text-sm font-semibold text-ink">Filtros ativos</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {activeFilters.map((filter) => (
              <li key={filter.id}>
                <button
                  type="button"
                  aria-label={`Remover ${filter.label}`}
                  onClick={filter.onRemove}
                  className="inline-flex max-w-full min-h-9 items-center gap-2 rounded-full border border-line bg-paper px-3 text-left text-sm text-ink"
                >
                  <span className="min-w-0 break-words">{filter.label}</span>
                  <X aria-hidden="true" size={14} className="shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </form>
  );
}

function MoneyField({
  label,
  value,
  min,
  max,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <label className="min-w-0 text-xs text-muted">
      {label}
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step="0.01"
        value={draft ?? value}
        onFocus={(event) => setDraft(event.currentTarget.value)}
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);
          const next = Number(text);
          if (text !== "" && Number.isFinite(next)) {
            onCommit(next);
          }
        }}
        onBlur={() => setDraft(null)}
        className="mt-1 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink"
      />
    </label>
  );
}

function PriceRangeSlider({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: PriceBounds;
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const span = bounds.max - bounds.min;
  const start = span === 0 ? 0 : ((min - bounds.min) / span) * 100;
  const end = span === 0 ? 100 : ((max - bounds.min) / span) * 100;
  const minimumOnTop = span > 0 && min >= bounds.min + span / 2;

  return (
    <div className="relative mt-4 h-8">
      <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand"
        style={{
          left: `calc(0.5rem + (100% - 1rem) * ${start / 100})`,
          width: `calc((100% - 1rem) * ${(end - start) / 100})`,
        }}
      />
      <RangeInput
        label="Mínimo"
        bounds={bounds}
        value={min}
        zIndex={minimumOnTop ? 4 : 3}
        onValue={(next) => onChange(Math.min(next, max), max)}
      />
      <RangeInput
        label="Máximo"
        bounds={bounds}
        value={max}
        zIndex={minimumOnTop ? 3 : 4}
        onValue={(next) => onChange(min, Math.max(next, min))}
      />
    </div>
  );
}

function RangeInput({
  label,
  bounds,
  value,
  zIndex,
  onValue,
}: {
  label: string;
  bounds: PriceBounds;
  value: number;
  zIndex: number;
  onValue: (value: number) => void;
}) {
  return (
    <input
      type="range"
      aria-label={label}
      min={bounds.min}
      max={bounds.max}
      step="0.01"
      value={value}
      aria-valuetext={formatPrice(value)}
      onChange={(event) => onValue(Number(event.target.value))}
      style={{ zIndex }}
      className="pointer-events-none absolute inset-0 m-0 h-8 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
    />
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
                className="size-4 shrink-0 accent-brand"
                checked={selected === option.id}
                onChange={() => onToggle(option.id)}
              />
              <span className="min-w-0 break-words">{option.nome}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
