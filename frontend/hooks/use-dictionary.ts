"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  fetchCategories,
  fetchSign,
  fetchSigns,
  type SignListParams,
} from "@/services/dictionary";

export const dictionaryKeys = {
  list: (params: SignListParams) => ["dictionary", "list", params] as const,
  detail: (id: string) => ["dictionary", "detail", id] as const,
  categories: ["dictionary", "categories"] as const,
};

export function useSigns(params: SignListParams) {
  return useQuery({
    queryKey: dictionaryKeys.list(params),
    queryFn: ({ signal }) => fetchSigns(params, signal),
    // Keep showing the previous results while the next page/filter loads.
    placeholderData: keepPreviousData,
  });
}

export function useSign(id: string) {
  return useQuery({
    queryKey: dictionaryKeys.detail(id),
    queryFn: ({ signal }) => fetchSign(id, signal),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: dictionaryKeys.categories,
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: 5 * 60_000,
  });
}
