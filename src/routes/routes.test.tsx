import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { appRoutes } from "./routes.tsx";

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe("roteamento", () => {
  it("apresenta a home em /", () => {
    renderAt("/");

    const legacy = screen.getByRole("heading", { level: 1, name: /build your legacy/i });
    const chooseSide = screen.getByRole("heading", { name: "Choose your side." });
    expect(legacy.compareDocumentPosition(chooseSide) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const categories = screen.getByRole("heading", { name: "Explore por categoria" });
    expect(chooseSide.compareDocumentPosition(categories) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const name of [
      "Gabinete",
      "Placa de Vídeo",
      "Placa-mãe",
      "Processador",
      "Memória RAM",
      "Fonte",
      "Armazenamento",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy();
    }
    expect(screen.getByRole("heading", { name: "Produtos em destaque" })).toBeTruthy();
    expect(screen.getByText("Parcele sua compra em até 12x sem juros.")).toBeTruthy();
    expect(screen.queryByText("Frete especial em produtos selecionados")).toBeNull();
    expect(screen.queryByText("Até 12x sem juros / Curadoria própria")).toBeNull();
  });

  it("leva Explorar produtos ao catálogo sem filtros e Ver ofertas até a seleção da casa", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);

    const offers = screen.getByRole("link", { name: "Ver ofertas" });
    expect(offers.getAttribute("href")).toBe("#selecao-da-casa");
    expect(document.getElementById("selecao-da-casa")?.textContent).toContain("Seleção da casa");
    expect(document.getElementById("selecao-da-casa")?.className).toContain("scroll-mt-24");

    await user.click(screen.getByRole("link", { name: "Explorar produtos" }));

    expect(router.state.location.pathname).toBe("/produtos");
    expect(router.state.location.search).toBe("");
    expect(screen.getByRole("checkbox", { name: "GuliX" })).toHaveProperty("checked", true);
    expect(screen.queryByRole("button", { name: /^Remover / })).toBeNull();
  });

  it("esconde a faixa de anúncio no catálogo", () => {
    renderAt("/produtos");

    expect(screen.queryByText("Frete especial em produtos selecionados")).toBeNull();
    expect(screen.queryByText("Até 12x sem juros / Curadoria própria")).toBeNull();
    expect(screen.getByRole("heading", { name: "Produtos" })).toBeTruthy();
  });

  it("apresenta a página 404 e volta para a home", async () => {
    const user = userEvent.setup();
    renderAt("/endereco-inexistente");

    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeTruthy();
    expect(screen.getByText("Frete especial em produtos selecionados")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /build your legacy/i })).toBeNull();

    await user.click(screen.getByRole("link", { name: "Voltar ao início" }));

    expect(screen.getByRole("heading", { name: /build your legacy/i })).toBeTruthy();
  });
});
