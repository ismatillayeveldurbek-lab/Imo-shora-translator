import { z } from "zod";

import { apiRequest } from "@/services/api-client";
import {
  categoryWithCountSchema,
  signDetailSchema,
  signPageSchema,
} from "@/types/api";

export type SignListParams = {
  q?: string;
  category?: string;
  letter?: string;
  page?: number;
  pageSize?: number;
};

export const DICTIONARY_PAGE_SIZE = 24;

export function buildSignListPath(params: SignListParams): string {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.category) search.set("category", params.category);
  if (params.letter) search.set("letter", params.letter);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  search.set("page_size", String(params.pageSize ?? DICTIONARY_PAGE_SIZE));
  return `/api/signs?${search.toString()}`;
}

export function fetchSigns(params: SignListParams, signal?: AbortSignal) {
  return apiRequest(buildSignListPath(params), signPageSchema, { signal });
}

export function fetchSign(id: string, signal?: AbortSignal) {
  return apiRequest(`/api/signs/${encodeURIComponent(id)}`, signDetailSchema, {
    signal,
  });
}

export function fetchCategories(signal?: AbortSignal) {
  return apiRequest("/api/categories", z.array(categoryWithCountSchema), {
    signal,
  });
}
