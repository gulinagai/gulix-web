import { describe, expect, it } from "vitest";
import {
  buildProductQuery,
  clampPrice,
  isFullPriceRange,
  matchesPriceRange,
  normalizePriceRange,
  usableImage,
} from "./catalog.ts";

describe("consulta do catálogo", () => {
  it("monta paginação, ordenação e um único id de categoria e marca", () => {
    expect(
      buildProductQuery({
        page: 2,
        size: 20,
        sort: "nome-desc",
        categoriaId: 3,
        marcaId: 5,
      }),
    ).toEqual({
      page: 2,
      size: 20,
      sort: "nome,desc",
      categoriaId: 3,
      marcaId: 5,
    });
  });

  it("omite categoria e marca quando não há filtro", () => {
    expect(buildProductQuery({ page: 0, size: 10, sort: "preco-asc" })).toEqual({
      page: 0,
      size: 10,
      sort: "preco,asc",
    });
  });

  it("mantém o intervalo de preço entre 0 e 20.000 e sincroniza os limites", () => {
    expect(clampPrice(-10)).toBe(0);
    expect(clampPrice(25000)).toBe(20_000);
    expect(normalizePriceRange(800, 100)).toEqual({ min: 100, max: 800 });
    expect(isFullPriceRange(0, 20_000)).toBe(true);
    expect(isFullPriceRange(0, 19999)).toBe(false);
  });

  it("usa o preço final quando ele existe", () => {
    expect(matchesPriceRange({ preco: 2000, precoFinal: 1500 }, 1000, 1600)).toBe(true);
    expect(matchesPriceRange({ preco: 2000, precoFinal: 1500 }, 1600, 3000)).toBe(false);
    expect(matchesPriceRange({ preco: 900, precoFinal: null }, 0, 1000)).toBe(true);
  });

  it("aceita só URL de imagem utilizável", () => {
    expect(usableImage("https://cdn.exemplo/gpu.jpg")).toBe("https://cdn.exemplo/gpu.jpg");
    expect(usableImage("/midia/gpu.jpg")).toBe("/midia/gpu.jpg");
    expect(usableImage("rx-6650.jpg")).toBe("");
    expect(usableImage(null)).toBe("");
  });
});
