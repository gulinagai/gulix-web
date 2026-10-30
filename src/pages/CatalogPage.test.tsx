import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "../lib/http/client.ts";
import { CatalogPage } from "./CatalogPage.tsx";

const baseUrl = "http://api.test";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const productPage = {
  content: [
    {
      id: 1,
      nome: "Memória DDR5",
      preco: 500,
      precoFinal: 450,
      desconto: 10,
      destaque: false,
      imagemURL: "https://cdn.exemplo/ram.jpg",
      categoriaId: 3,
      marcaId: 5,
    },
    {
      id: 2,
      nome: "Fonte 750W",
      preco: 8000,
      precoFinal: null,
      desconto: 0,
      destaque: false,
      imagemURL: "fonte.jpg",
      categoriaId: 4,
      marcaId: 8,
    },
  ],
  totalElements: 12,
  totalPages: 2,
  number: 0,
  size: 10,
};

function mockCatalog() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);

    if (url.includes("/api/v1/categorias")) {
      return jsonResponse([{ id: 3, nome: "Memória RAM" }]);
    }

    if (url.includes("/api/v1/marcas")) {
      return jsonResponse([{ id: 5, nome: "AMD" }]);
    }

    return jsonResponse(productPage);
  });
}

function renderCatalog() {
  return render(
    <MemoryRouter initialEntries={["/produtos"]}>
      <CatalogPage client={createApiClient({ baseUrl })} />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("catálogo", () => {
  it("lista os produtos da API e a paginação", async () => {
    mockCatalog();
    renderCatalog();

    expect(await screen.findByRole("heading", { name: "Memória DDR5" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Fonte 750W" })).toBeTruthy();
    expect(screen.getByText("12 produtos encontrados")).toBeTruthy();
    expect(screen.getByText("Página 1 de 2")).toBeTruthy();
  });

  it("envia ordenação, tamanho da página, categoria e marca juntos", async () => {
    const fetchMock = mockCatalog();
    const user = userEvent.setup();
    renderCatalog();

    await screen.findByRole("heading", { name: "Memória DDR5" });
    await user.selectOptions(screen.getByLabelText("Ordenar"), "nome-desc");
    await user.selectOptions(screen.getByLabelText("Por página"), "20");
    await user.click(screen.getByRole("checkbox", { name: "Memória RAM" }));
    await user.click(screen.getByRole("checkbox", { name: "AMD" }));

    await waitFor(() => {
      const urls = fetchMock.mock.calls.map((call) => String(call[0]));
      expect(urls.some((url) => url.includes("sort=nome%2Cdesc") || url.includes("sort=nome,desc"))).toBe(true);
      expect(urls.some((url) => url.includes("size=20"))).toBe(true);
      expect(urls.some((url) => url.includes("categoriaId=3") && url.includes("marcaId=5"))).toBe(true);
    });
  });

  it("sincroniza o preço e oculta o produto fora da faixa nesta página", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderCatalog();

    await screen.findByRole("heading", { name: "Fonte 750W" });
    const maximumSlider = screen.getByRole("slider", { name: "Máximo" });

    await user.clear(screen.getByLabelText("Preço máximo"));
    await user.type(screen.getByLabelText("Preço máximo"), "1000");
    expect(maximumSlider).toHaveProperty("value", "1000");

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Fonte 750W" })).toBeNull();
    });
    expect(screen.getByRole("heading", { name: "Memória DDR5" })).toBeTruthy();
    expect(screen.getByText("1 produto encontrado nesta página")).toBeTruthy();
  });

  it("mostra o estado vazio ao desmarcar GuliX e limpa os filtros", async () => {
    mockCatalog();
    const user = userEvent.setup();
    renderCatalog();

    await screen.findByRole("heading", { name: "Memória DDR5" });
    await user.click(screen.getByRole("checkbox", { name: "GuliX" }));

    expect(await screen.findByText("Nenhum produto encontrado com esses filtros.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Limpar" }));
    expect(await screen.findByRole("heading", { name: "Memória DDR5" })).toBeTruthy();
  });
});
