import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApiError, apiRequest } from "@/services/api-client";
import { fetchHealth } from "@/services/system";

import { jsonResponse, stubFetch } from "./helpers";

const schema = z.object({ value: z.number() });

describe("apiRequest", () => {
  it("returns schema-validated data and targets the configured API origin", async () => {
    const fetchMock = stubFetch({
      "/api/thing": () => jsonResponse({ value: 1 }),
    });
    await expect(apiRequest("/api/thing", schema)).resolves.toEqual({
      value: 1,
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://api.test/api/thing",
    );
  });

  it("maps structured backend errors to ApiError", async () => {
    stubFetch({
      "/api/thing": () =>
        jsonResponse(
          { error: { code: "not_found", message: "Topilmadi", details: null } },
          404,
        ),
    });
    const error = await apiRequest("/api/thing", schema).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: "not_found",
      message: "Topilmadi",
    });
  });

  it("rejects responses that do not match the schema", async () => {
    stubFetch({ "/api/thing": () => jsonResponse({ value: "not a number" }) });
    await expect(apiRequest("/api/thing", schema)).rejects.toMatchObject({
      code: "invalid_response",
    });
  });

  it("reports network failures with status 0", async () => {
    stubFetch({
      "/api/thing": () => {
        throw new TypeError("Failed to fetch");
      },
    });
    const error = await apiRequest("/api/thing", schema).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isNetworkError).toBe(true);
  });

  it("accepts a degraded 503 health body instead of throwing", async () => {
    stubFetch({
      "/api/health": () =>
        jsonResponse(
          {
            status: "degraded",
            version: "0.1.0",
            environment: "test",
            database: "unavailable",
          },
          503,
        ),
    });
    await expect(fetchHealth()).resolves.toMatchObject({
      database: "unavailable",
    });
  });
});
