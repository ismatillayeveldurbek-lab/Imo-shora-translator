import { apiRequest } from "@/services/api-client";
import { textToSignResponseSchema } from "@/types/api";

export function translateTextToSign(text: string, variant?: string) {
  return apiRequest("/api/translate/text-to-sign", textToSignResponseSchema, {
    method: "POST",
    body: variant ? { text, variant } : { text },
  });
}
