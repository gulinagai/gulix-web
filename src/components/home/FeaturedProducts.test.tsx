import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "../../lib/http/client.ts";
import { FeaturedProducts } from "./FeaturedProducts.tsx";

const baseUrl = "http://api.test";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const categories = [
  { id: 1, nome: "Gabinete" },
  { id: 3, nome: "Placa mãe" },
];

const featured = {
  id: 4,
  nome: "Placa Mãe Asus ROG Strix B850-E Gaming WiFi",
  preco: 3329.99,
  precoFinal: 2996.99,
  desconto: 10,
  destaque: true,
  imagemURL: "placa-mae.jpg",
  categoriaId: 3,
  marcaId: 12,
};

const regular = {
  id: 19,
  nome: "Fonte MSI MAG A650BN",
  preco: 399.99,
  precoFinal: 399.99,
  desconto: 0,
  destaque: true,
  imagemURL: "https://cdn.exemplo/fonte.jpg",
  categoriaId: 1,
  marcaId: 19,
};

function page(content: unknown[], totalPages = 1, number = 0) {
  return {
    content,
    totalElements: content.length,
    totalPages,
    number,
    size: 20,
  };
}

const installments: Record<number, { quantidadeParcelas: number; valorParcela: number }> = {
  4: { quantidadeParcelas: 6, valorParcela: 499.5 },
  19: { quantidadeParcelas: 8, valorParcela: 50 },
};

function paymentBody(id: number) {
  return installments[id] ?? { quantidadeParcelas: 6, valorParcela: 10 };
}

function renderSection() {
  return render(
    <MemoryRouter>
      <FeaturedProducts client={createApiClient({ baseUrl })} imageBaseUrl={baseUrl} />
    </MemoryRouter>,
  );
}

