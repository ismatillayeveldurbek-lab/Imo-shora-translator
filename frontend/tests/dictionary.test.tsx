import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DictionaryBrowser } from "@/features/dictionary/dictionary-browser";
import { SignDetailView } from "@/features/dictionary/sign-detail-view";
import { buildSignListPath } from "@/services/dictionary";
import type { SignDetail, SignPage, SignSummary } from "@/types/api";

import { jsonResponse, renderWithQuery, stubFetch } from "./helpers";
import { navigation } from "./navigation-mock";

const sign: SignSummary = {
  id: "7b5e2c1e-4f0a-4c41-9f1f-3d0c1e9b2a11",
  gloss: "SALOM",
  uzbek_label: "salom",
  category: { name: "Salomlashish", slug: "salomlashish" },
  language_variant: { code: "v", name: "Variant" },
  is_dynamic: true,
  has_video: true,
  is_test_data: false,
};

function page(items: SignSummary[], extra: Partial<SignPage> = {}): SignPage {
  return {
    items,
    total: items.length,
    page: 1,
    page_size: 24,
    total_pages: 1,
    ...extra,
  };
}

const categories = [
  { name: "Salomlashish", slug: "salomlashish", sign_count: 1 },
];

describe("buildSignListPath", () => {
  it("omits empty filters and the first page", () => {
    expect(buildSignListPath({ q: "  ", page: 1 })).toBe(
      "/api/signs?page_size=24",
    );
    expect(buildSignListPath({ q: "o‘zbek", letter: "o'", page: 2 })).toBe(
      "/api/signs?q=o%E2%80%98zbek&letter=o%27&page=2&page_size=24",
    );
  });
});

describe("DictionaryBrowser", () => {
  it("renders results with a live count and links to the detail page", async () => {
    stubFetch({
      "/api/signs": () => jsonResponse(page([sign])),
      "/api/categories": () => jsonResponse(categories),
    });
    navigation.reset("/dictionary");
    renderWithQuery(<DictionaryBrowser />);

    expect(
      await screen.findByText("1 ta imo-ishora topildi"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /salom/ })).toHaveAttribute(
      "href",
      `/dictionary/${sign.id}`,
    );
    expect(
      await screen.findByRole("option", { name: "Salomlashish (1)" }),
    ).toBeInTheDocument();
  });

  it("explains an empty dictionary without inventing content", async () => {
    stubFetch({
      "/api/signs": () => jsonResponse(page([])),
      "/api/categories": () => jsonResponse([]),
    });
    navigation.reset("/dictionary");
    renderWithQuery(<DictionaryBrowser />);
    expect(
      await screen.findByText("Lug‘at hozircha bo‘sh"),
    ).toBeInTheDocument();
  });

  it("offers to clear filters when a filtered search finds nothing", async () => {
    const fetchMock = stubFetch({
      "/api/signs": () => jsonResponse(page([])),
      "/api/categories": () => jsonResponse([]),
    });
    navigation.reset("/dictionary", "letter=sh&q=xyz");
    renderWithQuery(<DictionaryBrowser />);

    expect(await screen.findByText("Hech narsa topilmadi")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Filtrlarni tozalash" }),
    ).toHaveAttribute("href", "/dictionary");
    expect(screen.getByRole("link", { name: "Sh harfi" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    const requested = String(
      fetchMock.mock.calls.find(([url]) => String(url).includes("/signs"))?.[0],
    );
    expect(requested).toContain("letter=sh");
    expect(requested).toContain("q=xyz");
  });

  it("debounces typing into a URL update and resets the page", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    stubFetch({
      "/api/signs": () => jsonResponse(page([sign])),
      "/api/categories": () => jsonResponse(categories),
    });
    navigation.reset("/dictionary", "page=3");
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithQuery(<DictionaryBrowser />);

    await user.type(
      screen.getByRole("searchbox", { name: "Qidirish" }),
      "salom",
    );
    expect(navigation.replace).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith("/dictionary?q=salom", {
      scroll: false,
    });
    vi.useRealTimers();
  });

  it("shows a retryable error state", async () => {
    stubFetch({
      "/api/signs": () =>
        jsonResponse({ error: { code: "internal_error", message: "x" } }, 500),
      "/api/categories": () => jsonResponse([]),
    });
    renderWithQuery(<DictionaryBrowser />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Lug‘atni yuklab bo‘lmadi",
    );
    expect(
      screen.getByRole("button", { name: "Qayta urinish" }),
    ).toBeInTheDocument();
  });
});

describe("SignDetailView", () => {
  const detail: SignDetail = {
    ...sign,
    description: "Salomlashish uchun.",
    verification_status: "verified",
    updated_at: "2026-11-01T10:00:00Z",
    videos: [
      {
        id: "0b5e2c1e-4f0a-4c41-9f1f-3d0c1e9b2a11",
        url: "https://media.example/salom.mp4",
        duration_ms: 1500,
        video_format: "mp4",
        width: null,
        height: null,
        is_primary: true,
      },
    ],
  };

  it("shows the video with a text equivalent and playback controls", async () => {
    stubFetch({ [`/api/signs/${sign.id}`]: () => jsonResponse(detail) });
    renderWithQuery(<SignDetailView id={sign.id} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "salom" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gloss: SALOM")).toBeInTheDocument();
    expect(
      screen.getByLabelText("“salom” imo-ishorasi videosi"),
    ).toHaveAttribute("src", "https://media.example/salom.mp4");
    expect(screen.getByRole("combobox", { name: "Tezlik" })).toHaveValue("1");
    expect(
      screen.getByText("Mutaxassis tomonidan tasdiqlangan"),
    ).toBeInTheDocument();
  });

  it("explains when media hosting is not configured", async () => {
    const noHosting = {
      ...detail,
      videos: [{ ...detail.videos[0]!, url: null }],
    };
    stubFetch({ [`/api/signs/${sign.id}`]: () => jsonResponse(noHosting) });
    renderWithQuery(<SignDetailView id={sign.id} />);
    expect(
      await screen.findByText(/media xosting sozlanmagan/),
    ).toBeInTheDocument();
  });

  it("marks test data and missing videos explicitly", async () => {
    const fixture = {
      ...detail,
      is_test_data: true,
      has_video: false,
      videos: [],
    };
    stubFetch({ [`/api/signs/${sign.id}`]: () => jsonResponse(fixture) });
    renderWithQuery(<SignDetailView id={sign.id} />);
    expect(await screen.findByText("Bu test yozuvi")).toBeInTheDocument();
    expect(
      screen.getByText(/tasdiqlangan video hali qo‘shilmagan/),
    ).toBeInTheDocument();
  });

  it("shows a not-found state for unknown or unpublished signs", async () => {
    stubFetch({
      [`/api/signs/${sign.id}`]: () =>
        jsonResponse(
          { error: { code: "not_found", message: "Sign not found" } },
          404,
        ),
    });
    renderWithQuery(<SignDetailView id={sign.id} />);
    expect(await screen.findByText("Imo-ishora topilmadi")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Lug‘atga qaytish/ }),
    ).toHaveAttribute("href", "/dictionary");
  });
});
