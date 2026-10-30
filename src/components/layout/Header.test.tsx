import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./Header.tsx";

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Header />
    </MemoryRouter>,
  );
}

function itemLabels(nav: HTMLElement) {
  return Array.from(nav.querySelectorAll(":scope > ul > li")).map((item) => {
    const control = item.querySelector("a, button");
    return control?.textContent?.replace(/\s+/g, " ").trim();
  });
}

describe("navegação do cabeçalho", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it("mostra Início, Categorias, Produtos e Monte seu PC nessa ordem", () => {
    renderHeader();

    const [desktop, mobile] = screen.getAllByRole("navigation", { name: "Principal" });
    const expected = ["Início", "Categorias", "Produtos", "Monte seu PC"];

    expect(itemLabels(desktop)).toEqual(expected);
    expect(itemLabels(mobile)).toEqual(expected);
    expect(desktop.querySelector('a[href="/"]')?.textContent).toBe("Início");
    expect(desktop.querySelector('a[href="/produtos"]')?.textContent).toBe("Produtos");
    expect(screen.getAllByRole("button", { name: "Monte seu PC" })).toHaveLength(2);
  });

  it("abre o submenu, percorre as categorias pelo teclado e fecha com Escape", async () => {
    const user = userEvent.setup();
    renderHeader();

    const trigger = screen.getAllByRole("button", { name: "Categorias" })[0];
    trigger?.focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("menuitem", { name: "Tecnologia" })).toBe(document.activeElement);
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Áudio" })).toBe(document.activeElement);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toBe(document.activeElement);
  });

  it("fecha o submenu ao selecionar uma categoria ou clicar fora", async () => {
    const user = userEvent.setup();
    renderHeader();

    const trigger = screen.getAllByRole("button", { name: "Categorias" })[1];
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Games" }));
    expect(screen.queryByRole("menu")).toBeNull();

    await user.click(screen.getAllByRole("button", { name: "Categorias" })[0]);
    expect(screen.getByRole("menu", { name: "Categorias" })).toBeTruthy();
    await user.click(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("mantém pesquisa, conta e carrinho", () => {
    renderHeader();

    expect(screen.getAllByRole("searchbox", { name: "Buscar produtos" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Minha conta" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Carrinho" })).toBeTruthy();
  });
});
