"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchHealth, fetchModelsStatus } from "@/services/system";

export const systemQueryKeys = {
  health: ["system", "health"] as const,
  models: ["system", "models"] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: systemQueryKeys.health,
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: 30_000,
  });
}

export function useModelsStatus() {
  return useQuery({
    queryKey: systemQueryKeys.models,
    queryFn: ({ signal }) => fetchModelsStatus(signal),
    refetchInterval: 60_000,
  });
}
