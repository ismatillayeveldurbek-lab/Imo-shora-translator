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
