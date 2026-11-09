import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";

export function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Stub fetch with a handler keyed by URL pathname. */
export function stubFetch(
  routes: Record<string, () => Response | Promise<Response>>,
) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(
      input instanceof Request ? input.url : input.toString(),
    );
    const handler = routes[url.pathname];
    if (!handler) throw new TypeError(`Unexpected request: ${url.pathname}`);
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
