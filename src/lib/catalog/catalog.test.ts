import { describe, expect, it } from "vitest";
import {
  buildProductQuery,
  clampPrice,
  isFullPriceRange,
  matchesPriceRange,
  normalizePriceRange,
  parsePriceBounds,
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

  it("limita o intervalo aos valores recebidos da API", () => {
    const bounds = { min: 49.9, max: 5999.9 };

    expect(parsePriceBounds({ menorPreco: "49.90", maiorPreco: 5999.9 })).toEqual(bounds);
    expect(parsePriceBounds({ menorPreco: null, maiorPreco: 10 })).toBeUndefined();
    expect(clampPrice(-10, bounds)).toBe(49.9);
    expect(clampPrice(9000, bounds)).toBe(5999.9);
    expect(normalizePriceRange(800, 100, bounds)).toEqual({ min: 100, max: 800 });
    expect(isFullPriceRange(49.9, 5999.9, bounds)).toBe(true);
    expect(isFullPriceRange(49.9, 1000, bounds)).toBe(false);
  });

  it("usa o preço final quando ele existe", () => {
    expect(matchesPriceRange({ preco: 2000, precoFinal: 1500 }, 1000, 1600)).toBe(true);
    expect(matchesPriceRange({ preco: 2000, precoFinal: 1500 }, 1600, 3000)).toBe(false);
    expect(matchesPriceRange({ preco: 900, precoFinal: null }, 0, 1000)).toBe(true);
  });

  it("aceita só URL de imagem utilizável", () => {
    expect(usableImage("https://cdn.exemplo/gpu.jpg")).toBe("https://cdn.exemplo/gpu.jpg");
    expect(usableImage("/midia/gpu.jpg")).toBe("/midia/gpu.jpg");
    expect(usableImage("rx-6650.jpg", "http://localhost:8080")).toBe(
      "http://localhost:8080/imagens/produtos/rx-6650.jpg",
    );
    expect(usableImage("rx-6650.jpg")).toBe("");
    expect(usableImage(null)).toBe("");
  });
});
