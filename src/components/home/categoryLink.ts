import type { CatalogRef } from "../../lib/catalog/catalog.ts";

export function categoryIdForName(name: string, categories: readonly CatalogRef[]): number | undefined {
  const key = categoryKey(name);
  const match = categories.find((category) => categoryKey(category.nome) === key);

  if (match === undefined || !Number.isInteger(match.id) || match.id <= 0) {
    return undefined;
  }

  return match.id;
}

function categoryKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
