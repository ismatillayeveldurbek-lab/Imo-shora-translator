import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SystemStatus } from "@/features/home/system-status";

import { jsonResponse, renderWithQuery, stubFetch } from "./helpers";

const healthy = {
  status: "ok",
  version: "0.1.0",
  environment: "test",
  database: "ok",
};
const notConfigured = {
  capabilities: [
    {
      capability: "sign_recognition",
      status: "not_configured",
      reason: "x",
      model: null,
    },
    {
      capability: "speech_recognition",
      status: "not_configured",
      reason: "y",
      model: null,
    },
  ],
};

describe("SystemStatus", () => {
  it("shows a loading state, then real backend and model states", async () => {
    stubFetch({
      "/api/health": () => jsonResponse(healthy),
      "/api/models/status": () => jsonResponse(notConfigured),
    });
    renderWithQuery(<SystemStatus />);

    expect(screen.getByLabelText("Holat yuklanmoqda")).toBeInTheDocument();
    expect(await screen.findByText("Ishlamoqda")).toBeInTheDocument();
    expect(screen.getByText("Ulangan")).toBeInTheDocument();
    // Models are not trained yet: the UI must say so rather than claim readiness.
    expect(screen.getAllByText("Sozlanmagan")).toHaveLength(2);
    expect(screen.queryByText("Tayyor")).not.toBeInTheDocument();
  });

  it("shows an explicit error when the backend is unreachable", async () => {
    stubFetch({
      "/api/health": () => {
        throw new TypeError("Failed to fetch");
      },
      "/api/models/status": () => {
        throw new TypeError("Failed to fetch");
      },
    });
    renderWithQuery(<SystemStatus />);

    expect(await screen.findByText("Ulanmadi")).toBeInTheDocument();
    expect(
      screen.getAllByText("Serverga ulanib bo‘lmadi.").length,
    ).toBeGreaterThan(0);
  });

  it("reports an unavailable database", async () => {
    stubFetch({
      "/api/health": () =>
        jsonResponse(
          { ...healthy, status: "degraded", database: "unavailable" },
          503,
        ),
      "/api/models/status": () => jsonResponse(notConfigured),
    });
    renderWithQuery(<SystemStatus />);
    expect(await screen.findByText("Mavjud emas")).toBeInTheDocument();
  });
});
