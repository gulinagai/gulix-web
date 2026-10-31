import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "../../lib/http/client.ts";
import { CatalogPage } from "../../pages/CatalogPage.tsx";
import { CategorySection } from "./CategorySection.tsx";

const baseUrl = "http://api.test";

const categories = [
  { id: 11, nome: "Gabinete" },
  { id: 22, nome: "Placa de Vídeo" },
  { id: 33, nome: "Placa mãe" },
  { id: 44, nome: "Processador" },
  { id: 55, nome: "Memória RAM" },
  { id: 66, nome: "Fonte" },
  { id: 77, nome: "Armazenamento" },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function product(id: number, nome: string, categoriaId: number) {
  return {
    id,
    nome,
    preco: 100,
    precoFinal: 100,
    desconto: 0,
    destaque: false,
    imagemURL: "",
    categoriaId,
    marcaId: 1,
  };
}

const products = [
  product(1, "Gabinete da categoria", 11),
  product(2, "Placa de vídeo da categoria", 22),
  product(3, "Placa mãe da categoria", 33),
  product(4, "Processador da categoria", 44),
];

function mockApi() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = new URL(String(input));

    if (url.pathname.endsWith("/api/v1/categorias")) {
      return jsonResponse(categories);
    }

    if (url.pathname.endsWith("/api/v1/marcas")) {
      return jsonResponse([]);
    }

    if (url.pathname.endsWith("/api/v1/produtos/faixa-precos")) {
      return jsonResponse({ menorPreco: 100, maiorPreco: 100 });
    }

    const categoriaId = url.searchParams.get("categoriaId");
    const content = products.filter(
      (item) => categoriaId == null || String(item.categoriaId) === categoriaId,
    );

    return jsonResponse({
      content,
      totalElements: content.length,
      totalPages: content.length > 0 ? 1 : 0,
      number: 0,
      size: 10,
    });
  });
}

function renderSection() {
  const client = createApiClient({ baseUrl });
  const router = createMemoryRouter(
    [
      { path: "/", element: <CategorySection client={client} /> },
      {
        path: "/produtos",
        element: <CatalogPage client={client} imageBaseUrl={baseUrl} />,
      },
    ],
    { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);
  return router;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("navegue", () => {
  it("leva cada imagem ao catálogo com o id real da categoria", async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    const router = renderSection();

    const processor = await screen.findByRole("link", { name: /Processador/ });
    const gpu = screen.getByRole("link", { name: /Placa de Vídeo/ });
    const board = screen.getByRole("link", { name: /Placa-mãe/ });
    const memory = screen.getByRole("link", { name: /Memória RAM/ });
    const cabinet = screen.getByRole("link", { name: /Gabinete/ });

    expect(processor.getAttribute("href")).toBe("/produtos?categoria=44");
    expect(gpu.getAttribute("href")).toBe("/produtos?categoria=22");
    expect(board.getAttribute("href")).toBe("/produtos?categoria=33");
    expect(memory.getAttribute("href")).toBe("/produtos?categoria=55");
    expect(cabinet.getAttribute("href")).toBe("/produtos?categoria=11");
    expect(gpu.querySelector("img")?.className).toContain("group-hover:scale-[1.03]");
    expect(gpu.querySelector(".group")?.className).toContain("hover:border-ink/30");

    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Object.defineProperty(window, "scrollY", { configurable: true, value: 900 });

    await user.click(processor);

    expect(router.state.location.pathname).toBe("/produtos");
    expect(router.state.location.search).toBe("?categoria=44");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
    expect(scrollTo.mock.calls.some((call) => call[0]?.behavior === "smooth")).toBe(false);
    expect(await screen.findByRole("checkbox", { name: "Processador" })).toHaveProperty("checked", true);
    expect(screen.getByRole("heading", { name: "Processador da categoria" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Placa de vídeo da categoria" })).toBeNull();

    scrollTo.mockClear();
    await user.click(screen.getByRole("button", { name: "Remover Processador" }));
    expect(scrollTo).not.toHaveBeenCalled();

    await waitFor(() => {
      const urls = fetchMock.mock.calls.map((call) => String(call[0]));
      expect(urls.some((url) => url.includes("categoriaId=44"))).toBe(true);
    });
  });

  it("mantém os cards sem link quando a API de categorias falha", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ message: "falha" }, 500));
    renderSection();

    expect(await screen.findByRole("heading", { name: "Processador" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Processador/ })).toBeNull();
  });
});
