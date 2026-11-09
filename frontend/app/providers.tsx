"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/services/api-client";

function shouldRetry(failureCount: number, error: Error): boolean {
  // Do not retry client errors (4xx); they will not succeed on retry.
  if (error instanceof ApiError && error.status >= 400 && error.status < 500)
    return false;
  return failureCount < 2;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: shouldRetry,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
