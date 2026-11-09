import { apiRequest } from "@/services/api-client";
import { healthResponseSchema, modelsStatusResponseSchema } from "@/types/api";

export function fetchHealth(signal?: AbortSignal) {
  // 503 still carries a valid health body describing what is degraded.
  return apiRequest("/api/health", healthResponseSchema, {
    signal,
    acceptStatuses: [503],
  });
}

export function fetchModelsStatus(signal?: AbortSignal) {
  return apiRequest("/api/models/status", modelsStatusResponseSchema, {
    signal,
  });
}