function installmentPattern(id: number) {
  const conditions = paymentBody(id);
  const amount = conditions.valorParcela.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return new RegExp(`ou ${conditions.quantidadeParcelas}x de R\\$\\s${amount.replace(".", "\\.")} sem juros`);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("seleção da casa", () => {
  it("mostra produtos em destaque com categoria, preço promocional e imagem reais", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      expect(new Headers(init?.headers).has("Authorization")).toBe(false);

      if (url.pathname.endsWith("/api/v1/categorias")) {
        return jsonResponse(categories);
      }

      const paymentId = url.pathname.match(/\/api\/v1\/pagamentos\/produtos\/(\d+)$/);
      if (paymentId) {
        return jsonResponse(paymentBody(Number(paymentId[1])));
      }

      expect(url.searchParams.get("destaque")).toBe("true");
      expect(url.searchParams.get("page")).toBe("0");
      expect(url.searchParams.get("size")).toBe("20");
      return jsonResponse(page([featured, regular]));
    });

    renderSection();

    expect(await screen.findByRole("heading", { name: featured.nome })).toBeTruthy();
    expect(screen.getByRole("link", { name: new RegExp(featured.nome) }).getAttribute("href")).toBe("/produtos/4");
    expect(screen.getByRole("link", { name: new RegExp(regular.nome) }).getAttribute("href")).toBe("/produtos/19");
    expect(screen.getByRole("heading", { name: regular.nome })).toBeTruthy();
    expect(screen.getByText("Placa mãe")).toBeTruthy();
    expect(screen.getByText("Gabinete")).toBeTruthy();

    const sale = screen.getByText("R$ 2.996,99");
    const original = screen.getByText("R$ 3.329,99");
    expect(sale.className).toContain("font-bold");
    expect(original.className).toContain("line-through");
    expect(sale.compareDocumentPosition(original) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("-10%")).toBeTruthy();
    expect(document.querySelector(`img[src="${baseUrl}/imagens/produtos/placa-mae.jpg"]`)).toBeTruthy();
    expect(document.querySelector('img[src="https://cdn.exemplo/fonte.jpg"]')).toBeTruthy();

    const plain = screen.getByText("R$ 399,99");
    expect(plain.closest("article")?.querySelector(".line-through")).toBeNull();
    expect(screen.getByText(installmentPattern(4))).toBeTruthy();
    expect(screen.getByText(installmentPattern(19))).toBeTruthy();
    expect(screen.queryByText(/12x/)).toBeNull();
    expect(screen.queryByRole("group", { name: "Filtrar produtos" })).toBeNull();
    expect(screen.queryByText(/produtos encontrados/)).toBeNull();

    const paymentCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes("/api/v1/pagamentos/produtos/"),
    );
    expect(paymentCalls.map(([input]) => String(input)).sort()).toEqual([
      `${baseUrl}/api/v1/pagamentos/produtos/19`,
      `${baseUrl}/api/v1/pagamentos/produtos/4`,
    ]);
  });

  it("não risca o preço quando o destaque não tem desconto efetivo", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/api/v1/categorias")) {
        return jsonResponse(categories);
      }

      if (url.includes("/api/v1/pagamentos/produtos/")) {
        return jsonResponse(paymentBody(4));
      }

      return jsonResponse(
        page([
          {
            ...featured,
            destaque: false,
            desconto: 10,
            precoFinal: 2996.99,
          },
        ]),
      );
    });

    renderSection();

    expect(await screen.findByRole("heading", { name: featured.nome })).toBeTruthy();
    expect(screen.getByText("R$ 2.996,99")).toBeTruthy();
    expect(document.querySelector(".line-through")).toBeNull();
    expect(screen.queryByText("-10%")).toBeNull();
    expect(screen.getByText(installmentPattern(4))).toBeTruthy();
  });

  it("busca as páginas seguintes quando a API pagina o destaque", async () => {
    const requestedPages: string[] = [];

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = new URL(String(input));

      if (url.pathname.endsWith("/api/v1/categorias")) {
        return jsonResponse([]);
      }

      const paymentId = url.pathname.match(/\/api\/v1\/pagamentos\/produtos\/(\d+)$/);
      if (paymentId) {
        return jsonResponse(paymentBody(Number(paymentId[1])));
      }

      const pageNumber = url.searchParams.get("page") ?? "";
      requestedPages.push(pageNumber);

      if (pageNumber === "0") {
        return jsonResponse(page([featured], 2, 0));
      }

      return jsonResponse(page([regular], 2, 1));
    });

    renderSection();

    expect(await screen.findByRole("heading", { name: featured.nome })).toBeTruthy();
    expect(screen.getByRole("heading", { name: regular.nome })).toBeTruthy();
    expect(requestedPages).toEqual(["0", "1"]);
  });

  it("mostra a lista vazia sem voltar aos produtos fictícios", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      return jsonResponse(url.includes("/api/v1/categorias") ? [] : page([]));
    });

    renderSection();

    expect(await screen.findByText("Nenhum produto em destaque no momento.")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Fone GuliX Aria" })).toBeNull();
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes("/api/v1/pagamentos"))).toBe(
      false,
    );
  });

  it("omite o parcelamento quando a consulta de pagamento falha", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/api/v1/categorias")) {
        return jsonResponse(categories);
      }

      if (url.includes("/api/v1/pagamentos/produtos/")) {
        return jsonResponse({ message: "Produto com id 4 não encontrado" }, 404);
      }

      return jsonResponse(page([featured]));
    });

    renderSection();

    expect(await screen.findByRole("heading", { name: featured.nome })).toBeTruthy();
    expect(screen.getByText("R$ 2.996,99")).toBeTruthy();
    expect(screen.queryByText(/sem juros/)).toBeNull();
  });

  it("mostra o erro da API sem produtos fictícios", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/api/v1/categorias")) {
        return jsonResponse([]);
      }

      return jsonResponse(
        { message: "Falha ao consultar produtos." },
        500,
      );
    });

    renderSection();

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Falha ao consultar produtos.");
    expect(screen.queryByRole("heading", { name: "Fone GuliX Aria" })).toBeNull();
  });
});
