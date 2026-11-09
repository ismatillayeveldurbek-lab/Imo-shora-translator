import { z } from "zod";

/** Runtime schemas mirroring backend/app/schemas. Responses are validated, not trusted. */

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  version: z.string(),
  environment: z.string(),
  database: z.enum(["ok", "unavailable"]),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const capabilityNameSchema = z.enum([
  "sign_recognition",
  "speech_recognition",
]);
export type CapabilityName = z.infer<typeof capabilityNameSchema>;

export const capabilityStateSchema = z.enum([
  "not_configured",
  "unavailable",
  "ready",
]);
export type CapabilityState = z.infer<typeof capabilityStateSchema>;

export const capabilityStatusSchema = z.object({
  capability: capabilityNameSchema,
  status: capabilityStateSchema,
  reason: z.string(),
  model: z
    .object({
      model_name: z.string(),
      model_version: z.string(),
      task: z.string(),
      class_count: z.number().int().nonnegative(),
      artifact_present: z.boolean(),
    })
    .nullable()
    .optional(),
});
export type CapabilityStatus = z.infer<typeof capabilityStatusSchema>;

export const modelsStatusResponseSchema = z.object({
  capabilities: z.array(capabilityStatusSchema),
});
export type ModelsStatusResponse = z.infer<typeof modelsStatusResponseSchema>;

// ---- Dictionary ----

export const categoryRefSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const signSummarySchema = z.object({
  id: z.uuid(),
  gloss: z.string(),
  uzbek_label: z.string(),
  category: categoryRefSchema.nullable(),
  language_variant: z.object({ code: z.string(), name: z.string() }),
  is_dynamic: z.boolean(),
  has_video: z.boolean(),
  is_test_data: z.boolean(),
});
export type SignSummary = z.infer<typeof signSummarySchema>;

export const signVideoSchema = z.object({
  id: z.uuid(),
  url: z.string().nullable(),
  duration_ms: z.number().int().positive(),
  video_format: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  is_primary: z.boolean(),
});
export type SignVideo = z.infer<typeof signVideoSchema>;

export const signDetailSchema = signSummarySchema.extend({
  description: z.string().nullable(),
  verification_status: z.string(),
  videos: z.array(signVideoSchema),
  updated_at: z.string(),
});
export type SignDetail = z.infer<typeof signDetailSchema>;

export const signPageSchema = z.object({
  items: z.array(signSummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total_pages: z.number().int().nonnegative(),
});
export type SignPage = z.infer<typeof signPageSchema>;

export const categoryWithCountSchema = categoryRefSchema.extend({
  sign_count: z.number().int().nonnegative(),
});
export type CategoryWithCount = z.infer<typeof categoryWithCountSchema>;

// ---- Translation ----

export const MAX_TRANSLATION_TEXT_LENGTH = 500;

export const translatedSignSchema = z.object({
  id: z.uuid(),
  gloss: z.string(),
  uzbek_label: z.string(),
  is_test_data: z.boolean(),
  video: z
    .object({
      url: z.string().nullable(),
      duration_ms: z.number(),
      video_format: z.string(),
    })
    .nullable(),
});
export type TranslatedSign = z.infer<typeof translatedSignSchema>;

export const segmentSchema = z.object({
  type: z.enum(["sign", "unmatched"]),
  text: z.string(),
  normalized: z.string(),
  start: z.number().int(),
  end: z.number().int(),
  sign: translatedSignSchema.nullable().optional(),
});
export type Segment = z.infer<typeof segmentSchema>;

export const textToSignResponseSchema = z.object({
  method: z.literal("dictionary_lookup"),
  input_text: z.string(),
  language_variant: z.object({ code: z.string(), name: z.string() }).nullable(),
  segments: z.array(segmentSchema),
  matched_count: z.number().int().nonnegative(),
  unmatched_count: z.number().int().nonnegative(),
  unmatched_words: z.array(z.string()),
});
export type TextToSignResponse = z.infer<typeof textToSignResponseSchema>;
