import { ApiError, parseErrorResponse } from "./errors.ts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;

export type ApiQuery = Record<string, QueryValue>;

export type ApiRequestOptions = {
  method?: HttpMethod;
  query?: ApiQuery;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
  signal?: AbortSignal;
};

export type ApiClient = {
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => Promise<T>;
  post: <T>(path: string, options?: Omit<ApiRequestOptions, "method">) => Promise<T>;
  put: <T>(path: string, options?: Omit<ApiRequestOptions, "method">) => Promise<T>;
  patch: <T>(path: string, options?: Omit<ApiRequestOptions, "method">) => Promise<T>;
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) => Promise<T>;
};

type ApiClientOptions = {
  baseUrl?: string;
};

function resolveBaseUrl(baseUrl: string | undefined): string {
  const value = (baseUrl ?? import.meta.env.VITE_API_BASE_URL)?.trim();

  if (!value) {
    throw new ApiError({
      kind: "configuration",
      message: "A variável VITE_API_BASE_URL não está definida.",
    });
  }

  return value.replace(/\/+$/, "");
}

function buildUrl(baseUrl: string, path: string, query: ApiQuery | undefined): string {
  if (!path.startsWith("/")) {
    throw new ApiError({
      kind: "configuration",
      message: "O caminho da requisição deve começar com /.",
    });
  }

  const url = new URL(`${baseUrl}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

function buildHeaders(options: ApiRequestOptions, hasJsonBody: boolean): Headers {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  return headers;
}

async function readBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch (error) {
    throw new ApiError({
      kind: "network",
      status: response.status,
      message: error instanceof Error ? error.message : "Não foi possível ler a resposta.",
    });
  }
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  async function request<T>(path: string, requestOptions: ApiRequestOptions = {}): Promise<T> {
    const baseUrl = resolveBaseUrl(options.baseUrl);
    const method = requestOptions.method ?? "GET";
    const hasBody = requestOptions.body !== undefined;
    const jsonBody = hasBody && typeof requestOptions.body !== "string";

    let response: Response;
    try {
      response = await fetch(buildUrl(baseUrl, path, requestOptions.query), {
        method,
        headers: buildHeaders(requestOptions, jsonBody),
        body: hasBody
          ? jsonBody
            ? JSON.stringify(requestOptions.body)
            : String(requestOptions.body)
          : undefined,
        signal: requestOptions.signal,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError({
        kind: "network",
        message: error instanceof Error ? error.message : "Falha de rede ao contactar a API.",
      });
    }

    const raw = await readBody(response);

    if (!response.ok) {
      throw parseErrorResponse(response.status, raw);
    }

    if (response.status === 204 || raw.trim() === "") {
      return undefined as T;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new ApiError({
        kind: "invalid-json",
        status: response.status,
        message: "A resposta de sucesso não contém JSON válido.",
        responseBody: raw,
      });
    }
  }

  return {
    request,
    get: (path, requestOptions) => request(path, { ...requestOptions, method: "GET" }),
    post: (path, requestOptions) => request(path, { ...requestOptions, method: "POST" }),
    put: (path, requestOptions) => request(path, { ...requestOptions, method: "PUT" }),
    patch: (path, requestOptions) => request(path, { ...requestOptions, method: "PATCH" }),
    delete: (path, requestOptions) => request(path, { ...requestOptions, method: "DELETE" }),
  };
}

export const api = createApiClient();
