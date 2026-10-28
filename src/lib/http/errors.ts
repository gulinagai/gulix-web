export type ApiErrorKind =
  | "http"
  | "network"
  | "invalid-json"
  | "empty"
  | "unexpected"
  | "configuration";

type ApiErrorDetails = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  error?: string;
  path?: string;
  timestamp?: string;
  fields?: Record<string, string>;
  responseBody?: string;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly error?: string;
  readonly path?: string;
  readonly timestamp?: string;
  readonly fields?: Record<string, string>;
  readonly responseBody?: string;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = "ApiError";
    this.kind = details.kind;
    this.status = details.status;
    this.error = details.error;
    this.path = details.path;
    this.timestamp = details.timestamp;
    this.fields = details.fields;
    this.responseBody = details.responseBody;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === "string");
}

export function parseErrorResponse(status: number, raw: string): ApiError {
  if (raw.trim() === "") {
    return new ApiError({
      kind: "empty",
      status,
      message: `A resposta HTTP ${status} não possui corpo.`,
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new ApiError({
      kind: "invalid-json",
      status,
      message: "A resposta de erro não contém JSON válido.",
      responseBody: raw,
    });
  }

  if (!isRecord(parsed)) {
    return new ApiError({
      kind: "unexpected",
      status,
      message: "A resposta de erro tem um formato inesperado.",
      responseBody: raw,
    });
  }

  const message = typeof parsed.message === "string" ? parsed.message : undefined;
  const error = typeof parsed.error === "string" ? parsed.error : undefined;
  const path = typeof parsed.path === "string" ? parsed.path : undefined;
  const timestamp = typeof parsed.timestamp === "string" ? parsed.timestamp : undefined;
  const fields = isStringRecord(parsed.fields) ? parsed.fields : undefined;
  const hasFields = "fields" in parsed;

  if (hasFields && fields && message) {
    return new ApiError({
      kind: "http",
      status,
      message,
      error,
      path,
      timestamp,
      fields,
      responseBody: raw,
    });
  }

  if (!hasFields && message) {
    return new ApiError({
      kind: "http",
      status,
      message,
      error,
      path,
      timestamp,
      responseBody: raw,
    });
  }

  return new ApiError({
    kind: "unexpected",
    status,
    message: message ?? "A resposta de erro tem um formato inesperado.",
    error,
    path,
    timestamp,
    responseBody: raw,
  });
}
