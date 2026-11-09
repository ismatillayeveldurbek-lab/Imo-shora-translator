import type { z } from "zod";

import { publicEnv } from "@/lib/env";
import { errorResponseSchema } from "@/types/api";

/** Error raised for any failed API call. `status` is 0 for network failures. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** HTTP statuses whose body is still a valid payload (e.g. 503 from /api/health). */
  acceptStatuses?: number[];
};

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * User-facing Uzbek messages for backend error codes. Backend messages are
 * English and meant for operators, so they are never shown to users directly.
 */
const ERROR_MESSAGES: Record<string, string> = {
  database_unavailable:
    "Ma’lumotlar bazasi vaqtincha ishlamayapti. Birozdan so‘ng urinib ko‘ring.",
  service_unavailable:
    "Xizmat vaqtincha ishlamayapti. Birozdan so‘ng urinib ko‘ring.",
  internal_error: "Serverda kutilmagan xatolik yuz berdi.",
  rate_limited: "So‘rovlar juda ko‘p. Birozdan so‘ng urinib ko‘ring.",
  payload_too_large: "Yuborilgan ma’lumot hajmi juda katta.",
  validation_error: "Kiritilgan ma’lumotlar noto‘g‘ri.",
  not_found: "So‘ralgan ma’lumot topilmadi.",
  unauthorized: "Tizimga kirishingiz kerak.",
  forbidden: "Bu amal uchun ruxsatingiz yo‘q.",
  variant_required:
    "Bir nechta imo-ishora tili varianti mavjud. Iltimos, birini tanlang.",
  unknown_variant: "Tanlangan imo-ishora tili varianti topilmadi.",
  variant_misconfigured:
    "Server sozlamalarida til varianti noto‘g‘ri ko‘rsatilgan.",
};

export function userMessageForStatus(code: string, status: number): string {
  return ERROR_MESSAGES[code] ?? `So‘rov bajarilmadi (${status}).`;
}

export async function apiRequest<S extends z.ZodType>(
  path: string,
  schema: S,
  options: RequestOptions = {},
): Promise<z.infer<S>> {
  const {
    method = "GET",
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    acceptStatuses = [],
  } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(new URL(path, publicEnv.NEXT_PUBLIC_API_URL), {
      method,
      signal: combined,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    if (signal?.aborted) throw cause; // caller cancelled: propagate as-is
    const timedOut = timeout.aborted;
    throw new ApiError(
      0,
      timedOut ? "timeout" : "network_error",
      timedOut
        ? "Server javob bermadi (vaqt tugadi)."
        : "Serverga ulanib bo‘lmadi.",
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok && !acceptStatuses.includes(response.status)) {
    const parsedError = errorResponseSchema.safeParse(payload);
    if (parsedError.success) {
      const { code, details } = parsedError.data.error;
      throw new ApiError(
        response.status,
        code,
        userMessageForStatus(code, response.status),
        details,
      );
    }
    throw new ApiError(
      response.status,
      "http_error",
      `So‘rov bajarilmadi (${response.status}).`,
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      "invalid_response",
      "Server kutilmagan javob qaytardi.",
    );
  }
  return parsed.data;
}
