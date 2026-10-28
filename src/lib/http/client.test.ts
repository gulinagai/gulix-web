import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "./client.ts";
import { ApiError } from "./errors.ts";

const baseUrl = "http://api.test";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cliente HTTP", () => {
  it("retorna o corpo de uma requisição bem-sucedida", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(200, { id: 1, nome: "Teclado" }),
    );
    const api = createApiClient({ baseUrl });

    const result = await api.get<{ id: number; nome: string }>("/api/v1/produtos", {
      query: { nome: "Teclado", categoriaId: 3 },
      headers: { "X-Request-Id": "req-1" },
      token: "acesso-teste",
    });

    expect(result).toEqual({ id: 1, nome: "Teclado" });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe("http://api.test/api/v1/produtos?nome=Teclado&categoriaId=3");
    expect(init?.method).toBe("GET");

    const headers = new Headers(init?.headers);
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer acesso-teste");
    expect(headers.get("X-Request-Id")).toBe("req-1");
  });

  it("preserva ErrorResponseDTO", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(404, {
        timestamp: "2026-09-13T11:30:00",
        status: 404,
        error: "Recurso não encontrado",
        message: "Produto com id 10 não encontrado",
        path: "/api/v1/produtos/10",
      }),
    );
    const api = createApiClient({ baseUrl });

    await expect(api.get("/api/v1/produtos/10")).rejects.toMatchObject({
      name: "ApiError",
      kind: "http",
      status: 404,
      error: "Recurso não encontrado",
      message: "Produto com id 10 não encontrado",
      path: "/api/v1/produtos/10",
      timestamp: "2026-09-13T11:30:00",
    });
  });

  it("preserva fields de ValidationErrorResponseDTO", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(400, {
        timestamp: "2026-09-13T11:30:00",
        status: 400,
        error: "Erro de validação",
        message: "Existem campos inválidos",
        path: "/api/v1/auth/register",
        fields: {
          senha: "Senha deve conter letra maiúscula, minúscula e número",
          telefone: "Telefone deve conter 10 ou 11 dígitos",
        },
      }),
    );
    const api = createApiClient({ baseUrl });

    const error = await api
      .post("/api/v1/auth/register", { body: { nome: "Ana" } })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      kind: "http",
      status: 400,
      message: "Existem campos inválidos",
      fields: {
        senha: "Senha deve conter letra maiúscula, minúscula e número",
        telefone: "Telefone deve conter 10 ou 11 dígitos",
      },
    });
  });

  it("aceita resposta sem corpo", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const api = createApiClient({ baseUrl });

    const result = await api.delete<void>("/api/v1/carrinho/itens/1");

    expect(result).toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("DELETE");
  });

  it("informa quando o erro não contém JSON válido", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html>erro</html>", { status: 502 }),
    );
    const api = createApiClient({ baseUrl });

    await expect(api.get("/api/v1/produtos")).rejects.toMatchObject({
      kind: "invalid-json",
      status: 502,
      message: "A resposta de erro não contém JSON válido.",
      responseBody: "<html>erro</html>",
    });
  });

  it("informa falha de rede sem descartar a mensagem original", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const api = createApiClient({ baseUrl });

    await expect(api.get("/api/v1/produtos")).rejects.toMatchObject({
      kind: "network",
      message: "Failed to fetch",
    });
  });

  it("exige a URL base", async () => {
    const api = createApiClient({ baseUrl: "  " });

    await expect(api.get("/api/v1/produtos")).rejects.toMatchObject({
      kind: "configuration",
      message: "A variável VITE_API_BASE_URL não está definida.",
    });
  });

  it("envia corpo JSON no POST e não envia token quando ele está ausente", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    const api = createApiClient({ baseUrl });

    await api.post<void>("/api/v1/auth/logout", { body: { refreshToken: "abc" } });

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ refreshToken: "abc" }));
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.has("Authorization")).toBe(false);
  });
});
