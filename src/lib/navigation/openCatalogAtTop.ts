export const openCatalogAtTop = { scrollToTop: true } as const;

export function opensCatalogAtTop(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as { scrollToTop?: unknown }).scrollToTop === true
  );
}
