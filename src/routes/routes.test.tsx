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

    expect(screen.getByRole("heading", { name: /encontre o/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Produtos em destaque" })).toBeTruthy();
  });

  it("apresenta a página 404 e volta para a home", async () => {
    const user = userEvent.setup();
    renderAt("/endereco-inexistente");

    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /encontre o/i })).toBeNull();

    await user.click(screen.getByRole("link", { name: "Voltar ao início" }));

    expect(screen.getByRole("heading", { name: /encontre o/i })).toBeTruthy();
  });
});
