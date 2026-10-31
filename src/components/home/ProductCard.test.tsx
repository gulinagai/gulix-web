import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./ProductCard.tsx";

const product = {
  id: "gpu",
  name: "RX 9070 XT",
  category: "Placa de Vídeo",
  price: "R$ 849,90",
  image: "",
};

describe("card de produto", () => {
  it("mostra o preço efetivo e, abaixo, o original riscado", () => {
    render(<ProductCard product={{ ...product, compareAt: "R$ 999,90" }} />);

    const sale = screen.getByText("R$ 849,90");
    const original = screen.getByText("R$ 999,90");

    expect(sale.className).toContain("font-bold");
    expect(original.className).toContain("line-through");
    expect(sale.compareDocumentPosition(original) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("aproxima a imagem e aplica a borda azul só quando o hover é pedido", () => {
    const { container } = render(<ProductCard product={{ ...product, image: "gpu.jpg" }} imageHover />);
    const frame = container.querySelector("img")?.parentElement;

    expect(frame?.className).toContain("hover:border-brand");
    expect(frame?.className).toContain("overflow-hidden");
    expect(container.querySelector("img")?.className).toContain("group-hover:scale-[1.03]");
  });

  it("mantém o card sem zoom quando o hover não é pedido", () => {
    const { container } = render(<ProductCard product={{ ...product, image: "gpu.jpg" }} />);

    expect(container.querySelector("[class*='hover:border-brand']")).toBeNull();
    expect(container.querySelector("[class*='group-hover:scale']")).toBeNull();
  });

  it("não risca o preço quando não há desconto", () => {
    const { container } = render(<ProductCard product={product} />);

    expect(screen.getByText("R$ 849,90")).toBeTruthy();
    expect(container.querySelector(".line-through")).toBeNull();
  });
});
